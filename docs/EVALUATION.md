# Evaluation and KPIs

Test on 10 to 15 labelled rice leaf photos before recording and report the actual numbers. Do not quote a target you have not measured.

| Metric | How to measure | Why judges care |
|---|---|---|
| Diagnosis accuracy | Correct top disease on labelled test photos, out of total | Proves the AI works |
| Grounding | Share of answers whose treatment appears in a retrieved card (manual check) | Proves no invented advice |
| Safe refusal | Share of poor or non-rice photos that get a "send another photo" reply | Proves responsible AI |
| Response time | Seconds from upload to Bangla answer | Proves it is usable in the field |

## Test images
Use a public rice leaf disease dataset (Kaggle or Mendeley; some are from Bangladesh). Check the licence first. Include a few poor-quality and non-rice photos for the refusal metric.

## Results table (fill in; becomes the KPI slide)
| Photo | True disease | Predicted disease | Confidence | Result | Seconds |
|---|---|---|---|---|---|
| | | | | | |

## Summary (fill in after testing)
- Diagnosis accuracy: _ / _
- Grounding: _ / _
- Safe refusal: _ / _
- Median response time: _ s
- Worst failure and fix applied: _

## Smoke tests so far (informal, NOT the KPI)
Labels come from Wikimedia Commons file names (crowd-sourced, unverified); n is tiny. Do not quote these.

| Photo (Commons file) | Label by file name | Result | Confidence |
|---|---|---|---|
| Bipolaris oryzae 173160042 | brown spot | Brown spot | 0.75 |
| Pyricularia oryzae 173066184 | blast | Sheath blight (likely wrong) | 0.85 |
| Rice Hispa 6282950178 | hispa (no card) | "not sure", refer to officer | n/a |
| Rice plants affected by tungro disease1 | tungro | "not sure", refer to officer (missed) | n/a |
| Non-rice stripes image | not rice | "send another photo" | n/a |
| Corrupt file (UI) | not an image | "image could not be read" | n/a |
