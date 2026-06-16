# Ingestion Strategy and Vector Store

## Overview
A key feature of this agent is domain adaptability. Changing the agent's purpose should be as simple as swapping out documents and updating the business profile.

## Pipeline Architecture

1.  **Document Source (Admin UI & Supabase Storage)**
    *   Instead of a static folder, this is a Full-Stack utility. Business owners log into a web dashboard (Admin UI) to upload PDFs, Markdown, or Word documents containing SOPs. 
    *   The files are stored securely in Supabase Storage, which then triggers the backend processing pipeline via webhooks or direct API calls.

2.  **Parsing & Chunking**
    *   **Semantic Chunking:** Instead of naive character splitting, the pipeline will use document structure (headers, sections) to ensure chunks contain complete, cohesive thoughts (e.g., a single troubleshooting step or a complete refund policy).
    *   **Metadata Extraction:** During parsing, tag chunks with metadata such as `category` (e.g., "account_access", "technical"), `applicability` (e.g., "macOS only"), and `document_name`.

3.  **Embedding (Free Tier Strategy)**
    *   Use a free, high-quality open-source embedding model like HuggingFace's `all-MiniLM-L6-v2` (run locally in Python or via a free inference API) to convert chunks into vector representations without incurring usage costs.

4.  **Vector Index (Supabase pgvector)**
    *   Store embeddings in **Supabase using `pgvector`**.
    *   This provides a unified stack (authentication, file storage, and vector DB all in Supabase).
    *   The retriever will use `pgvector` similarity search combined with metadata filtering (e.g., `tenant_id` or `business_id`) to ensure isolation between different companies configuring the agent.

## Operational Workflow for Updates
To update the agent's knowledge:
1.  Add/Remove/Update file in `policy_documents/`.
2.  Run the ingestion script: `python ingest.py`.
3.  The script calculates file hashes to only process changed documents, keeping update times fast.

## Technical Implementation: Supabase Schema (pgvector)

The backend requires the `pgvector` extension to store and efficiently search the document chunks.

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Table to store high-level document metadata
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL, -- Ties document to a specific business
    file_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Table to store the vector embeddings
CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL, -- Duplicated here for faster row-level filtering
    content TEXT NOT NULL,
    embedding vector(384) -- 384 dimensions for all-MiniLM-L6-v2
);

-- Create an HNSW index for fast similarity search
CREATE INDEX ON document_chunks USING hnsw (embedding vector_cosine_ops);
```

## Technical Implementation: Chunking & Embedding Pipeline

When a document is uploaded via the Admin UI, the backend processes it using LangChain:

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer

def process_document(raw_document_text: str, tenant_id: str):
    # 1. Load the open-source embedding model (runs locally/free)
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    # 2. Split the document semantically
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    chunks = text_splitter.split_text(raw_document_text)
    
    # 3. Generate embeddings for all chunks
    embeddings = model.encode(chunks)
    
    # 4. Insert into Supabase (Pseudo-code)
    # supabase.table('document_chunks').insert([
    #     {'tenant_id': tenant_id, 'content': chunk, 'embedding': emb.tolist()} 
    #     for chunk, emb in zip(chunks, embeddings)
    # ]).execute()
```
