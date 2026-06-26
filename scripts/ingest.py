import os
import sys
import hashlib
import json
import httpx
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
HASH_FILE = "scripts/.ingest_hashes.json"

SCENARIOS = [
    {
        "id": "ecommerce_demo",
        "name": "ApexCart Retail",
        "file": "policy_documents/ecommerce_sop.md"
    },
    {
        "id": "creditcard_demo",
        "name": "Horizon Bank Card Services",
        "file": "policy_documents/creditcard_sop.md"
    },
    {
        "id": "internet_demo",
        "name": "NetFast Broadband",
        "file": "policy_documents/internet_sop.md"
    },
    {
        "id": "elearning_demo",
        "name": "SkillSphere Academy",
        "file": "policy_documents/elearning_sop.md"
    }
]

def calculate_md5(filepath: str) -> str:
    hash_md5 = hashlib.md5()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

def load_hashes() -> dict:
    if os.path.exists(HASH_FILE):
        try:
            with open(HASH_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_hashes(hashes: dict):
    os.makedirs(os.path.dirname(HASH_FILE), exist_ok=True)
    with open(HASH_FILE, "w") as f:
        json.dump(hashes, f, indent=2)

async def upsert_business(client: httpx.AsyncClient, headers: dict, business_id: str, name: str):
    url = f"{SUPABASE_URL}/rest/v1/businesses"
    data = {
        "id": business_id,
        "name": name,
        "description": f"Demo scenario for {name}"
    }
    # upsert on primary key (id)
    headers_upsert = {**headers, "Prefer": "resolution=merge-duplicates"}
    resp = await client.post(url, headers=headers_upsert, json=data)
    if resp.status_code >= 400:
        print(f"Error upserting business: {resp.text}")
    resp.raise_for_status()

async def delete_document_by_name(client: httpx.AsyncClient, headers: dict, file_name: str, tenant_id: str):
    # Search for existing document to get its ID
    url = f"{SUPABASE_URL}/rest/v1/documents"
    params = {
        "file_name": f"eq.{file_name}",
        "tenant_id": f"eq.{tenant_id}",
        "select": "id"
    }
    resp = await client.get(url, headers=headers, params=params)
    resp.raise_for_status()
    docs = resp.json()
    if docs:
        doc_id = docs[0]["id"]
        print(f"Deleting existing document: {file_name} (ID: {doc_id})")
        delete_url = f"{SUPABASE_URL}/rest/v1/documents?id=eq.{doc_id}"
        del_resp = await client.delete(delete_url, headers=headers)
        del_resp.raise_for_status()

async def insert_document(client: httpx.AsyncClient, headers: dict, file_name: str, tenant_id: str) -> str:
    url = f"{SUPABASE_URL}/rest/v1/documents"
    data = {
        "tenant_id": tenant_id,
        "file_name": file_name
    }
    headers = {**headers, "Prefer": "return=representation"}
    resp = await client.post(url, headers=headers, json=data)
    resp.raise_for_status()
    result = resp.json()
    return result[0]["id"]

async def insert_document_chunks(client: httpx.AsyncClient, headers: dict, chunks: list, embeddings: list, document_id: str, tenant_id: str):
    url = f"{SUPABASE_URL}/rest/v1/document_chunks"
    payload = []
    for chunk, emb in zip(chunks, embeddings):
        payload.append({
            "document_id": document_id,
            "tenant_id": tenant_id,
            "content": chunk,
            "embedding": emb.tolist()
        })
    resp = await client.post(url, headers=headers, json=payload)
    resp.raise_for_status()
    print(f"Successfully inserted {len(payload)} chunks.")

async def process_document_async(filepath: str, tenant_id: str, force: bool = False, model: SentenceTransformer = None):
    file_name = os.path.basename(filepath)
    file_hash = calculate_md5(filepath)
    
    hashes = load_hashes()
    if not force and hashes.get(filepath) == file_hash:
        print(f"No changes detected for {filepath}. Skipping ingestion.")
        return hashes, False

    print(f"Processing document {filepath} for tenant {tenant_id}...")
    
    with open(filepath, "r", encoding="utf-8") as f:
        raw_document_text = f.read()

    print("Splitting document...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    chunks = text_splitter.split_text(raw_document_text)
    
    print(f"Generating embeddings for {len(chunks)} chunks...")
    embeddings = model.encode(chunks)
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient() as client:
        # Delete old document if it exists (cascade will handle chunks deletion)
        await delete_document_by_name(client, headers, file_name, tenant_id)
        
        # Insert document record
        document_id = await insert_document(client, headers, file_name, tenant_id)
        print(f"Created new document record: {document_id}")
        
        # Insert chunks
        await insert_document_chunks(client, headers, chunks, embeddings, document_id, tenant_id)

    hashes[filepath] = file_hash
    return hashes, True

async def main(force: bool):
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.")
        sys.exit(1)
        
    print("Loading SentenceTransformer model ('all-MiniLM-L6-v2')...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient() as client:
        # First ensure all businesses exist
        for scenario in SCENARIOS:
            print(f"Ensuring business {scenario['name']} exists...")
            await upsert_business(client, headers, scenario['id'], scenario['name'])
            
    # Then process each document
    hashes = load_hashes()
    updated_any = False
    for scenario in SCENARIOS:
        filepath = scenario['file']
        if not os.path.exists(filepath):
            print(f"Warning: {filepath} not found.")
            continue
            
        new_hashes, processed = await process_document_async(filepath, scenario['id'], force, model)
        hashes.update(new_hashes)
        if processed:
            updated_any = True
            
    if updated_any:
        save_hashes(hashes)
    print("Ingestion complete.")

if __name__ == "__main__":
    import asyncio
    force_ingest = "--force" in sys.argv
    asyncio.run(main(force=force_ingest))
