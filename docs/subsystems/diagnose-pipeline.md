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
verified_at: HEAD_PLACEHOLDER
---

# Diagnose pipeline

The `diagnose` Edge Function turns one leaf photo into a Bangla answer in three steps: observe (Gemini vision returns symptom JSON), retrieve (embed symptoms, call `match_disease_cards` in pgvector), answer (Claude writes Bangla from the retrieved cards only). The web app calls it from `app/src/api.js` after downscaling the image to 1024px JPEG.

Response `status` values: `ok`, `rate_limited`, `busy`, `retry_photo` (not rice or poor photo), `low_confidence`, `no_card`, `bad_request`, `too_large`, `error`. All non-`ok` statuses carry `message_bn` and the UI shows a retry button plus an officer-contact card.

The farmer-facing safeguards are described in the root-level docs (`docs/RESPONSIBLE_AI.md`, `docs/PROMPTS.md`); this page covers the implementation.

> ⚠️ Only cards with `verified = true` AND a non-null `embedding` are ever retrieved (`match_disease_cards`, RLS policy). Until the six cards are source-checked, verified and embedded via `embed-cards`, every request ends in `no_card`. That is intended, not a bug.

> ⚠️ `vector(1024)` in the migration must equal the embedding size (`supabase/functions/_shared/gemini.ts`, `EMBED_DIMS`, model `gemini-embedding-001`, vectors re-normalised because truncated dimensions are not unit length). Changing the model or dimension means altering the column and re-embedding every card (set `embedding = null`, rerun `embed-cards`). Embeddings from different models are not comparable, so never mix them.

> ⚠️ `CONF_THRESHOLD` (0.5) and `SIM_THRESHOLD` (0.3) are placeholders, not measured values. Tune them on the labelled test set before quoting any result.

> ⚠️ Never log or persist the image (`diagnose/index.ts` catch block logs only the error). Privacy is a stated guarantee: photo in memory only, no storage bucket.

> ⚠️ The vision output is parsed by slicing from the first `{` to the last `}`; malformed JSON throws and returns `status: "error"`. Keep the vision prompt asking for JSON only.

> ⚠️ `diagnose` has `verify_jwt = false` (`supabase/config.toml`) for the no-account demo, so anyone with the URL can spend API credit. Add rate limiting before a public launch. `embed-cards` is guarded by the `x-admin-key` header instead.

> ⚠️ Gemini calls fail fast (`supabase/functions/_shared/gemini.ts`): 30 s timeout, one short retry on 429/503, then `GeminiBusyError` and the app shows a "busy" message. An earlier version retried for ~90 s on a 503. Free-tier request and daily limits are unverified, so avoid stress-testing before the demo.

> ⚠️ Gemini model names change and old ones close to new accounts: `gemini-2.5-flash` returned 404 ("no longer available to new users"), `gemini-3.8-flash` returned 503 under load, `gemini-3.5-flash` worked for image + JSON. List the models your key can use with the `models` endpoint before changing `GEMINI_MODEL`. In zsh write `${model}:generateContent`, because `$model:g` is a history modifier and silently breaks the URL.

> ⚠️ Latency depends heavily on the Gemini model: `gemini-3.5-flash` took 12 to 41 s even for a one-word prompt (measured, likely thinking time), `gemini-3.1-flash-lite` took 2 to 7 s, so `GEMINI_MODEL` defaults to flash-lite. Its accuracy on real rice photos is untested; run `docs/EVALUATION.md` before trusting it and keep the response-time KPI measured, not assumed. On failure `diagnose` returns a short `detail` string (status codes only) to help debugging.

> ⚠️ The answer step must return JSON naming ONE card; `diagnose` shows only that card's source and treats an unknown name as `no_card`. Do not go back to dumping every retrieved card's source into the result (it listed unrelated diseases). The answer prompt also forbids changing a statement's subject: the first version garbled a flooding-tolerance sentence.

> ⚠️ The rate limit (10 requests per 10 minutes per IP) is in-memory per function instance, so it is best-effort only and resets on cold start. It protects the free quota, not against a determined attacker. Behind shared mobile networks one IP can be many farmers; raise the limit if that bites.

> ⚠️ Vision candidates are limited to diseases that have a verified, embedded card (`knownCards` in `supabase/functions/diagnose/index.ts`, cached 5 min per instance). Consequences: (1) a disease with no card (hispa) can only ever end in "not sure"; (2) new or newly verified cards appear after the cache expires; (3) the confidence value is the model's own and is poorly calibrated: a field photo labelled blast on Wikimedia came back as sheath blight at 0.85. Do not read it as a probability until tuned on labelled photos (`docs/EVALUATION.md`).

> ⚠️ Test photos need trustworthy labels. The first Wikimedia "Xanthomonas" test image was an 8-panel figure of cabbage, citrus and rice, so the early "correct at 85%" result was meaningless. Wikimedia file names are crowd labels, not expert diagnoses. Use a licensed, expert-labelled dataset for the KPI numbers.
