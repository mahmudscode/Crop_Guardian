# Tech Stack

Follows the Congress reference architecture (Lovable UI, Supabase backend with pgvector, LLM intelligence layer): fast to build and easy to defend to judges.

| Layer | Choice | Why |
|---|---|---|
| UI | Lovable (React), mobile-first, Bangla UI strings | Fastest path to a working upload-and-chat screen; named in the guide |
| Backend / API | Supabase Edge Functions | Keeps API keys server-side; one place for the pipeline |
| Vision + reasoning | Claude (vision-capable model) via Anthropic API | Reads leaf photos and writes Bangla; no custom model training |
| Embeddings | Multilingual embedding model (Voyage multilingual or Cohere embed-multilingual; confirm current model name) | Must match Bangla and English queries to cards |
| Vector store | Supabase Postgres + pgvector | Same database as app data; guide-recommended |
| Knowledge base | 6 to 30 disease cards from BRRI, DAE, IRRI, FAO sources | Small, verified, cited; quality beats volume |
| Image storage | None by default (photo processed in memory) | Privacy and data sovereignty |
| Hosting | Supabase + Lovable hosting (serverless) | No servers to manage; scales with usage |
| Fallback if short on time | Python (FastAPI or Streamlit) + Chroma, run locally | Same pipeline, fewer moving parts |

Rows are defaults; swap any if the team already knows another tool. If a tool other than the guide's suggestions is used, record the tool name, URL, and reason.

## Secrets
Anthropic and embedding API keys live only in Supabase Edge Function secrets. Never commit keys; use `.env` locally (git-ignored).
