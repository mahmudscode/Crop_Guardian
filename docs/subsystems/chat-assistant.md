---
title: "Follow-up chat (chat Edge Function)"
type: subsystem
created: 2026-11-20
updated: 2026-11-20
sources:
  - code: supabase/functions/chat/index.ts
  - code: supabase/functions/_shared/numbers.ts
  - code: supabase/functions/_shared/numbers_test.ts
  - code: app/src/App.jsx
  - code: app/src/api.js
  - code: eval/chat_smoke.py
  - code: supabase/migrations/20261120120000_disease_passages.sql
  - code: supabase/seed_passages.sql
verified_at: 1421a00
---

# Follow-up chat

After a diagnosis the farmer can ask questions about that disease in Bangla ("what are the symptoms?", "what do I do now?"). The same panel is also available before any photo, to ask about the diseases we cover. It is a **grounded follow-up to the diagnosis, not a general chatbot**: answers come only from verified [[knowledge-base]] cards, with the same rules as [[diagnose-pipeline]].

## How it works
1. The app sends the last up to 8 messages (each at most 400 characters) and, when a diagnosis exists, the diagnosed disease name. Nothing is stored; the conversation lives only in the browser.
2. `supabase/functions/chat/index.ts` picks what grounds the answer: the diagnosed disease's card (the name is checked against the verified list, never used as raw input), or with no diagnosis the 2 nearest cards; plus the 4 **source passages** nearest to the question (limited to that disease when diagnosed), found by vector search in the `disease_passages` table. Passages are what let the chat go deeper than the short card: how the disease survives and spreads, what favours it, its impact and the management options.
3. Gemini receives the cards and passages as numbered items (C1, P1...), answers in short Bangla from them only, and reports which it used (`used`), so the app lists just those sources (a passage's source names its section so it can be checked). Its prompt says the disease is only *likely*, tells it to refuse anything off-topic and to ignore any instruction inside the farmer's message, and tells a farmer with no photo to take one.
4. A code guard (`supabase/functions/_shared/numbers.ts`) throws away any answer that contains a number not present in the cards, which stops an invented dose even if the model slips.
5. If the question cannot be embedded while a diagnosis exists, the chat answers from the card alone. Statuses: `ok`, `no_card` (nothing relevant, or the guard fired), `bad_request` (400), `rate_limited` (429, 20 per 10 minutes per IP, best effort), `busy` (503), `error` (500). The same Gemini fallback chain as the diagnosis applies.

## Limits to know
- **Depth comes from reviewed passages.** 52 passages are loaded (13 sheath blight, 12 tungro, 10 bacterial leaf blight, 9 blast, 8 brown spot), but **none is verified yet, so the chat does not use them** (the database only exposes verified rows). Until a person checks them with [[passage-review]], answers can go no further than the short cards, and the bot says so and refers to the officer. Hispa has neither a card nor passages.
- The bot only knows diseases with a verified, embedded card (hispa has none).
- The Bangla is the model's wording of English or Bangla card text and has not been reviewed by a native speaker.
- Questions are sent to Google's Gemini API like photos are; we do not store them.

> ⚠️ User messages are untrusted input: the prompt tells the model to treat them as questions only, and `disease_en` from the client is matched against the verified list before use. Do not interpolate either into a query or a prompt without that check.

> ⚠️ Without a diagnosis, the prompt's context line says "no diagnosis has been made". Without it the model answered a general question with "seeing your plant's symptoms, this is tungro", claiming a diagnosis nobody made. Keep that line when editing the prompt.

> ⚠️ The number guard compares against the card text that was sent to the model, including source names and years. A correct answer that quotes a number differently (spelled out in words, or converted units) is not flagged, and a harmless count the model adds ("3 steps") is: the bot then says it is not sure. Prefer a rare false refusal to an invented dose.

> ⚠️ Passages hold source facts restated in English; the model turns them into Bangla, so the Bangla wording is unreviewed. Passages for blast, brown spot and bacterial leaf blight were written from a *summary* of the Pacific Pests page, not its text, so their numbers need the most careful check. A wrong passage reaches farmers only after someone sets `verified = true`: do not do that without checking it against its source.

> ⚠️ Keep the chat log scrolled to the START of the newest answer (`app/src/App.jsx`, `lastRef`); scrolling to the bottom hid the first line of long answers on a phone.

## Tests
- `python3 -I eval/chat_smoke.py .env --depth` adds 5 checks that a passage is used and its numbers are quoted; they need reviewed passages and have **not been run** (none verified yet).
- `python3 -I eval/chat_smoke.py .env` runs 12 live checks (grounding, off-topic, other crop, prompt injection, dose requests in English and Bangla, "what disease do I have" with no photo, four bad-input cases): 12 of 12 passed on 2026-11-20. These show safe behaviour on a few cases, not accuracy.
- `npx deno test supabase/functions/_shared/numbers_test.ts`: 5 unit tests of the number guard, all passing.
- A real-browser run (headless Chrome against the dev app and the live backend, with a fixed diagnosis result) confirmed the panel, suggestion buttons, answers, refusal of a dose question, scrolling and no console errors.
