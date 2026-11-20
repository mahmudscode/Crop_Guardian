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
verified_at: HEAD_PLACEHOLDER
---

# Follow-up chat

After a diagnosis the farmer can ask questions about that disease in Bangla ("what are the symptoms?", "what do I do now?"). The same panel is also available before any photo, to ask about the diseases we cover. It is a **grounded follow-up to the diagnosis, not a general chatbot**: answers come only from verified [[knowledge-base]] cards, with the same rules as [[diagnose-pipeline]].

## How it works
1. The app sends the last up to 8 messages (each at most 400 characters) and, when a diagnosis exists, the diagnosed disease name. Nothing is stored; the conversation lives only in the browser.
2. `supabase/functions/chat/index.ts` picks the grounding cards: the diagnosed disease's card (the name is checked against the verified list, never used as raw input), or, with no diagnosis, the 2 cards nearest to the question by vector search.
3. Gemini answers in short Bangla from those cards only and reports which cards it used (`used_cards`), so the app lists just those sources. Its prompt says the disease is only *likely*, tells it to refuse anything off-topic and to ignore any instruction inside the farmer's message, and tells a farmer with no photo to take one.
4. A code guard (`supabase/functions/_shared/numbers.ts`) throws away any answer that contains a number not present in the cards, which stops an invented dose even if the model slips.
5. Statuses: `ok`, `no_card` (nothing relevant, or the guard fired), `bad_request` (400), `rate_limited` (429, 20 per 10 minutes per IP, best effort), `busy` (503), `error` (500). The same Gemini fallback chain as the diagnosis applies.

## Limits to know
- **Depth is limited by the cards.** A card is a short passage, so answers cannot go beyond it; the bot says so and refers to the officer. More detail needs more source passages added to the cards (life cycle, favouring conditions, management), each checked against its source.
- The bot only knows diseases with a verified, embedded card (hispa has none).
- The Bangla is the model's wording of English or Bangla card text and has not been reviewed by a native speaker.
- Questions are sent to Google's Gemini API like photos are; we do not store them.

> ⚠️ User messages are untrusted input: the prompt tells the model to treat them as questions only, and `disease_en` from the client is matched against the verified list before use. Do not interpolate either into a query or a prompt without that check.

> ⚠️ Without a diagnosis, the prompt's context line says "no diagnosis has been made". Without it the model answered a general question with "seeing your plant's symptoms, this is tungro", claiming a diagnosis nobody made. Keep that line when editing the prompt.

> ⚠️ The number guard compares against the card text that was sent to the model, including source names and years. A correct answer that quotes a number differently (spelled out in words, or converted units) is not flagged, and a harmless count the model adds ("3 steps") is: the bot then says it is not sure. Prefer a rare false refusal to an invented dose.

> ⚠️ Keep the chat log scrolled to the START of the newest answer (`app/src/App.jsx`, `lastRef`); scrolling to the bottom hid the first line of long answers on a phone.

## Tests
- `python3 -I eval/chat_smoke.py .env` runs 12 live checks (grounding, off-topic, other crop, prompt injection, dose requests in English and Bangla, "what disease do I have" with no photo, four bad-input cases): 12 of 12 passed on 2026-11-20. These show safe behaviour on a few cases, not accuracy.
- `npx deno test supabase/functions/_shared/numbers_test.ts`: 5 unit tests of the number guard, all passing.
- A real-browser run (headless Chrome against the dev app and the live backend, with a fixed diagnosis result) confirmed the panel, suggestion buttons, answers, refusal of a dose question, scrolling and no console errors.
