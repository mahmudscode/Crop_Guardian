---
title: "Crop Guardian project guide"
type: concept
created: 2026-11-20
updated: 2026-11-20
sources:
  - code: supabase/functions/diagnose/index.ts
  - code: supabase/functions/_shared/gemini.ts
  - code: supabase/functions/embed-cards/index.ts
  - code: supabase/functions/chat/index.ts
  - code: supabase/migrations/20261120000000_disease_cards.sql
  - code: app/src/App.jsx
  - code: eval/score.py
verified_at: 1421a00
---

# Crop Guardian: project guide

The one document to read first, for a teammate, a judge, or an AI assistant picking up this repository. It states what the project is, how it works, what is real versus unfinished, how to run it, and the rules for changing it. It contains no secret values, only the names of variables.

## 1. What it is

A Bangladeshi rice farmer photographs a sick leaf. The app replies in simple Bangla with a likely disease, what to do now, how to prevent it, a confidence badge and the cited source. If the photo is unclear, not rice, or matches no verified card, it says "not sure" and refers the farmer to the local agriculture officer.

- **One core use case:** photo in, Bangla diagnosis out, plus a grounded follow-up chat about the diagnosed disease ([[chat-assistant]]). It is not a general chatbot. Do not add other features.
- **Users:** smallholder rice farmers and extension workers on basic phones and weak connections.
- **Disease scope:** blast, bacterial leaf blight, brown spot, sheath blight, tungro (5 have cards) and hispa (an insect pest, card still missing).
- **AI approach:** a general multimodal model (Google Gemini) looks at the photo; retrieval over human-checked disease cards (RAG) supplies the advice so the model cannot invent treatments. There is no custom-trained model.
- **Context:** International AI Builders Congress (AIBC) 2026, AgriSphere AI area "Crop Guardian" (early pest and disease detection from imagery with local-language UX). Team-Built Product track. Source requirement PDFs are in `docs/source-material/`.

## 2. Status snapshot (2026-11-20)

| Area | State |
|---|---|
| Database + search (Supabase Postgres, pgvector) | Deployed and working |
| Edge Functions `diagnose` and `embed-cards` | Deployed and working |
| Follow-up chat | Deployed. Answers only from verified cards, refuses off-topic and dose questions; 12 of 12 live smoke checks and 5 guard unit tests pass. Depth is limited by the short cards |
| Web app (`app/`) | Hosted on Vercel's free tier at https://crop-guardian-ten.vercel.app, talking to the deployed backend. Gemini's free models are sometimes overloaded, so it can answer "server busy" |
| Disease cards | 5 of 6 filled from cited sources. Hispa has no source text yet. Bangla text is a Claude translation that **no native speaker has reviewed** |
| Card verification | The pipeline only uses cards with `verified = true`. `supabase/seed.sql` ships them as `false`. The live database currently holds the 5 filled cards as `verified = true` with `verified_by = 'TEST ONLY - not human-reviewed'`. A teammate must check each card against its source and set the real values |
| Accuracy | **Not yet measured properly.** An informal 42-photo test found the first version named a disease for most leaves. An evidence gate cut wrong answers shown from 30 to 14 and stopped false alarms on healthy leaves, but correct detections fell from 5 to 2 of 12 and about 88% of the answers still shown are wrong. Tuned on the same photos, so optimistic. Details in `docs/operations/evaluation.md`. Do not quote any accuracy figure from it |
| Demo video (180 s) | Not recorded |
| Business / monetization note | Written in `PROJECT_REPORT.md` section 10: sourced loss figures and a measured cost per diagnosis; who pays and how much are unvalidated assumptions |

> ⚠️ Treat the accuracy line as the most important caveat. Claims in the pitch must be measured numbers (project rule).

## 3. How it works

```
Phone photo -> React app (resize to 1024px JPEG)
  -> Supabase Edge Function `diagnose`
       1. list verified cards (names + source symptom text)
       2. Gemini vision: assess healthy / listed / other / unclear; for "listed", up to 3 candidates ONLY from that list, with the card features it sees and does not see; Bangla symptoms. Code computes the confidence from that evidence
       3. embed symptoms (Gemini embedding, 1024 dims) -> pgvector `match_disease_cards` -> top 3 cards
       4. Gemini answer: choose ONE card, write Bangla sections using only that card's text
  -> JSON -> app shows diagnosis, steps, symptoms, source, confidence, officer note
```

Refusals happen at several points: not rice, poor or unclear photo (`retry_photo`); the model judges the leaf healthy (`healthy_like`); damage that does not clearly match a card, or fewer than two visible card features (`low_confidence`); no matching card (`no_card`). The displayed confidence is the share of a card's described features the model reports seeing, computed in code, not a probability. Photos are processed in memory and never stored by this project (Google receives them for analysis; see section 8).

