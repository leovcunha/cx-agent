# Customer Service Agent Portfolio

A portfolio demonstration of a plug-and-play full-stack AI Customer Service Agent. This project demonstrates stateful, scenario-based AI interactions using LangGraph.

Instead of a standard linear chatbot, this agent handles complex, multi-step Tier-1 support queries by dynamically retrieving and reasoning over pre-seeded Standard Operating Procedures (SOPs).

## Demo Scenarios
The application is pre-seeded with 4 distinct business scenarios. Each scenario is equipped with a comprehensive, ~5-page policy document to demonstrate realistic Retrieval-Augmented Generation (RAG) capabilities:
1. **E-Commerce Support**: Order tracking, strict return policies, and damaged item procedures.
2. **Credit Card Disputes**: Security-focused interaction, unauthorized charges, and fee waivers.
3. **Internet Provider**: Technical router troubleshooting, speed issues, and outage validation.
4. **E-Learning Platform**: Course enrollment, certificate generation, and subscription management.

## Technical Highlights
* **Guest Isolation**: Visitors can immediately interact with the agent via a seamless, background guest login. All message history is completely isolated by the guest session and scenario tenant.
* **Semantic Retrieval**: SOP chunks are embedded locally using `all-MiniLM-L6-v2` and searched efficiently via Supabase `pgvector`.
* **Stateful Logic**: Built on LangGraph to enable multi-turn troubleshooting, tool use, and escalation paths according to strict company guidelines.
* **Reasoning Model**: Uses `Gemini 1.5 Pro` to parse policy context and execute complex reasoning.

## Documentation
Please see the `docs/` folder for the initial design and architecture plans:
* `docs/architecture.md`
* `docs/ingestion_strategy.md`
* `docs/mock_sops.md`
* `docs/portfolio_presentation.md`
