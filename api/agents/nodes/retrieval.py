import os
import logging
from typing import Dict, Any, List
import httpx
from api.agents.state import AgentState

log = logging.getLogger(__name__)

# Cache the embedding model at the module level
_model = None

def get_embedding_model():
    global _model
    if _model is None:
        log.info("Initializing SentenceTransformer('all-MiniLM-L6-v2') for query retrieval...")
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model

async def retrieval_node(state: AgentState) -> Dict[str, Any]:
    """Retrieve relevant SOP chunks using vector similarity search."""
    log.info("Executing retrieval node")
    
    tenant_id = state.get("tenant_id") or "default_business"
    messages = state.get("messages", [])
    if not messages:
        return {"retrieved_context": ""}
        
    last_message = messages[-1].content
    log.info(f"Retrieving context for query: '{last_message}' (tenant: {tenant_id})")
    
    try:
        # 1. Generate embedding for user query
        model = get_embedding_model()
        query_embedding = model.encode(last_message).tolist()
        
        # 2. Query Supabase RPC for matching document chunks
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        if not supabase_url or not supabase_key:
            log.error("Missing Supabase credentials in environment")
            return {"retrieved_context": ""}
            
        rpc_url = f"{supabase_url}/rest/v1/rpc/match_document_chunks"
        headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "query_embedding": query_embedding,
            "match_threshold": 0.2,
            "match_count": 3,
            "filter_tenant_id": tenant_id
        }
        
        async with httpx.AsyncClient() as client:
            resp = await client.post(rpc_url, headers=headers, json=payload)
            resp.raise_for_status()
            results = resp.json()
            
        # 3. Format context
        if not results:
            log.info("No matching SOP chunks found.")
            return {"retrieved_context": "No specific SOP context found for this query."}
            
        context_parts = []
        for idx, chunk in enumerate(results):
            content = chunk.get("content", "").strip()
            similarity = chunk.get("similarity", 0)
            log.info(f"Chunk {idx+1} similarity: {similarity:.4f}")
            context_parts.append(content)
            
        retrieved_context = "\n\n---\n\n".join(context_parts)
        log.info(f"Retrieved {len(results)} context chunks.")
        return {"retrieved_context": retrieved_context}
        
    except Exception as e:
        log.error(f"Error in retrieval node: {e}", exc_info=True)
        return {"retrieved_context": ""}