Prompt rules live in `docs/reference/prompts.md`; the code in `supabase/functions/diagnose/index.ts` is the source of truth.

## 4. Repository map

```
app/                        React + Vite + Tailwind web app (Bangla UI)
  src/App.jsx               single page: pick photo, call API, render result
  src/api.js                image resize + call to the diagnose function
supabase/
  migrations/               database schema (disease_cards table, vector search function)
  seed.sql                  the 6 disease cards (names + source-based text)
  functions/diagnose/       main API
  functions/chat/           follow-up chat: answers questions from verified cards (see chat-assistant page)
  functions/embed-cards/    admin-only: embeds cards that lack an embedding
  functions/_shared/        Gemini helpers (generate, embed), CORS
  config.toml               function settings
eval/                       scripts and saved results for the photo comparison (no photos committed)
docs/                       wiki (this guide, architecture, prompts, evaluation, setup, ...) - start at docs/index.md
  source-material/          the hackathon requirement PDFs
.env.example, app/.env.example   names of required variables (no values)
```

## 5. Backend contract

`POST {SUPABASE_URL}/functions/v1/diagnose` with JSON `{"image_base64": "<no data: prefix>", "media_type": "image/jpeg"}` (jpeg, png or webp, max about 7 MB of base64). Every response includes `status` and `model`.

| `status` | HTTP | Meaning | Extra fields |
|---|---|---|---|
| `ok` | 200 | A card-backed answer | `sections` {diagnosis_bn, what_to_do_bn[], prevention_bn[]}, `answer_bn`, `confidence`, `top_candidate`, `disease_en`, `disease_bn`, `sources[]`, `observation`, `seconds` |
| `retry_photo` | 200 | Not rice or poor photo | `message_bn` |
| `healthy_like` | 200 | Model sees no clear lesions | `message_bn` |
| `low_confidence` / `no_card` | 200 | Not sure, refer to officer | `message_bn` |
| `rate_limited` | 429 | More than 10 requests per 10 minutes per IP (best effort) | `message_bn` |
| `busy` | 503 | Gemini overloaded or timed out | `message_bn` |
| `bad_request` / `too_large` / `error` | 400 / 413 / 500 | Input or server error | `message_bn`, `detail` (short, no image data) |

A request with header `x-admin-key` equal to the `ADMIN_KEY` secret skips the rate limit (used by `eval/`). `embed-cards` requires the same header.

**Chat:** `POST {SUPABASE_URL}/functions/v1/chat` with `{"messages": [{"role": "user"|"assistant", "content": "..."}], "disease_en": "Blast"}` (`disease_en` optional; at most 8 messages of 400 characters, last one from the user). Returns `status` `ok` (`answer_bn`, `answered_from_card`, `disease_en[]`, `sources[]`), `no_card` (`answer_bn`), `bad_request` 400, `rate_limited` 429 (20 per 10 minutes per IP), `busy` 503 or `error` 500. Details: [[chat-assistant]].

## 6. Data model

Table `disease_cards`: `id`, `crop`, `disease_name_en`, `disease_name_bn`, `symptoms_en`, `symptoms_bn`, `cause`, `treatment_bn`, `prevention_bn`, `severity_note`, `source_name`, `source_url`, `source_page`, `verified`, `verified_by`, `embedding vector(1024)`. Row level security lets anyone read only `verified` cards; writes need the service role. Function `match_disease_cards(query_embedding, match_count, min_similarity)` returns the nearest verified cards.

Card rules: text only from the cited source; pesticide names copied exactly or left out; never a dose from memory; a teammate verifies each card. Details in `docs/subsystems/knowledge-base.md`.

## 7. Configuration and secrets

| Name | Where it lives | Secret? |
|---|---|---|
| `GEMINI_API_KEY` | Supabase secret; local `.env` | **Yes** |
| `ADMIN_KEY` | Supabase secret; local `.env` | **Yes** |
| `GEMINI_MODEL`, `GEMINI_FALLBACK_MODELS`, `GEMINI_EMBED_MODEL`, `CHAT_SIM_THRESHOLD`, `SIM_THRESHOLD`, `MIN_MATCHES`, `EVIDENCE_MIN_RATIO` | Supabase secret; local `.env` | No |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Injected into functions by Supabase | **Service role key: yes** |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | `app/.env` | Anon key is public by design |
| Supabase access token (`sbp_...`), database password | Your own login / password manager | **Yes** |

**Never commit `.env` files or any secret.** Commit only `.env.example`, which lists names. If a secret is ever pasted into chat or committed, revoke or rotate it immediately.

The live default model is `gemini-3.1-flash-lite` (fast). `gemini-3.5-flash` was 20 to 40 seconds or more per photo, so it is not the default. Changing the `GEMINI_MODEL` secret changes the live app at once. Model names change and old ones close to new accounts, so list available models before changing it.

