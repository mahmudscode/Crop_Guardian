---
title: "Build plan (about 3.5 hours)"
type: history
created: 2026-11-20
updated: 2026-11-20
sources:
  - code: docs/source-material/Crop_Guardian_Tech_Stack_and_System_Architecture.pdf
verified_at: 4d9c993
---

# Build plan (about 3.5 hours)

Confirm the exact cutoff time on the submission portal first (preliminary submission closes Nov 20, 2026).

1. **Cards (60 min).** Collect sources for 6 diseases, build cards, have a teammate check each one.
2. **Pipeline (60 min).** Load cards into pgvector; write the Edge Function: vision, retrieve, answer.
3. **UI (30 min).** Upload screen, Bangla result card, confidence badge, "ask an officer" fallback.
4. **Test (30 min).** Run labelled photos, fill the results table, fix the worst failure.
5. **Video (30 min).** Record 180 seconds (see [[demo-script]]).

## Fallback
Python (FastAPI or Streamlit) + Chroma, run locally.
