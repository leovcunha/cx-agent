import logging
import os
from typing import Any, Dict, List, Optional
import httpx

log = logging.getLogger(__name__)


def _get_supabase_url() -> Optional[str]:
    return os.environ.get("SUPABASE_URL")


def _get_service_role_key() -> Optional[str]:
    return os.environ.get("SUPABASE_SERVICE_ROLE_KEY")


def _get_admin_key() -> Optional[str]:
    return _get_service_role_key()


def _admin_headers() -> Dict[str, str]:
    key = _get_admin_key()
    if not key:
        raise RuntimeError("Supabase API key not set.")
    return {"apikey": key, "Authorization": f"Bearer {key}"}


async def get_tenant_id_from_jwt(authorization: str) -> Optional[str]:
    """Verify end-user/admin JWT against Supabase Auth and return their user ID (tenant ID)."""
    supabase_url = _get_supabase_url()
    supabase_key = _get_service_role_key()
    if not supabase_url or not supabase_key:
        return None
    url = f"{supabase_url}/auth/v1/user"
    headers = {
        "apikey": supabase_key,
        "Authorization": authorization,
    }
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                return resp.json().get("id")
        except Exception as e:
            log.error(f"Error verifying JWT: {e}")
        return None


async def fetch_last_n_messages(client_id: str, tenant_id: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Fetch the last N messages for a client from Supabase, scoped by tenant_id."""
    log.info(f"fetch_last_n_messages: Fetching last {limit} messages for client_id={client_id}, tenant_id={tenant_id}")
    supabase_url = _get_supabase_url()
    supabase_key = _get_admin_key()
    if not supabase_url or not supabase_key:
        log.error("fetch_last_n_messages: Supabase URL or API Key not set.")
        raise RuntimeError("Supabase URL or API Key not set.")
    
    url = f"{supabase_url}/rest/v1/messages"
    params = {
        "client_id": f"eq.{client_id}",
        "tenant_id": f"eq.{tenant_id}",
        "order": "timestamp.desc",
        "limit": str(limit),
        "select": "sender,text,timestamp"
    }
    headers = {"apikey": supabase_key, "Authorization": f"Bearer {supabase_key}"}
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url, headers=headers, params=params)
            resp.raise_for_status()
            messages = resp.json()
            log.info(f"fetch_last_n_messages: Successfully fetched {len(messages)} messages.")
            # Return in chronological order
            return messages[::-1]
        except Exception as e:
            log.error(f"fetch_last_n_messages: Error fetching messages: {e}", exc_info=True)
            return []


async def save_message_to_supabase(client_id: str, tenant_id: str, sender: str, text: str):
    """Save a message to the Supabase 'messages' table via REST API."""
    log.info(f"save_message_to_supabase: Saving message for client_id={client_id}, sender={sender}")
    supabase_url = _get_supabase_url()
    supabase_key = _get_admin_key()
    if not supabase_url or not supabase_key:
        log.error("save_message_to_supabase: Supabase URL or API Key not set.")
        raise RuntimeError("Supabase URL or API Key not set in environment variables.")
    url = f"{supabase_url}/rest/v1/messages"
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    data = {
        "client_id": client_id,
        "tenant_id": tenant_id,
        "sender": sender,
        "text": text
    }
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers, json=data)
            response.raise_for_status()
            log.info(f"save_message_to_supabase: Successfully saved message.")
            return response.json()
        except Exception as e:
            log.error(f"save_message_to_supabase: Error saving message: {e}", exc_info=True)
            raise


async def fetch_business_details(
    business_id: str,
) -> Optional[Dict[str, Any]]:
    """Fetch business details by business ID."""
    supabase_url = _get_supabase_url()
    if not supabase_url:
        return None
    url = f"{supabase_url}/rest/v1/businesses"
    params = {"id": f"eq.{business_id}"}
    headers = _admin_headers()
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url, headers=headers, params=params)
            if resp.status_code == 200 and resp.json():
                return resp.json()[0]
        except Exception as e:
            log.error(f"Error fetching business details: {e}")
        return None
