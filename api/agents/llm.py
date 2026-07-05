import os
from langchain_groq import ChatGroq
from langchain_core.language_models.chat_models import BaseChatModel

def get_llm(temperature: float = 0.0) -> BaseChatModel:
    """
    Centralized provider function to instantiate the LLM client.
    This decouples the agent nodes and evaluator from specific providers like ChatGroq.
    """
    model_name = os.environ.get("GROQ_MODEL", "openai/gpt-oss-120b")
    return ChatGroq(
        model=model_name,
        temperature=temperature
    )
