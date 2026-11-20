---
title: "Evaluation and KPIs"
type: operation
created: 2026-11-20
updated: 2026-11-20
sources:
  - code: eval/score.py
  - code: eval/README.md
verified_at: 33e0bef
---

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

## Comparison on 42 public photos (2026-11-20) - informal, NOT the KPI
Set: 6 photos per class from `Project-AgML/rice_disease_classification_bangladesh` (CC BY 4.0), classes blast, tungro, healthy, plus insect, leaf scald, leaffolder, stripes (no card, so the right answer is "not sure"). Photos are single leaves on a white background, so they are easier and different from phone field photos. n is tiny; dataset labels are not independently verified. Scripts and raw results: `eval/`.

| Method | Blast+tungro right (of 12) | Healthy not flagged (of 6) | No-card refused (of 24) | Answers shown | Wrong answers shown |
|---|---|---|---|---|---|
| Gemini pipeline (deployed, `gemini-3.1-flash-lite`) | 5 | 4 | 1 | 35 | 30 |
| Classifier alone (`Huyt/...efficientnet-b0`) | 2 | 6 | 13 | 18 | 16 |
| Classifier, confidence >= 0.5 | 1 | 6 | 19 | 8 | 7 |
| Both must agree | 1 | 6 | 23 | 3 | 2 |

Gemini response time: median 7.0 s, max 28.5 s (n=42).

What it shows: the deployed pipeline names one of our diseases for almost every leaf (35 of 42), including 23 of 24 photos of problems we have no card for, and its confidence (0.6-0.95) does not separate right from wrong. The pretrained classifier is weak on these photos (domain shift; its card's 97% is on its own split) but does say "healthy" correctly. Requiring both to agree is safe but almost never answers.
