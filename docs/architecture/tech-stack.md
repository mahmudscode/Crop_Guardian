---
title: "Tech stack"
type: architecture
created: 2026-11-20
updated: 2026-11-20
sources:
  - code: app/package.json
  - code: supabase/functions/_shared/gemini.ts
verified_at: 76d2379
---

# Tech stack

Follows the Congress reference architecture (React UI, Supabase backend with pgvector, LLM intelligence layer): fast to build and easy to defend to judges.

| Layer | Choice | Why |
|---|---|---|
| UI | React + Vite + Tailwind (hand-built in `app/`), mobile-first, Bangla UI strings | Simple single page; full control and version history in this repo. The guide suggests Lovable but tool choice does not affect scoring |
| Backend / API | Supabase Edge Functions | Keeps API keys server-side; one place for the pipeline |
| Vision + reasoning | Google Gemini (`gemini-3.1-flash-lite`, confirm current name) via the free-tier Gemini API, with automatic fallback to other Gemini lite models when the primary is overloaded or out of quota (`GEMINI_FALLBACK_MODELS`) | Reads leaf photos and writes Bangla; free tier means no billing; no custom model training |
| Embeddings | Gemini `gemini-embedding-001` at 1024 dims (free tier; confirm current model name) | Must match Bangla and English queries to cards |
| Vector store | Supabase Postgres + pgvector | Same database as app data; guide-recommended |
| Knowledge base | 6 to 30 disease cards from BRRI, DAE, IRRI, FAO sources | Small, verified, cited; quality beats volume |
| Image storage | None by default (photo processed in memory) | Privacy and data sovereignty |
| Hosting | Supabase (backend) + Vercel Hobby (static web app, live at https://crop-guardian-ten.vercel.app) | No servers to manage; free tiers; scales with usage |
| Fallback if short on time | Python (FastAPI or Streamlit) + Chroma, run locally | Same pipeline, fewer moving parts |

Rows are defaults; swap any if the team already knows another tool. If a tool other than the guide's suggestions is used, record the tool name, URL, and reason.

## Secrets
The Gemini API key lives only in Supabase Edge Function secrets. Never commit keys; use `.env` locally (git-ignored).
