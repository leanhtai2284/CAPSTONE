# RAG Documents

Put your private knowledge files in `backend/data/rag/papers`.

Supported file types:
- `.pdf`
- `.txt`
- `.md`
- `.markdown`

By default, the API reads from this folder and builds an in-memory retrieval index.

You can override location by setting `RAG_DOCS_DIR` in `backend/.env`.
