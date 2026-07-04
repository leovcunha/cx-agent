import os
import unittest
import asyncio
from dotenv import load_dotenv
load_dotenv()

from api.agents.evaluator import evaluate_message_async
from api.utils.supabase_client import get_http_client, _get_supabase_url, _get_admin_key

RUN_INTEGRATION_TESTS = os.environ.get("RUN_INTEGRATION_TESTS") == "1"

@unittest.skipUnless(RUN_INTEGRATION_TESTS, "Integration tests require RUN_INTEGRATION_TESTS=1")
class TestEvaluatorPrompts(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        # We need to mock _save_evaluation to capture evaluations instead of writing to Supabase
        self.saved_evaluations = []
        
        async def mock_save(message_id, tenant_id, score, violations, tone, hallucination):
            self.saved_evaluations.append({
                "message_id": message_id,
                "tenant_id": tenant_id,
                "score": score,
                "violations": violations,
                "tone": tone,
                "hallucination": hallucination
            })
            
        self.patcher = unittest.mock.patch("api.agents.evaluator._save_evaluation", side_effect=mock_save)
        self.patcher.start()
        
    async def asyncTearDown(self):
        self.patcher.stop()

    async def test_ecommerce_simple_greeting(self):
        # Case: Simple greeting should have score 100, no violations, no hallucinations
        context = "Return windows are strictly 30 days from delivery. Proof of damage required for refund."
        await evaluate_message_async(
            message_id="test-greeting",
            tenant_id="ecommerce_demo",
            user_query="hello, I need help with an order",
            ai_response="Hello! I would be glad to help you with your order. Could you please provide your order ID and the issue you are experiencing?",
            retrieved_context=context
        )
        self.assertEqual(len(self.saved_evaluations), 1)
        eval_result = self.saved_evaluations[0]
        self.assertEqual(eval_result["score"], 100)
        self.assertEqual(eval_result["violations"], [])
        self.assertFalse(eval_result["hallucination"])
        self.assertTrue(eval_result["tone"])

    async def test_ecommerce_policy_violation(self):
        # Case: AI violates return window policy
        context = "ApexCart Retail Return Policy: Return windows are strictly 30 days from delivery."
        await evaluate_message_async(
            message_id="test-violation",
            tenant_id="ecommerce_demo",
            user_query="I want to return a jacket I bought 6 months ago",
            ai_response="No problem! I have approved your return and processed a full refund to your card.",
            retrieved_context=context
        )
        self.assertEqual(len(self.saved_evaluations), 1)
        eval_result = self.saved_evaluations[0]
        self.assertLess(eval_result["score"], 90)
        self.assertNotEqual(len(eval_result["violations"]), 0)

    async def test_creditcard_hallucination(self):
        # Case: AI invents a fee waiver policy not present in the SOP
        context = "Apex Credit & Trust Fee Waiver Policy: Only customers with accounts in good standing for >12 months and annual spend >$10,000 are eligible for an annual fee waiver."
        await evaluate_message_async(
            message_id="test-hallucination",
            tenant_id="creditcard_demo",
            user_query="Can I get my annual fee waived?",
            ai_response="Yes! Because you asked, we will waive your annual fee and send you a free $50 Amazon gift card as a thank you.",
            retrieved_context=context
        )
        self.assertEqual(len(self.saved_evaluations), 1)
        eval_result = self.saved_evaluations[0]
        self.assertTrue(eval_result["hallucination"])

    async def test_internet_compliant_response(self):
        # Case: AI correctly troubleshooting connection drops
        context = "Apex Broadband Connection Drops: Guide user to unplug power cable, wait 30 seconds, and reconnect."
        await evaluate_message_async(
            message_id="test-compliant",
            tenant_id="internet_demo",
            user_query="My connection keeps dropping",
            ai_response="I'm sorry to hear your internet connection is dropping. Let's troubleshoot this. Please unplug the power cable from your router, wait 30 seconds, and plug it back in. Let me know if that stabilizes the connection.",
            retrieved_context=context
        )
        self.assertEqual(len(self.saved_evaluations), 1)
        eval_result = self.saved_evaluations[0]
        self.assertEqual(eval_result["score"], 100)
        self.assertEqual(eval_result["violations"], [])
        self.assertFalse(eval_result["hallucination"])

    async def test_elearning_app_store_cancellation(self):
        # Case: AI correctly redirects mobile app subscription cancellation to stores
        context = "Apex Academix Subscription Cancellation: If subscription was purchased via mobile app store (iOS/Android), explain that cancellation must be handled through Apple/Google subscriptions."
        await evaluate_message_async(
            message_id="test-elearning-store",
            tenant_id="elearning_demo",
            user_query="How do I cancel my subscription? I subscribed on my iPhone.",
            ai_response="Since you purchased your subscription through the iOS App Store on your iPhone, you will need to cancel the auto-renewal directly in your Apple subscription settings. We are unable to cancel it on our end.",
            retrieved_context=context
        )
        self.assertEqual(len(self.saved_evaluations), 1)
        eval_result = self.saved_evaluations[0]
        self.assertEqual(eval_result["score"], 100)
        self.assertEqual(eval_result["violations"], [])
        self.assertFalse(eval_result["hallucination"])
