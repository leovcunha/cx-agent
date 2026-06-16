from api.agents.state import AgentState

def retrieval_node(state: AgentState) -> dict:
    # Placeholder for SOP retrieval from vector store
    print("Executing retrieval node")
    
    # Dummy context for now
    context = "Here are the SOPs..."
    
    return {"retrieved_context": context}
