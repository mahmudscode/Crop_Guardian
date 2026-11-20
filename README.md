# Crop Guardian

**A Bangladeshi rice farmer photographs a sick leaf and gets a simple Bangla diagnosis with treatment steps, each backed by a cited agronomy source. When the evidence is weak, it says "not sure" and refers the farmer to the local agriculture officer.**

Built for the International AI Builders Congress (AIBC) 2026, AgriSphere AI challenge area "Crop Guardian" (early pest and disease detection from imagery, with local-language UX).

**Live app:** https://crop-guardian-ten.vercel.app (free Vercel hosting; the backend runs on free Supabase and Gemini tiers, so it can be slow or say "server busy" when Google's free models are overloaded).

**Full write-up:** [`PROJECT_REPORT.md`](PROJECT_REPORT.md) (problem, architecture, build story, measured results, limitations).

> **New here (teammate, judge, or AI assistant)? Read [`docs/concepts/project-guide.md`](docs/concepts/project-guide.md) first.** It covers what the project is, current status, how it works, how to run it, and the rules for changing it.

## What it does

| | |
|---|---|
| **User** | Smallholder rice farmers and extension workers, on a basic phone and a weak connection |
| **Core use case (only one)** | Photo in, Bangla diagnosis and next steps out |
| **Diseases** | Blast, bacterial leaf blight, brown spot, sheath blight, tungro (cards written); hispa (card still missing) |
| **AI approach** | A multimodal model (Google Gemini) reads the photo; retrieval over human-checked disease cards (RAG) supplies the advice, so the model cannot invent treatments |
| **Safeguards** | Only verified, cited cards can reach a farmer; not-rice or unclear photos are refused; photos are not stored by us; confidence and source are always shown |

## How it works

```text
Phone photo -> React web app -> Supabase Edge Function
   1. Gemini vision: candidates chosen ONLY from diseases that have a verified card
   2. Embed symptoms -> pgvector search -> best matching cards
   3. Gemini answer in Bangla, written from ONE card's text only
-> diagnosis, what to do, prevention, source, confidence (or "not sure, ask the officer")
```

Details: [`docs/architecture/system-architecture.md`](docs/architecture/system-architecture.md), prompts: [`docs/reference/prompts.md`](docs/reference/prompts.md).

## Tech stack

React + Vite + Tailwind (Bangla-first UI) · Supabase (Postgres + pgvector, Edge Functions on Deno) · Google Gemini (vision, answers, embeddings; free tier) · no custom-trained model. Rationale: [`docs/architecture/tech-stack.md`](docs/architecture/tech-stack.md).

## Repository layout

```text
app/        React web app (single page)
supabase/   database schema, disease cards (seed.sql), Edge Functions (diagnose, embed-cards)
eval/       scripts and saved results for the photo comparison (no photos committed)
docs/       wiki: guide, architecture, prompts, evaluation, setup, submission checklist
            docs/source-material/ holds the hackathon requirement PDFs
```

## Run it

Needs Node 20+. Teammates get the two `VITE_` values from the project owner (never from git).

```bash
cd app
cp .env.example .env      # fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev               # http://localhost:5173
```

Backend setup and deployment: [`docs/operations/setup.md`](docs/operations/setup.md). **Never commit `.env` files or keys**; `.env.example` lists the variable names only.

## Honest status

- **Working:** database, search, both Edge Functions and the web app run end to end against a deployed Supabase project; the web app is hosted on Vercel's free tier (link above).
- **Cards:** 5 of 6 are written from cited sources (IRRI, Pacific Pests, Pathogens and Weeds). The Bangla text is a machine translation that still needs a native reader, and cards still need human verification against their sources.
- **Accuracy is not yet established.** An informal 42-photo comparison (see [`docs/operations/evaluation.md`](docs/operations/evaluation.md)) found the pipeline over-confident: it named a disease for most leaves, including ones we have no card for. We report only measured numbers and do not claim an accuracy figure.
- **Privacy:** photos are not stored by this project, but they are sent to Google's Gemini API for analysis.

## Judging criteria: where to look

| Criterion | Evidence |
|---|---|
| Innovation and AI-native design | Cards gate every answer; vision limited to known diseases: [project guide](docs/concepts/project-guide.md), [prompts](docs/reference/prompts.md) |
| Technical excellence and architecture | [architecture](docs/architecture/system-architecture.md), [`supabase/functions/`](supabase/functions/), [implementation traps](docs/subsystems/diagnose-pipeline.md) |
| Business value and viability | [Report section 10](PROJECT_REPORT.md#10-business-value-and-viability): sourced loss figures, measured cost per diagnosis, payer hypotheses (not yet validated) |
| Scalability and real-world impact | [roadmap](docs/concepts/roadmap.md), [problem](docs/concepts/problem.md) |
| Responsible AI, data sovereignty | [safeguards](docs/concepts/responsible-ai.md), [evaluation limits](docs/operations/evaluation.md) |

Submission checklist: [`docs/operations/submission-checklist.md`](docs/operations/submission-checklist.md).

## Team

| Member | Role |
|---|---|
| _to be filled_ | _the guide asks each role to be owned by a named member_ |
