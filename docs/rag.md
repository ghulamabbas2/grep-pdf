# grep.pdf — RAG

The retrieval pipeline turns an uploaded PDF into searchable, citable chunks. Chunking, embedding, and retrieval all live in `backend/app/services/rag`. See [database.md](database.md) for the `chunks` table and pgvector indexing, [llm.md](llm.md) for how retrieved chunks feed the answer chain, and [api.md](api.md) for how citations reach the client.

## Ingestion

- **Parsing** — PDFs are parsed with **PyMuPDF**.
- **Chunking** — text is split into chunks of **~800 tokens** with a **100-token overlap** between adjacent chunks.
- **Embedding** — each chunk is embedded with **Voyage `voyage-3-lite`** at **512 dimensions**, stored in the `chunks` table's vector column.

## Retrieval

- **Similarity** — **cosine similarity** over **pgvector**.
- **Top-k** — the **6** most similar chunks are returned.
- **Scoping** — results are **filtered to the current session's PDF**, so retrieval never crosses documents.

## Citations

Each chunk stores its **page number** and **character offsets**, so a citation links back to the **exact page** (and span) it came from rather than an approximate location.
