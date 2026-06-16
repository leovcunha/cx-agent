import os
import unittest
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient


class TestHttpEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        from api.index import app

        cls.client = TestClient(app)

    def test_messages_happy_path(self):
        with patch.dict(os.environ, {"SUPABASE_URL": "https://example.supabase.co"}, clear=False):
            with patch(
                "api.routes.messages.get_tenant_id_from_jwt",
                new=AsyncMock(return_value="tenant_1"),
            ), patch(
                "api.routes.messages.fetch_last_n_messages",
                new=AsyncMock(
                    return_value=[
                        {"sender": "user", "text": "hi", "timestamp": "2026-06-16T12:00:00Z"}
                    ]
                ),
            ):
                resp = self.client.post(
                    "/api/messages",
                    headers={"Authorization": "Bearer test.jwt"},
                    json={"clientId": "client_1"},
                )
                self.assertEqual(resp.status_code, 200)
                self.assertEqual(
                    resp.json(),
                    {"messages": [{"sender": "user", "text": "hi", "timestamp": "2026-06-16T12:00:00Z"}]},
                )

    def test_messages_invalid_client_id(self):
        with patch.dict(os.environ, {"SUPABASE_URL": "https://example.supabase.co"}, clear=False):
            with patch(
                "api.routes.messages.get_tenant_id_from_jwt",
                new=AsyncMock(return_value="tenant_1"),
            ):
                resp = self.client.post(
                    "/api/messages",
                    headers={"Authorization": "Bearer test.jwt"},
                    json={"clientId": "  "},
                )
                self.assertEqual(resp.status_code, 400)
                self.assertEqual(resp.json().get("error"), "Invalid or missing clientId")

    def test_chat_happy_path(self):
        with patch.dict(os.environ, {"SUPABASE_URL": "https://example.supabase.co"}, clear=False):
            with patch(
                "api.routes.chat.get_tenant_id_from_jwt",
                new=AsyncMock(return_value="tenant_1"),
            ), patch(
                "api.routes.chat.fetch_business_details",
                new=AsyncMock(return_value={"id": "tenant_1", "name": "TechFlow"}),
            ), patch(
                "api.routes.chat.fetch_last_n_messages",
                new=AsyncMock(return_value=[]),
            ), patch(
                "api.routes.chat.save_message_to_supabase",
                new=AsyncMock(),
            ), patch(
                "api.routes.chat.get_agent_response",
                new=AsyncMock(return_value="Agent reply"),
            ):
                resp = self.client.post(
                    "/api/chat",
                    headers={"Authorization": "Bearer test.jwt"},
                    json={"client_id": "c1", "chat_id": "ch1", "message": "hello"},
                )
                self.assertEqual(resp.status_code, 200)
                self.assertEqual(resp.json(), {"response": "Agent reply"})

    def test_chat_unauthorized_token(self):
        with patch.dict(os.environ, {"SUPABASE_URL": "https://example.supabase.co"}, clear=False):
            with patch(
                "api.routes.chat.get_tenant_id_from_jwt",
                new=AsyncMock(return_value=None),
            ):
                resp = self.client.post(
                    "/api/chat",
                    headers={"Authorization": "Bearer test.jwt"},
                    json={"client_id": "c1", "chat_id": "ch1", "message": "hello"},
                )
                self.assertEqual(resp.status_code, 401)


if __name__ == "__main__":
    unittest.main()
