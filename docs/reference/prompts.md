---
title: "Prompts"
type: reference
created: 2026-11-20
updated: 2026-11-20
sources:
  - code: supabase/functions/diagnose/index.ts
verified_at: 33e0bef
---

# Prompts

Two prompts: the first only observes, the second only answers from retrieved cards. Keep in the repo; re-run evaluation after any change.

## Step 1: vision prompt (returns JSON)

Source of truth is `visionPrompt` in `supabase/functions/diagnose/index.ts`. It is built per request:

- It lists ONLY the diseases that have a verified, embedded card, each with that card's source symptom text, so the model compares what it sees with the sources and not with its own memory
- `candidates`: up to 3, chosen only from that list, with a 0-1 confidence; "None of these" if nothing fits; below 0.5 when unsure
- Returns `is_rice`, `symptoms` (English, used for retrieval), `symptoms_bn` (Bangla, shown to the farmer), `candidates`, `photo_quality`
- No treatment advice at this step
- Candidates outside the list are dropped in code, so an unsupported disease can never be named

## Step 2: answer prompt (Bangla, grounded; returns JSON)

Source of truth is `ANSWER_PROMPT` in `supabase/functions/diagnose/index.ts`. Summary of its rules:

- Use ONLY facts in the retrieved disease cards; do not add, infer or generalise
- Copy product names exactly; never add a dose or a product the card lacks
- Keep each fact's meaning exactly (found in testing: the model once turned "varieties cannot tolerate flooding" into "cannot tolerate the disease")
- The vision step's most likely disease is passed in as `[likely disease]`; use that card unless the symptoms clearly contradict it. Return `{"disease_en", "diagnosis_bn", "what_to_do_bn": [...], "prevention_bn": [...]}` (short sentences)
- Wording must say the disease is *likely*, never certain
- The app, not the model, adds the source: only the chosen card's source is shown

## Routing rules (Edge Function)
- `photo_quality == "poor"` or not rice: skip step 2, return "send another photo" message
- Top candidate confidence below threshold (tune on test set): ask for another photo and refer to officer
- No card above similarity threshold: say not sure, refer to officer
- If the model picks no card, return the "not sure, contact officer" message
- Gemini overloaded or timed out: return a "server busy, try again" message (HTTP 503); more than 10 requests per 10 minutes per IP: HTTP 429
- Always display confidence and the chosen card's source name
