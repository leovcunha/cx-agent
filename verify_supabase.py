import os
from dotenv import load_dotenv
import httpx
import asyncio

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_PUBLISHABLE_KEY = os.environ.get("VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY")
SUPABASE_ANON_KEY = os.environ.get("VITE_SUPABASE_ANON_KEY")

async def verify():
    if not SUPABASE_URL:
        print("Error: Missing SUPABASE_URL in .env")
        return

    print(f"Testing connection to: {SUPABASE_URL}")
    
    for name, key in [("Publishable", SUPABASE_PUBLISHABLE_KEY), ("Legacy Anon", SUPABASE_ANON_KEY)]:
        if not key:
            print(f"Skipping {name} (not found)")
            continue
        print(f"\n--- Testing {name} Key ---")
        headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}"
        }
        if key.startswith("ey"):
             headers["Authorization"] = f"Bearer {key}"
        else:
            print("Note: Key does not look like a JWT, skipping Authorization Bearer header.")

    
    # Try to fetch root or a simple health check if possible, or just a table.
    # Since we might not know the tables for sure, we'll try a common one or just check if the URL is reachable.
    # Supabase REST API root usually returns a documented response or 404 but we want to check auth.
    # Let's try to list 'clients' or 'messages' with limit 1, which are known tables from the code.
    
        async with httpx.AsyncClient() as client:
            try:
                # Try to access a known table: messages
                url = f"{SUPABASE_URL}/rest/v1/messages?limit=1"
                response = await client.get(url, headers=headers)
                print(f"Status Code: {response.status_code}")
                if response.status_code == 200:
                    print(f"{name} Key Connection Successful!")
                elif response.status_code == 401:
                    print(f"{name} Key Connection Failed: Unauthorized")
                    print("Response:", response.text)
                else:
                    print(f"{name} Key Connection returned: {response.status_code}")
                    print("Response:", response.text[:200])
            except Exception as e:
                print(f"{name} Connection Error: {e}")

if __name__ == "__main__":
    asyncio.run(verify())
