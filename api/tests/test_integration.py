import os
import unittest
import asyncio
from api.message_service import get_agent_response

RUN_INTEGRATION_TESTS = os.environ.get("RUN_INTEGRATION_TESTS") == "1"

@unittest.skipUnless(RUN_INTEGRATION_TESTS, "Integration tests require RUN_INTEGRATION_TESTS=1")
class TestCustomerServiceAgentIntegration(unittest.TestCase):
    def setUp(self):
        self.tenant_id = "default_business"
        self.client_id = "test_client_integration"
        self.history = []

    def test_password_reset_flow(self):
        async def run():
            query_1 = "Hi, I forgot my password. How can I reset it?"
            response_1 = await get_agent_response(
                user_message=query_1,
                client_id=self.client_id,
                tenant_id=self.tenant_id,
                conversation_history=self.history
            )
            print("\n[Password Reset Turn 1]")
            print("User:", query_1)
            print("Agent:", response_1)
            
            self.assertIn("email", response_1.lower())
            
            self.history.append({"sender": "user", "text": query_1})
            self.history.append({"sender": "ai", "text": response_1})
            
            query_2 = "My email is support@example.com"
            response_2 = await get_agent_response(
                user_message=query_2,
                client_id=self.client_id,
                tenant_id=self.tenant_id,
                conversation_history=self.history
            )
            print("\n[Password Reset Turn 2]")
            print("User:", query_2)
            print("Agent:", response_2)
            
            self.assertTrue(
                "reset" in response_2.lower() or "sent" in response_2.lower()
            )
        asyncio.run(run())

    def test_platform_connection_error_flow(self):
        async def run():
            query_1 = "I am getting a timeout error when trying to connect to the platform."
            response_1 = await get_agent_response(
                user_message=query_1,
                client_id=self.client_id,
                tenant_id=self.tenant_id,
                conversation_history=self.history
            )
            print("\n[Platform Connection Turn 1]")
            print("User:", query_1)
            print("Agent:", response_1)
            
            self.assertTrue(
                "desktop" in response_1.lower() or "web" in response_1.lower()
            )
            
            self.history.append({"sender": "user", "text": query_1})
            self.history.append({"sender": "ai", "text": response_1})
            
            query_2 = "I am on the Desktop App"
            response_2 = await get_agent_response(
                user_message=query_2,
                client_id=self.client_id,
                tenant_id=self.tenant_id,
                conversation_history=self.history
            )
            print("\n[Platform Connection Turn 2]")
            print("User:", query_2)
            print("Agent:", response_2)
            
            self.assertTrue(
                "cache" in response_2.lower() or "clear" in response_2.lower()
            )
        asyncio.run(run())

    def test_feature_request_flow(self):
        async def run():
            query_1 = "I would like to suggest a new dark mode feature."
            response_1 = await get_agent_response(
                user_message=query_1,
                client_id=self.client_id,
                tenant_id=self.tenant_id,
                conversation_history=self.history
            )
            print("\n[Feature Request Turn 1]")
            print("User:", query_1)
            print("Agent:", response_1)
            
            self.assertTrue(
                "problem" in response_1.lower() or "use" in response_1.lower() or "solve" in response_1.lower() or "why" in response_1.lower()
            )
        asyncio.run(run())

    def test_off_topic_flow(self):
        async def run():
            query_1 = "What is the capital of France?"
            response_1 = await get_agent_response(
                user_message=query_1,
                client_id=self.client_id,
                tenant_id=self.tenant_id,
                conversation_history=self.history
            )
            print("\n[Off Topic Turn 1]")
            print("User:", query_1)
            print("Agent:", response_1)
            
            self.assertIn("only help with customer service", response_1.lower())
        asyncio.run(run())
