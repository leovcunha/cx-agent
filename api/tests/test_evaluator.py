import unittest
from unittest.mock import AsyncMock, patch
from api.agents.evaluator import evaluate_message_async

class TestEvaluator(unittest.IsolatedAsyncioTestCase):
    @patch("api.agents.evaluator.ChatGroq")
    @patch("api.agents.evaluator._save_evaluation")
    @patch("api.agents.evaluator.random.random", return_value=0.5)
    @patch("api.agents.evaluator.SAMPLE_RATE", 1.0)
    async def test_evaluate_message_async_success(self, mock_random, mock_save, mock_chat_groq):
        # Mock the LLM response
        mock_llm_instance = AsyncMock()
        mock_chat_groq.return_value = mock_llm_instance
        
        mock_response = AsyncMock()
        mock_response.content = '''```json
        {
          "sop_adherence_score": 95,
          "policy_violations": ["minor tone issue"],
          "tone_pass": false,
          "hallucination_flag": false
        }
        ```'''
        mock_llm_instance.ainvoke.return_value = mock_response

        await evaluate_message_async(
            message_id="msg-123",
            tenant_id="tenant-123",
            user_query="I want a refund",
            ai_response="Sure, here is your refund",
            retrieved_context="Refund policy: allow refunds"
        )

        mock_llm_instance.ainvoke.assert_called_once()
        mock_save.assert_called_once_with(
            "msg-123",
            "tenant-123",
            95,
            ["minor tone issue"],
            False,
            False
        )

if __name__ == "__main__":
    unittest.main()
