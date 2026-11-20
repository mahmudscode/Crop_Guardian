---
title: Diagnose pipeline (Edge Function)
type: subsystem
created: 2026-11-20
updated: 2026-11-20
sources:
  - code: supabase/functions/diagnose/index.ts
  - code: supabase/functions/embed-cards/index.ts
  - code: supabase/functions/_shared/gemini.ts
  - code: supabase/migrations/20261120000000_disease_cards.sql
  - code: app/src/api.js
verified_at: be5faf0
---

# Diagnose pipeline

The `diagnose` Edge Function turns one leaf photo into a Bangla answer in three steps: observe (Gemini vision returns symptom JSON), retrieve (embed symptoms, call `match_disease_cards` in pgvector), answer (Claude writes Bangla from the retrieved cards only). The web app calls it from `app/src/api.js` after downscaling the image to 1024px JPEG.

Response `status` values: `ok`, `retry_photo` (not rice or poor photo), `low_confidence`, `no_card`, `bad_request`, `too_large`, `error`. All non-`ok` statuses carry `message_bn` and the UI shows a retry button plus an officer-contact card.

The farmer-facing safeguards are described in the root-level docs (`docs/RESPONSIBLE_AI.md`, `docs/PROMPTS.md`); this page covers the implementation.

> ⚠️ Only cards with `verified = true` AND a non-null `embedding` are ever retrieved (`match_disease_cards`, RLS policy). Until the six cards are source-checked, verified and embedded via `embed-cards`, every request ends in `no_card`. That is intended, not a bug.

> ⚠️ `vector(1024)` in the migration must equal the embedding size (`supabase/functions/_shared/gemini.ts`, `EMBED_DIMS`, model `gemini-embedding-001`, vectors re-normalised because truncated dimensions are not unit length). Changing the model or dimension means altering the column and re-embedding every card (set `embedding = null`, rerun `embed-cards`). Embeddings from different models are not comparable, so never mix them.

> ⚠️ `CONF_THRESHOLD` (0.5) and `SIM_THRESHOLD` (0.3) are placeholders, not measured values. Tune them on the labelled test set before quoting any result.

> ⚠️ Never log or persist the image (`diagnose/index.ts` catch block logs only the error). Privacy is a stated guarantee: photo in memory only, no storage bucket.

> ⚠️ The vision output is parsed by slicing from the first `{` to the last `}`; malformed JSON throws and returns `status: "error"`. Keep the vision prompt asking for JSON only.

> ⚠️ `diagnose` has `verify_jwt = false` (`supabase/config.toml`) for the no-account demo, so anyone with the URL can spend API credit. Add rate limiting before a public launch. `embed-cards` is guarded by the `x-admin-key` header instead.

> ⚠️ Gemini free-tier calls can return HTTP 429 when rate limited; `_shared/gemini.ts` retries twice after 15 s. The free tier has request and daily limits (unverified, check Google's page), so rate-limit `diagnose` and avoid stress-testing before the demo.
