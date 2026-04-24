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

Curate raw CSV into papers (recommended flow):

```bash
npm run rag:curate -- --input "data/raw/Food Ingredients and Recipe Dataset with Image Name Mapping.csv" --output "data/rag/papers/food_ingredients_recipe_curated.csv"
```

Useful optional flags:
- `--maxRows 15000`
- `--dedupe true`
- `--overwrite true`
- `--titleCol Title --ingredientsCol Cleaned_Ingredients --instructionsCol Instructions --imageCol Image_Name`

Du lieu den food, expire, cach lam, ... 