#RAG

Put your private knowledge files in `backend/data/rag/papers`.

Supported file types:
- `.pdf`
- `.txt`
- `.md`
- `.markdown`
- `.csv`

override location by setting `RAG_DOCS_DIR` in `backend/.env`.

CSV files in `backend/data`, set:

```env
RAG_DOCS_DIR=backend/data
```

Optional CSV tuning:

```env
RAG_CSV_MAX_ROWS=2000
RAG_CSV_MAX_COLUMNS=12
RAG_CSV_VALUE_MAX_LENGTH=180
```

Du lieu den food, expire, cach lam, ... 