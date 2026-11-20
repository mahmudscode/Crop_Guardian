# Crop Guardian

Bangla rice-disease diagnosis from a leaf photo, grounded by RAG over cited disease cards. Hackathon project (AIBC 2026, AgriSphere AI). See [README.md](README.md) and [docs/](docs/).

## Rules
- One core use case only: photo in, Bangla diagnosis out, 6 rice diseases.
- Treatment advice must come only from human-verified disease cards. Never invent pesticide names or doses.
- Photos are processed in memory, never stored.
- API keys only in Supabase secrets / `.env` (git-ignored).
- Report only measured evaluation numbers.
- Prompts in [docs/reference/prompts.md](docs/reference/prompts.md) are the source of truth; re-run evaluation after changing them.

## Stack
React + Vite + Tailwind UI (`app/`), Supabase Edge Functions, Google Gemini (free tier) for vision, answers and multilingual embeddings, Supabase Postgres + pgvector. Fallback: FastAPI/Streamlit + Chroma.
