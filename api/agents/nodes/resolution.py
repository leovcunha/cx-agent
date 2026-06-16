from api.agents.state import AgentState
from langchain_core.messages import AIMessage

def resolution_node(state: AgentState) -> dict:
    # Placeholder for closing loop or escalation
    print("Executing resolution node")
    
    if state.get("current_intent") == "off-topic":
        response_msg = AIMessage(content="I'm sorry, but I can only assist with customer service requests for this business.")
        return {"messages": [response_msg]}
    
    return {}
