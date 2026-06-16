# Portfolio Presentation Strategy

## The Problem You Are Solving
*   **High Support Costs:** Human agents spend a significant amount of time on repetitive Tier 1 support queries.
*   **Inconsistent Adherence to SOPs:** Human error leads to inconsistent application of company policies, especially during complex troubleshooting.
*   **Rigid Chatbots:** Traditional decision-tree chatbots are frustrating for users and cannot handle nuanced problems.

## The Solution: A Stateful, SOP-Driven AI Agent
*   **Why LangGraph/State Machines?** Explain that simple LLM chains (like standard RAG) lose track of complex, multi-step troubleshooting. By using a graph, the agent can cycle between asking questions, evaluating answers, and retrieving new SOPs until resolution.
*   **Domain Adaptability as a Feature:** Highlight the `policy_documents/` ingestion pipeline and dynamic system prompts. This proves you think about software as a reusable product, not just a one-off script.
*   **Safety and Guardrails:** Emphasize the Triage node. Showing that you've thought about prompt injection and off-topic handling demonstrates maturity in building production-ready GenAI applications.

## Key Talking Points for Interviews
1.  **"How does it know what to do?"** -> Explain the combination of the dynamic System Prompt + Vector Retrieval of SOPs.
2.  **"What if it gets confused?"** -> Explain the Escalation Node. A good AI system knows when to fail gracefully and hand off to a human with full context.
3.  **"How do you update it?"** -> Explain the ingestion script that processes new PDFs/docs into the vector store.
