import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, AIMessage

from api.utils.supabase_client import (
    fetch_last_n_messages,
    save_message_to_supabase,
    fetch_business_details
)
from api.agents.graph import build_customer_service_graph

log = logging.getLogger(__name__)

async def get_agent_response(
    user_message: str,
    client_id: str,
    tenant_id: str = "default_business",
    conversation_history: Optional[List[Dict]] = None,
) -> str:
    """Run one graph turn for the Customer Service Agent."""
    if conversation_history is None:
        conversation_history = []
        
    log.info("Using Customer Service LangGraph workflow for client %s", client_id)
    
    # Convert DB rows to LangChain message types
    messages = []
    for msg in conversation_history:
        sender = msg.get("sender")
        text = str(msg.get("text", ""))
        if sender == "user":
            messages.append(HumanMessage(content=text))
        elif sender == "ai":
            messages.append(AIMessage(content=text))
            
    # Add the current user message
    messages.append(HumanMessage(content=user_message))
    
    # Initialize the state
    state = {
        "messages": messages,
        "tenant_id": tenant_id,
        "current_intent": "",
        "retrieved_context": "",
        "collected_info": {}
    }
    
    try:
        graph = build_customer_service_graph()
        # Invoke the graph (note: this requires the graph to be async if it has async nodes, 
        # but right now our placeholders are sync so we can use invoke or ainvoke)
        # Using ainvoke in case we add async logic later.
        result = await graph.ainvoke(state)
        
        # The result state should contain the new messages
        final_messages = result.get("messages", [])
        if final_messages:
            return final_messages[-1].content
        else:
            return "No response generated."
            
    except Exception as e:
        log.error("Error running workflow: %s", e, exc_info=True)
        return "Sorry, I encountered an error while processing your request."

async def respond_and_send_message(user_message: str, client_id: str, tenant_id: str = "default_business"):
    """Process an inbound message end-to-end."""
    try:
        if not client_id:
            log.error("Missing client_id for message handling.")
            return

        # 1. Fetch history
        conversation_history = await fetch_last_n_messages(client_id, tenant_id, limit=10)
        
        # 2. Persist user message
        await save_message_to_supabase(client_id, tenant_id, "user", user_message)
        
        # 3. Generate response
        response_text = await get_agent_response(user_message, client_id, tenant_id, conversation_history)
        
        # 4. Persist AI message
        await save_message_to_supabase(client_id, tenant_id, "ai", response_text)
        
        # 5. Delivery (e.g. via WebSocket, HTTP response, or WhatsApp if we still supported it)
        log.info("Successfully processed response: %s", response_text)
        return response_text
        
    except Exception as e:
        log.error(f"A service error occurred while processing message: {e}")
        return "An internal error occurred."
