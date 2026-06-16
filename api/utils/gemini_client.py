import os
import logging
import httpx
from typing import List, Dict, Optional, Any

log = logging.getLogger(__name__)

async def call_gemini_rest(
    messages: List[Dict[str, str]],
    system_instruction: Optional[str] = None,
    temperature: float = 0.0,
    model: str = "gemini-1.5-flash"
) -> str:
    """Call Google Gemini REST API directly using httpx, bypassing SDK credential bugs."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        log.error("GEMINI_API_KEY is not set in environment variables.")
        raise RuntimeError("GEMINI_API_KEY is not set.")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    
    # Format messages to Gemini contents structure
    # Role mappings: human/user -> user, ai/assistant/model -> model
    contents = []
    for msg in messages:
        role = msg.get("role", "user")
        if role in ["human", "user"]:
            gemini_role = "user"
        elif role in ["ai", "assistant", "model"]:
            gemini_role = "model"
        else:
            gemini_role = "user"
            
        contents.append({
            "role": gemini_role,
            "parts": [{"text": msg.get("content", "")}]
        })
        
    payload: Dict[str, Any] = {
        "contents": contents,
        "generationConfig": {
            "temperature": temperature
        }
    }
    
    if system_instruction:
        payload["systemInstruction"] = {
            "parts": [{"text": system_instruction}]
        }

    headers = {
        "Content-Type": "application/json"
    }

    log.info(f"Sending REST request to Gemini ({model})...")
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(url, headers=headers, json=payload, timeout=30.0)
            resp.raise_for_status()
            data = resp.json()
            
            # Extract generated text
            candidates = data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    return parts[0].get("text", "")
            
            log.warning("Gemini REST API returned empty response candidates.")
            return ""
        except Exception as e:
            log.error(f"Error calling Gemini REST API: {e}", exc_info=True)
            raise
