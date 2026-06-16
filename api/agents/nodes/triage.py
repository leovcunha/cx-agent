from api.agents.state import AgentState

def triage_node(state: AgentState) -> dict:
    # Placeholder for intent classification logic
    # Will classify intent into: product_troubleshooting, account_access, feature_request, general_inquiry, off-topic
    print("Executing triage node")
    
    # Dummy intent for now
    intent = "general_inquiry"
    
    return {"current_intent": intent}
