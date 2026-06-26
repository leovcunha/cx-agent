# Portfolio Presentation Strategy

This document provides guidance on how to present this stateful, SOP-driven AI customer support agent project to potential employers or clients.

---

## 1. Core Technical Value Prop

*   **Real-World RAG Challenges (Lengthy Documents):** Highlighting the use of 5-page-long SOP documents for each scenario showcases how you handle realistic document length, semantic chunking, and similarity search queries. Standard RAG often struggles when documents are long and unstructured.
*   **Zero-Cost Local Embedding Pipeline:** Explain how the seeding pipeline runs the `all-MiniLM-L6-v2` model locally using Python (`sentence-transformers`), storing the results in **Supabase pgvector**. This shows resource consciousness and optimization of infrastructure costs.
*   **Stateful Agent Workflows (LangGraph):** Rather than using simple linear chains (like standard LangChain agents or OpenAI Assistants), this agent uses a state graph (LangGraph). Explain that customer support troubleshooting is naturally iterative: the agent must gather information step-by-step, ask clarifying questions, apply condition-based policies, check external states, and execute decisions.
*   **Dynamic Business Configuration:** Emphasize that the agent is fully decoupled from the business logic. Swapping the industry (e.g. from E-Commerce to Credit Card disputes) requires zero code changes to the underlying LangGraph; it merely reads the corresponding configuration and SOP context from the database.

---

## 2. Interactive Scenarios Demostrated

The portfolio provides 4 preloaded scenarios that visitors can try immediately:
1.  **E-Commerce Support:** Demonstrates handling order tracking, return eligibility dates, and triggering refunds/replacements based on order value thresholds.
2.  **Credit Card Disputes:** Demonstrates security-focused customer interaction, card lock procedures, fraud reporting, and strict eligibility checks for waiver policies.
3.  **Internet Provider Troubleshooting:** Demonstrates a step-by-step technical diagnosis path (power cycle -> led check -> regional outage lookups) before scheduling a technician.
4.  **E-Learning Platform Help Desk:** Demonstrates validating completion criteria (video hours and quiz scores) before issuing course certificates.

---

## 3. Interview Talking Points

*   *Question:* **"Why did you use LangGraph instead of standard OpenAI Assistants?"**
    *   *Answer:* "Standard assistant APIs are black-box and linear. In a real enterprise setting, support processes are governed by strict SOP compliance. By using LangGraph, we can explicitly define state transitions, enforce guardrails (like the Triage node to block off-topic queries), and guarantee that the LLM follows the structured steps of the retrieved company policies."
*   *Question:* **"How is user conversation history separated?"**
    *   *Answer:* "We provision a background guest user session in Supabase Auth. The conversation history is stored in the `messages` table, isolated by both the guest's unique ID and the scenario's `tenant_id`."
