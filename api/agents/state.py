from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage
import operator

class AgentState(TypedDict):
    # The conversation history (messages appended via operator.add)
    messages: Annotated[Sequence[BaseMessage], operator.add]
    
    # Metadata for the current tenant/business to isolate data
    tenant_id: str
    
    # Graph execution state
    current_intent: str
    retrieved_context: str
    
    # Data gathered during the Action Node loop
    collected_info: dict
