import os
import logging
from typing import Dict, Any
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, AIMessage
from api.agents.state import AgentState
from api.utils.supabase_client import fetch_business_details

log = logging.getLogger(__name__)

async def action_node(state: AgentState) -> Dict[str, Any]:
    """Execute LLM reasoning over retrieved SOPs using Groq Llama 3."""
    log.info("Executing action node")
    
    tenant_id = state.get("tenant_id") or "default_business"
    biz_details = await fetch_business_details(tenant_id)
    if not biz_details:
        biz_details = {
            "name": "TechFlow Cloud",
            "description": "A cloud infrastructure provider.",
            "escalation_policy": "Escalate if the issue requires database access or involves unverified account access attempts.",
            "tone": "Professional, empathetic, and concise."
        }
        
    business_name = biz_details.get("name", "TechFlow Cloud")
    business_desc = biz_details.get("description", "A cloud infrastructure provider.")
    tone = biz_details.get("tone", "Professional, empathetic, and concise.")
    escalation_policy = biz_details.get("escalation_policy", "Escalate if the issue requires database access.")
    
    retrieved_context = state.get("retrieved_context") or "No specific SOP context found for this query."
    
    # Load system prompt template
    root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    prompt_path = os.path.join(root_dir, "locales", "en", "system_prompt.md")
    
    system_prompt_template = ""
    if os.path.exists(prompt_path):
        with open(prompt_path, "r", encoding="utf-8") as f:
            system_prompt_template = f.read()
    else:
        # Fallback system prompt if file is missing
        system_prompt_template = """# Persona
You are a professional, helpful, and polite Customer Service Agent representing **{business_name}**.
{business_description}"""

    system_prompt = system_prompt_template.format(
        business_name=business_name,
        business_description=business_desc
    )
    
    # Add active context and rules
    system_prompt += f"""

# ACTIVE SOP CONTEXT
Below are the Standard Operating Procedures (SOPs) retrieved from the database for the user's issue:
{retrieved_context}

# CORE DIRECTIVES & INSTRUCTIONS
1. Adhere STRICTLY to the retrieved SOPs. Do not make up policies or invent technical steps that are not in the context.
2. Tone: {tone}
3. Escalation Policy: {escalation_policy}
4. If the SOP requires information from the user (such as their email, VPN status, Web vs Desktop app, or feature use-case description), ask the user for it clearly. ONLY ask for one piece of information at a time.
5. If the SOP indicates that a mock action must be triggered (e.g., 'send_reset_link' or 'log_feature_request') and the user has provided the required information, inform the user that you have executed the action successfully (e.g., "I have triggered the password reset link to your email address").
6. If the SOP dictates escalation, or if the issue requires human intervention, state clearly that you are escalating the ticket to a human support agent.
7. Keep responses concise and focused on the user's current question or the next step in the SOP.
"""

    # Prepare chat history and messages
    messages = state.get("messages", [])
    chat_input = [SystemMessage(content=system_prompt)] + list(messages)
    
    model_name = os.environ.get("GROQ_MODEL", "openai/gpt-oss-120b")
    try:
        llm = ChatGroq(
            model=model_name,
            temperature=0.2
        )
        response = await llm.ainvoke(chat_input)
        ai_msg = AIMessage(content=response.content)
        log.info(f"Action Node generated response: {response.content[:100]}...")
        return {"messages": [ai_msg]}
    except Exception as e:
        log.error(f"Error in action node execution: {e}", exc_info=True)
        return {"messages": [AIMessage(content="I'm sorry, I encountered an error while processing your request. Please try again.")]}
