import unittest
from unittest.mock import patch
from langchain_core.messages import HumanMessage, AIMessage
from api.agents.nodes.triage import triage_node

class TestTriage(unittest.TestCase):
    @patch("api.agents.nodes.triage.ChatGroq")
    def test_triage_uses_history(self, mock_chat_groq):
        # Mock the LLM
        from unittest.mock import AsyncMock
        mock_llm_instance = mock_chat_groq.return_value
        mock_llm_instance.ainvoke = AsyncMock(return_value=AIMessage(content='{"intent": "product_troubleshooting"}'))

        state = {
            "messages": [
                HumanMessage(content="Hello"),
                AIMessage(content="Hi there, how can I help?"),
                HumanMessage(content="My item is broken"),
                AIMessage(content="I'm sorry to hear that. What is the value?"),
                HumanMessage(content="The value is $100")
            ],
            "biz_details": {
                "name": "TestBiz",
                "description": "Test"
            }
        }
        
        import asyncio
        result = asyncio.run(triage_node(state))
    
        self.assertEqual(result["current_intent"], "product_troubleshooting")
        
        # Verify the prompt passed to the LLM contains the history
        mock_llm_instance.invoke.assert_called_once()
        call_args = mock_llm_instance.invoke.call_args[0][0]
        prompt_content = call_args[0].content
        
        self.assertIn("User: My item is broken", prompt_content)
        self.assertIn("Assistant: I'm sorry to hear that. What is the value?", prompt_content)
        self.assertIn("User: The value is $100", prompt_content)

if __name__ == "__main__":
    unittest.main()
