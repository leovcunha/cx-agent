from langgraph.graph import StateGraph, START, END
from api.agents.state import AgentState
from api.agents.nodes.triage import triage_node
from api.agents.nodes.retrieval import retrieval_node
from api.agents.nodes.action import action_node
from api.agents.nodes.resolution import resolution_node

def route_triage(state: AgentState):
    if state.get("current_intent") == "off-topic":
        return "resolution_node"
    return "retrieval_node"

def route_action(state: AgentState):
    # Add routing logic later (e.g. if resolved or escalated)
    return "resolution_node"

def build_customer_service_graph():
    graph = StateGraph(AgentState)
    
    graph.add_node("triage_node", triage_node)
    graph.add_node("retrieval_node", retrieval_node)
    graph.add_node("action_node", action_node)
    graph.add_node("resolution_node", resolution_node)
    
    # Intake is basically just starting the graph
    graph.add_edge(START, "triage_node")
    
    graph.add_conditional_edges("triage_node", route_triage)
    graph.add_edge("retrieval_node", "action_node")
    graph.add_conditional_edges("action_node", route_action)
    graph.add_edge("resolution_node", END)
    
    return graph.compile()

graph = build_customer_service_graph()
