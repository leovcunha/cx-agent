# Customer Service Agent Architecture

## Overview
The Customer Service Agent is built as a stateful graph (using LangGraph or a custom state machine). It is designed to act as a Tier 1 support agent that strictly adheres to Standard Operating Procedures (SOPs). 

## Core Workflow (Graph Nodes)

The agent operates in a continuous loop until the issue is resolved or escalated.

### 1. Intake Node
*   **Purpose:** Receives the initial or follow-up query from the user.
*   **Functionality:** Updates the conversation state with the latest user message.

### 2. Triage Node
*   **Purpose:** Classifies the intent of the user's message and enforces guardrails.
*   **Intents:** `product_troubleshooting`, `account_access`, `feature_request`, `general_inquiry`, `off-topic`.
*   **Security & Scope:** 
    *   Evaluates the query for prompt injection attacks or attempts to "game" the system.
    *   Politely declines and redirects queries that are entirely outside the agent's supported domain.
*   **Output:** The classified intent, which dictates the next node (Retrieval or Direct Action/Escalation).

### 3. Retrieval Node
*   **Purpose:** Fetches relevant Standard Operating Procedures (SOPs) based on the classified intent and conversation history.
*   **Functionality:** Queries the vector database to retrieve the specific policy chunks required to handle the user's issue.

### 4. Action Node
*   **Purpose:** Reasons over the retrieved SOPs and decides on the next action.
*   **Functionality:**
    *   Determines if more information is needed from the user.
    *   **Plug-and-Play Configuration:** To support multiple business types, this node relies on an injected `BusinessProfile` state. This profile dictates available tools (e.g., a "CheckOrderStatus" tool for ecommerce vs. "CheckServerStatus" for a SaaS company). The agent dynamically binds tool definitions based on the active business profile, making the underlying LangGraph logic completely reusable across different domains.

### 5. Resolution / Escalation Node
*   **Purpose:** Closes the loop or hands off to a human agent.
*   **Functionality:**
    *   **Resolution:** If the SOP has been successfully executed and the user is satisfied, mark the ticket as resolved.
    *   **Escalation:** If the SOP dictates escalation, or if the agent cannot resolve the issue after a set number of turns, it triggers an escalation tool (e.g., creating a ticket in Jira/Zendesk and allowing the user to provide final context).

## State Management
The agent will maintain a state object containing:
*   `conversation_history`: List of messages.
*   `current_intent`: The latest classified intent.
*   `retrieved_context`: SOPs fetched from the vector store.
*   `collected_info`: Structured data gathered from the user (e.g., account email, error code).
*   `status`: e.g., `open`, `awaiting_user_input`, `resolved`, `escalated`.

## Technical Implementation: Graph State & Execution Flow

In LangGraph (Python), the state is managed using a `TypedDict`. This object is passed sequentially between the nodes.

```python
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
```

### Graph Edge Flow Definition
The agent's state machine is built with specific routing logic:
*   **START -> Intake:** Always starts here to parse user input.
*   **Intake -> Triage:** Passes the message for intent classification.
*   **Triage -> Conditional Edge:**
    *   If intent == `off-topic`: Route to **Resolution** (Agent replies with off-topic warning and exits loop).
    *   Otherwise: Route to **Retrieval**.
*   **Retrieval -> Action:** Retrieves SOPs and hands off to the LLM.
*   **Action -> Conditional Edge:**
    *   If the LLM calls a tool (e.g., `ask_user_for_info` or `check_status`): Route to tool execution, then loop back to **Action**.
    *   If resolved/escalated: Route to **Resolution** and then **END**.
```
