import os
import json
import logging
from typing import Dict, Any
from langchain_core.messages import AIMessage
from api.agents.state import AgentState

log = logging.getLogger(__name__)

def resolution_node(state: AgentState) -> Dict[str, Any]:
    """Execute final resolution or handle off-topic redirects."""
    log.info("Executing resolution node")
    
    intent = state.get("current_intent")
    
    # Load localized responses
    root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    responses_path = os.path.join(root_dir, "locales", "en", "responses.json")
    
    off_topic_reply = "I can only help with customer service inquiries regarding our platform. How can I help you with your account or product today?"
    
    if os.path.exists(responses_path):
        try:
            with open(responses_path, "r", encoding="utf-8") as f:
                resps = json.load(f)
                off_topic_reply = resps.get("off_topic_response", off_topic_reply)
        except Exception as e:
            log.error(f"Error loading responses.json: {e}")
            
    if intent == "off-topic":
        log.info("Query is off-topic. Returning localized redirect response.")
        response_msg = AIMessage(content=off_topic_reply)
        return {"messages": [response_msg]}
        
    return {}
