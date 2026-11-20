# Prompts

Two prompts: the first only observes, the second only answers from retrieved cards. Keep in the repo; re-run evaluation after any change.

## Step 1: vision prompt (returns JSON)

```
You are a rice plant-health assistant. Look at the leaf photo.
Describe only what you can see: lesion shape, colour, size, position.
Return JSON: {"symptoms": [...], "candidates": [{"name_en": "...",
"confidence": 0-1}], "photo_quality": "good|poor"}
If the photo is not a rice plant or is unclear, say so. Do not give
treatment.
```

## Step 2: answer prompt (Bangla, grounded; returns JSON)

Source of truth is `ANSWER_PROMPT` in `supabase/functions/diagnose/index.ts`. Summary of its rules:

- Use ONLY facts in the retrieved disease cards; do not add, infer or generalise
- Copy product names exactly; never add a dose or a product the card lacks
- Keep each fact's meaning exactly (found in testing: the model once turned "varieties cannot tolerate flooding" into "cannot tolerate the disease")
- Choose ONE card; return `{"disease_en": "<chosen card or null>", "answer_bn": "..."}`
- Format: 1) likely disease 2) what to do now 3) how to prevent it, then advise contacting the local agriculture officer if serious
- The app, not the model, adds the source: only the chosen card's source is shown

## Routing rules (Edge Function)
- `photo_quality == "poor"` or not rice: skip step 2, return "send another photo" message
- Top candidate confidence below threshold (tune on test set): ask for another photo and refer to officer
- No card above similarity threshold: say not sure, refer to officer
- If the model picks no card, return the "not sure, contact officer" message
- Gemini overloaded or timed out: return a "server busy, try again" message (HTTP 503); more than 10 requests per 10 minutes per IP: HTTP 429
- Always display confidence and the chosen card's source name
