import os
import logging
from typing import List, Dict, Any
from fastapi import APIRouter, Header, HTTPException, UploadFile, File
from pydantic import BaseModel
import httpx
from langchain_text_splitters import RecursiveCharacterTextSplitter
from api.utils.supabase_client import get_tenant_id_from_jwt
from api.agents.nodes.retrieval import get_embedding_model

log = logging.getLogger(__name__)

router = APIRouter()

class DocumentResponse(BaseModel):
    id: str
    file_name: str
    created_at: str

@router.get("/api/documents", response_model=List[DocumentResponse])
async def list_documents(authorization: str = Header(...)):
    """List all uploaded SOP documents for the authenticated tenant."""
    tenant_id = await get_tenant_id_from_jwt(authorization)
    if not tenant_id:
        raise HTTPException(status_code=401, detail="Unauthorized or invalid token")
        
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not supabase_key:
        raise HTTPException(status_code=500, detail="Server config error")
        
    url = f"{supabase_url}/rest/v1/documents"
    params = {
        "tenant_id": f"eq.{tenant_id}",
        "select": "id,file_name,created_at",
        "order": "created_at.desc"
    }
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url, headers=headers, params=params)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            log.error(f"Error fetching documents: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Failed to fetch documents")

@router.post("/api/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    authorization: str = Header(...)
):
    """Upload and process an SOP document (TXT/MD). Chunks and embeds the text."""
    tenant_id = await get_tenant_id_from_jwt(authorization)
    if not tenant_id:
        raise HTTPException(status_code=401, detail="Unauthorized or invalid token")
        
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not supabase_key:
        raise HTTPException(status_code=500, detail="Server config error")
        
    # Read file contents
    contents = await file.read()
    try:
        text = contents.decode("utf-8")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid text file encoding. Use UTF-8.")
        
    # Limit size to 1MB for demo safety
    if len(text) > 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max size is 1MB.")
        
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            # 1. Insert document record
            doc_url = f"{supabase_url}/rest/v1/documents"
            doc_data = {
                "tenant_id": tenant_id,
                "file_name": file.filename
            }
            doc_headers = {**headers, "Prefer": "return=representation"}
            doc_resp = await client.post(doc_url, headers=doc_headers, json=doc_data)
            doc_resp.raise_for_status()
            doc_record = doc_resp.json()
            document_id = doc_record[0]["id"]
            
            # 2. Chunk text
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=500,
                chunk_overlap=50,
                separators=["\n\n", "\n", ".", " ", ""]
            )
            chunks = text_splitter.split_text(text)
            
            if chunks:
                # 3. Generate embeddings
                model = get_embedding_model()
                embeddings = model.encode(chunks)
                
                # 4. Insert chunks
                chunk_url = f"{supabase_url}/rest/v1/document_chunks"
                chunk_payload = []
                for chunk, emb in zip(chunks, embeddings):
                    chunk_payload.append({
                        "document_id": document_id,
                        "tenant_id": tenant_id,
                        "content": chunk,
                        "embedding": emb.tolist()
                    })
                
                chunk_resp = await client.post(chunk_url, headers=headers, json=chunk_payload)
                chunk_resp.raise_for_status()
                
            log.info(f"Successfully uploaded and ingested SOP file {file.filename} for tenant {tenant_id}")
            return {"success": True, "document_id": document_id, "chunks_count": len(chunks)}
            
        except Exception as e:
            log.error(f"Error during file upload and ingestion: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Failed to process and ingest document")

@router.delete("/api/documents/{doc_id}")
async def delete_document(doc_id: str, authorization: str = Header(...)):
    """Delete an SOP document and all its chunks (cascade)."""
    tenant_id = await get_tenant_id_from_jwt(authorization)
    if not tenant_id:
        raise HTTPException(status_code=401, detail="Unauthorized or invalid token")
        
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not supabase_key:
        raise HTTPException(status_code=500, detail="Server config error")
        
    url = f"{supabase_url}/rest/v1/documents"
    params = {
        "id": f"eq.{doc_id}",
        "tenant_id": f"eq.{tenant_id}"
    }
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.delete(url, headers=headers, params=params)
            resp.raise_for_status()
            return {"success": True}
        except Exception as e:
            log.error(f"Error deleting document: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Failed to delete document")
