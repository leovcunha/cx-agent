import logging
import json
import random
import re
from typing import Optional, Dict, Any
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from api.utils.supabase_client import get_http_client, _get_supabase_url, _get_admin_key

log = logging.getLogger(__name__)

# Evaluate 100% of messages for the demo
SAMPLE_RATE = 1.0

EVALUATOR_SYSTEM_PROMPT = """You are a strict compliance evaluator for a customer service AI agent.
Your job is to read the customer's query, the retrieved SOP (Standard Operating Procedure) context, and the AI agent's response.
You must evaluate the AI agent's response and return a strictly formatted JSON object matching this schema:
{
  "sop_adherence_score": int (0-100),
  "policy_violations": ["list of string violations", or empty if none],
  "tone_pass": boolean,
  "hallucination_flag": boolean
}

Rules:
- sop_adherence_score: 100 if perfect. Deduct points for missing information, violations, or bad tone.
- policy_violations: If the AI violates any rule in the SOP, list it here clearly.
- tone_pass: True if the tone is appropriate for a support agent.
- hallucination_flag: True if the AI states policies, rules, or facts that are NOT in the provided SOP context.
"""

async def evaluate_message_async(message_id: str, tenant_id: str, user_query: str, ai_response: str, retrieved_context: str):
    """
    Background task to evaluate an AI's response against the SOP and store it in Supabase.
    This skips evaluation if it doesn't fall within the sampling rate.
    """
    if random.random() > SAMPLE_RATE:
        log.info(f"Skipping evaluation for message {message_id} (Sampling).")
        return

    log.info(f"Evaluating message {message_id} for compliance...")

    prompt = f"Customer Query:\n{user_query}\n\nRetrieved SOP Context:\n{retrieved_context}\n\nAI Response:\n{ai_response}\n\nOutput strict JSON."
    
    try:
        llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.0
        )
        messages = [
            SystemMessage(content=EVALUATOR_SYSTEM_PROMPT),
            HumanMessage(content=prompt)
        ]
        
        response = await llm.ainvoke(messages)
        raw_response = response.content.strip()
        
        # Clean markdown code blocks from JSON
        clean_json = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw_response, flags=re.MULTILINE).strip()
            
        data = json.loads(clean_json)
        
        # Validate and shape the data
        score = int(data.get("sop_adherence_score", 0))
        violations = data.get("policy_violations", [])
        tone = bool(data.get("tone_pass", False))
        hallucination = bool(data.get("hallucination_flag", True)) # Fail safe
        
        # Store in Supabase
        await _save_evaluation(message_id, tenant_id, score, violations, tone, hallucination)
        log.info(f"Successfully evaluated and saved compliance for message {message_id}")
        
    except json.JSONDecodeError:
        log.error("Evaluator returned invalid JSON.")
    except Exception as e:
        log.error(f"Error during message evaluation: {e}", exc_info=True)


async def _save_evaluation(message_id: str, tenant_id: str, score: int, violations: list, tone: bool, hallucination: bool):
    supabase_url = _get_supabase_url()
    supabase_key = _get_admin_key()
    if not supabase_url or not supabase_key:
        return
        
    url = f"{supabase_url}/rest/v1/message_evaluations"
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "message_id": message_id,
        "tenant_id": tenant_id,
        "sop_adherence_score": score,
        "policy_violations": violations,
        "tone_pass": tone,
        "hallucination_flag": hallucination
    }
    
    client = get_http_client()
    resp = await client.post(url, headers=headers, json=payload)
    if resp.status_code >= 400:
        log.error(f"Failed to save evaluation to Supabase: {resp.text}")
