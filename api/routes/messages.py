import logging
import os

from fastapi import APIRouter, Header, HTTPException
from typing import Optional
from fastapi.responses import JSONResponse

from api.schemas.schema import MessagesRequest, MessagesResponse
from api.utils.supabase_client import fetch_last_n_messages, get_tenant_id_from_jwt


log = logging.getLogger(__name__)

router = APIRouter()


@router.post("/api/messages", response_model=MessagesResponse)
async def get_messages(
    body: MessagesRequest,
    authorization: Optional[str] = Header(None),
):
    """Fetch all messages for a client from Supabase, validating caller JWT."""

    if not os.environ.get("SUPABASE_URL"):
        return JSONResponse({"messages": []}, status_code=500)

    if body.tenantId:
        tenant_id = body.tenantId
    else:
        tenant_id = await get_tenant_id_from_jwt(authorization)
        
    if not tenant_id:
        raise HTTPException(status_code=401, detail="Unauthorized or invalid token")

    client_id = body.clientId
    if not client_id or not isinstance(client_id, str) or not client_id.strip():
        return JSONResponse({"error": "Invalid or missing clientId"}, status_code=400)

    try:
        messages = await fetch_last_n_messages(client_id=client_id, tenant_id=tenant_id, limit=50)
        return {"messages": messages}
    except Exception as e:
        log.error("Failed to fetch messages for client %s: %s", client_id, e)
        return JSONResponse({"messages": []}, status_code=500)
