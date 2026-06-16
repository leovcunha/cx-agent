from api.agents.state import AgentState
from langchain_core.messages import AIMessage

def action_node(state: AgentState) -> dict:
    # Placeholder for LLM reasoning over SOPs and tool execution
    print("Executing action node")
    
    # Dummy response for now
    response_msg = AIMessage(content="I am processing your request based on SOPs.")
    
    return {"messages": [response_msg]}
