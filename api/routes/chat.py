import logging
import os

from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import JSONResponse

from api.message_service import get_agent_response
from api.schemas.schema import WebChatMessage, ChatResponse
from api.utils.supabase_client import (
    fetch_last_n_messages,
    save_message_to_supabase,
    fetch_business_details,
    get_tenant_id_from_jwt,
)


log = logging.getLogger(__name__)

router = APIRouter()


from typing import Optional

from fastapi import BackgroundTasks
from api.agents.evaluator import evaluate_message_async

@router.post("/api/chat", response_model=ChatResponse)
async def handle_web_chat(
    message: WebChatMessage, 
    background_tasks: BackgroundTasks,
    authorization: Optional[str] = Header(None)
):
    log.info(f"Processing web chat message for client ID: {message.client_id}")

    if not os.environ.get("SUPABASE_URL"):
        return JSONResponse({"error": "Configuration error"}, status_code=500)

    if message.tenant_id:
        tenant_id = message.tenant_id
    else:
        tenant_id = await get_tenant_id_from_jwt(authorization)
        
    if not tenant_id:
        raise HTTPException(status_code=401, detail="Unauthorized or invalid token")

    biz_details = await fetch_business_details(tenant_id)
    if not biz_details:
        tenant_id = "default_business"
        biz_details = await fetch_business_details(tenant_id)
        if not biz_details:
            return JSONResponse({"error": "Business profile not found"}, status_code=404)

    is_intro = message.message == "[AI_INTRO_REQUEST]"
    user_msg = "Hello" if is_intro else message.message

    conversation_history = await fetch_last_n_messages(
        client_id=message.client_id, tenant_id=tenant_id, limit=20
    )

    if not is_intro:
        try:
            await save_message_to_supabase(
                client_id=message.client_id,
                tenant_id=tenant_id,
                sender="user",
                text=message.message,
            )
        except Exception as e:
            log.error(f"Failed to save user message: {e}")
            return JSONResponse({"error": "Failed to save user message"}, status_code=500)

    cleaned_response, retrieved_context = await get_agent_response(
        user_message=user_msg,
        client_id=message.client_id,
        tenant_id=tenant_id,
        conversation_history=conversation_history,
    )

    try:
        db_res = await save_message_to_supabase(
            client_id=message.client_id,
            tenant_id=tenant_id,
            sender="ai",
            text=cleaned_response,
        )
        
        # Trigger background evaluation if we have a valid message ID
        if db_res and len(db_res) > 0 and "id" in db_res[0]:
            ai_msg_id = db_res[0]["id"]
            background_tasks.add_task(
                evaluate_message_async,
                message_id=ai_msg_id,
                tenant_id=tenant_id,
                user_query=user_msg,
                ai_response=cleaned_response,
                retrieved_context=retrieved_context
            )
            
    except Exception as e:
        log.error(f"Failed to save AI response: {e}", exc_info=True)
        return JSONResponse({"error": "Failed to save AI response"}, status_code=500)

    return {"response": cleaned_response}
