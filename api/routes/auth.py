import os
import logging
import uuid
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

log = logging.getLogger(__name__)

router = APIRouter()

class DemoCredentialsResponse(BaseModel):
    email: str
    password: str

@router.post("/api/auth/demo", response_model=DemoCredentialsResponse)
async def create_demo_user():
    """Create a temporary guest user and business profile via Admin API."""
    log.info("Creating temporary guest demo user...")
    
    supabase_url = os.environ.get("SUPABASE_URL")
    service_role_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not service_role_key:
        log.error("Missing Supabase admin configuration.")
        raise HTTPException(status_code=500, detail="Server configuration error")
        
    random_id = str(uuid.uuid4())[:8]
    email = f"guest_{random_id}@demo.com"
    password = f"DemoPassword_{random_id}!123"
    business_name = f"Demo Company {random_id}"
    business_description = f"A temporary demo business profile for reviewer {random_id}."
    
    headers = {
        "apikey": service_role_key,
        "Authorization": f"Bearer {service_role_key}",
        "Content-Type": "application/json"
    }
    
    # 1. Create user in Supabase Auth via Admin API
    create_user_url = f"{supabase_url}/auth/v1/admin/users"
    user_payload = {
        "email": email,
        "password": password,
        "email_confirm": True
    }
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(create_user_url, headers=headers, json=user_payload)
            if resp.status_code not in [200, 201]:
                log.error(f"Failed to create admin user: {resp.text}")
                raise HTTPException(status_code=500, detail="Failed to create guest user account")
                
            user_data = resp.json()
            user_id = user_data.get("id")
            if not user_id:
                raise HTTPException(status_code=500, detail="User ID not returned by auth service")
                
            # 2. Insert corresponding business profile
            create_biz_url = f"{supabase_url}/rest/v1/businesses"
            biz_payload = {
                "id": user_id,
                "name": business_name,
                "description": business_description
            }
            
            biz_resp = await client.post(create_biz_url, headers=headers, json=biz_payload)
            if biz_resp.status_code not in [200, 201]:
                log.error(f"Failed to create business profile: {biz_resp.text}")
                # Clean up created user on failure
                delete_user_url = f"{supabase_url}/auth/v1/admin/users/{user_id}"
                await client.delete(delete_user_url, headers=headers)
                raise HTTPException(status_code=500, detail="Failed to initialize business profile")
                
            log.info(f"Successfully provisioned demo user: {email}")
            return {"email": email, "password": password}
            
        except Exception as e:
            log.error(f"Exception during demo user provisioning: {e}", exc_info=True)
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=500, detail="Internal error during guest provisioning")
