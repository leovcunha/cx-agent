import logging
import os
from fastapi import APIRouter, HTTPException, Header
from typing import Optional, List
from fastapi.responses import JSONResponse

from api.schemas.evaluations import MessageEvaluation, AggregateComplianceStats
from api.utils.supabase_client import get_http_client, _get_supabase_url, _get_admin_key, get_tenant_id_from_jwt

log = logging.getLogger(__name__)

router = APIRouter()

@router.get("/api/messages/{message_id}/evaluation", response_model=MessageEvaluation)
async def get_message_evaluation(
    message_id: str,
    authorization: Optional[str] = Header(None)
):
    supabase_url = _get_supabase_url()
    supabase_key = _get_admin_key()
    if not supabase_url or not supabase_key:
        return JSONResponse({"error": "Configuration error"}, status_code=500)

    # Basic auth check
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")

    url = f"{supabase_url}/rest/v1/message_evaluations"
    params = {"message_id": f"eq.{message_id}", "select": "*"}
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}"
    }

    client = get_http_client()
    try:
        resp = await client.get(url, headers=headers, params=params)
        resp.raise_for_status()
        data = resp.json()
        if not data:
            raise HTTPException(status_code=404, detail="Evaluation not found")
        return data[0]
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Error fetching evaluation: {e}")
        return JSONResponse({"error": "Failed to fetch evaluation"}, status_code=500)


@router.get("/api/evaluations/{tenant_id}/aggregate", response_model=AggregateComplianceStats)
async def get_aggregate_evaluations(
    tenant_id: str,
    authorization: Optional[str] = Header(None)
):
    supabase_url = _get_supabase_url()
    supabase_key = _get_admin_key()
    if not supabase_url or not supabase_key:
        return JSONResponse({"error": "Configuration error"}, status_code=500)

    # Verify token
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")

    url = f"{supabase_url}/rest/v1/message_evaluations"
    params = {"tenant_id": f"eq.{tenant_id}", "select": "sop_adherence_score,policy_violations,tone_pass,hallucination_flag"}
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}"
    }

    client = get_http_client()
    try:
        resp = await client.get(url, headers=headers, params=params)
        resp.raise_for_status()
        data = resp.json()
        
        total = len(data)
        if total == 0:
            return {
                "tenant_id": tenant_id,
                "total_evaluations": 0,
                "average_sop_adherence": 0.0,
                "total_policy_violations": 0,
                "total_tone_failures": 0,
                "total_hallucinations": 0
            }
            
        total_score = sum(d.get("sop_adherence_score", 0) for d in data)
        total_violations = sum(1 for d in data if d.get("policy_violations") and len(d.get("policy_violations")) > 0)
        total_tone_failures = sum(1 for d in data if not d.get("tone_pass", True))
        total_hallucinations = sum(1 for d in data if d.get("hallucination_flag", False))
        
        return {
            "tenant_id": tenant_id,
            "total_evaluations": total,
            "average_sop_adherence": round(total_score / total, 1),
            "total_policy_violations": total_violations,
            "total_tone_failures": total_tone_failures,
            "total_hallucinations": total_hallucinations
        }

    except Exception as e:
        log.error(f"Error fetching aggregate evaluations: {e}")
        return JSONResponse({"error": "Failed to fetch aggregate evaluations"}, status_code=500)