## 8. Teammate onboarding

1. `git clone https://github.com/mahmudscode/Crop_Guardian.git`
2. Frontend: `cd app && cp .env.example .env`, fill the two `VITE_` values (project owner gives them, or copy from the Supabase dashboard under Project Settings > API), then `npm install && npm run dev` and open http://localhost:5173.
3. Backend work (optional): create your own free Gemini key at https://aistudio.google.com/apikey (one key per person, do not share keys, the free quota is shared per key). Copy `.env.example` to `.env`. To deploy, you need Supabase access: the owner invites you to the Supabase organization, then `npx supabase login`, `npx supabase link --project-ref <ref>`.
4. Share secrets only through a password manager or a private message, never through GitHub, screenshots or group chats.

Privacy note: photos are not stored by us, but they are sent to Google's Gemini API. The free tier's terms may let Google use submitted content to improve its products (check Google's current terms). State this in the pitch; do not claim photos never leave the user's control.

## 9. Common commands

| Task | Command |
|---|---|
| Run the web app | `cd app && npm run dev` |
| Build the web app | `cd app && npm run build` |
| Chat safety checks | `python3 -I eval/chat_smoke.py .env` (live) and `npx deno test supabase/functions/_shared/numbers_test.ts` |
| Type-check functions | `npx deno check supabase/functions/diagnose/index.ts` (Edge Functions run on Deno, not Node, so VS Code may show false errors without the Deno extension) |
| Apply database changes | `npx supabase db push --remote` |
| Deploy a function | `npx supabase functions deploy diagnose --remote=<ref> --use-api --yes` |
| Embed cards | `curl -X POST <SUPABASE_URL>/functions/v1/embed-cards -H "x-admin-key: <ADMIN_KEY>"` |
| Compare methods on photos | see `eval/README.md` |
| Check docs integrity | `python3 .claude/scripts/docs-lint.py --root .` |

## 10. Rules for anyone (human or AI) changing this repo

- Treatment advice comes only from verified, cited cards. Never invent a pesticide, a dose or a source.
- Keep one core use case: photo to Bangla diagnosis, plus the grounded follow-up chat. The chat must stay card-grounded (never a general chatbot). Do not add accounts, storage of photos or conversations, or other features.
- Never commit secrets. Keys live in Supabase secrets and local `.env` files.
- Report only measured evaluation numbers. Re-run the evaluation after changing a prompt or the model.
- Bangla text from a machine needs a native reader before it is called reviewed.
- When code changes, update the matching wiki page and its `verified_at` (`docs/CLAUDE.md`). Put traps in `> ⚠️` paragraphs.
- Do not run `git add -A` blindly; stage what you changed.

## 11. Decisions already made

- **No Lovable:** the UI is hand-built in `app/` for full control and version history.
- **Gemini free tier instead of a paid model:** the team wanted no paid services. Trade-off: weaker, over-confident vision and a privacy caveat.
- **Cards gate everything:** an unverified card is invisible to the app, so nothing unreviewed can reach a farmer.
- **Vision limited to known diseases:** stops the model naming diseases we have no advice for; it cannot remove wrong guesses among the ones we do have.
- **Pretrained classifier rejected for now:** `Huyt/rice-leaf-disease-efficientnet-b0` found disease in only 2 of 12 test photos. Revisit with training data that matches phone photos.

## 12. Open work, by priority

1. The over-confidence gate reduced wrong answers but not the model's inability to tell diseases apart; next: fresh photos, a stronger or fine-tuned vision component, and re-measure.
2. Deepen the chat: add more source passages to the cards (life cycle, favouring conditions, management), each checked against its source, so answers can go beyond the short card text.
3. Measure accuracy on 10 to 15 expert-labelled rice photos from a licensed dataset, ideally also phone photos from a real field; fill `docs/operations/evaluation.md`.
3. Verify the cards against their sources (a teammate) and have a Bangla reader review the translations; write the hispa card from a real source.
4. (Done) Web app hosted on Vercel; keep an eye on Gemini availability before the demo and have a recorded video as a fallback.
5. Record the 180-second video (`docs/operations/demo-script.md`).
6. Validate the business assumptions in `PROJECT_REPORT.md` section 10 (who pays, pricing, loss avoided) with a partner or pilot, and put the sourced parts in the pitch.
7. Housekeeping: revoke any access token or password that was pasted in chat; confirm the submission cutoff time on the portal (the guide says the preliminary submission closes 2026-11-20).

## 13. Where to look next

The wiki index (`docs/index.md`) lists every page. Start with [[diagnose-pipeline]] for implementation traps, [[knowledge-cards]] for the cards, and the planning pages linked from the index for problem statement, architecture, prompts, evaluation and the submission checklist.
