import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
# from api.utils.supabase_client import get_supabase_client # Assuming this will be used

def process_document(raw_document_text: str, tenant_id: str):
    # 1. Load the open-source embedding model (runs locally/free)
    print(f"Loading model for tenant {tenant_id}...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    # 2. Split the document semantically
    print("Splitting document...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    chunks = text_splitter.split_text(raw_document_text)
    
    # 3. Generate embeddings for all chunks
    print(f"Generating embeddings for {len(chunks)} chunks...")
    embeddings = model.encode(chunks)
    
    # 4. Insert into Supabase (Pseudo-code)
    # supabase = get_supabase_client()
    # supabase.table('document_chunks').insert([
    #     {'tenant_id': tenant_id, 'content': chunk, 'embedding': emb.tolist()} 
    #     for chunk, emb in zip(chunks, embeddings)
    # ]).execute()
    print("Ingestion complete.")

if __name__ == "__main__":
    # Example usage
    # process_document("This is a mock SOP document. It contains policies.", "tenant_123")
    pass
