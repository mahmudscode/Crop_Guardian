---
title: "Evaluation and KPIs"
type: operation
created: 2026-11-20
updated: 2026-11-20
sources:
  - code: eval/score.py
  - code: eval/README.md
verified_at: 4d9c993
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

## Over-confidence fix (2026-11-20) - tuned on the same 42 photos, so optimistic
The baseline named a disease for almost every leaf and its self-reported confidence did not separate right from wrong (offline rule search: no confidence or margin cutoff helped; at 0.85 and above every answer shown was wrong). The vision step was changed to an evidence gate (see [[prompts]]): the model must list visible and unseen card features, the code computes the confidence, and "healthy" / "other" / "unclear" are allowed outcomes. Same photos, same model (`gemini-3.1-flash-lite`):

| Version | Blast+tungro right (of 12) | Healthy not flagged (of 6) | No-card refused (of 24) | Answers shown | Wrong shown |
|---|---|---|---|---|---|
| Baseline (self-reported confidence) | 5 | 4 | 1 | 35 | 30 |
| Evidence gate, ratio >= 0.6 | 0 | 6 | 24 | 0 | 0 |
| Evidence gate, ratio >= 0.5 (deployed) | 2 | 6 | 14 | 16 | 14 |

Reading: far fewer wrong answers and no false alarms on healthy leaves, but real detections fell (5 to 2) and about 88% of the answers still shown are wrong, so precision did not improve. The model cannot reliably tell these diseases apart on these photos; the gate mainly makes it say less. The 0.6 version was too strict because the Blast card lists stem and neck rot that can never be visible on one leaf; 0.5 was picked after seeing that, on the same photos. Needs fresh photos and a stronger or fine-tuned vision component before any accuracy claim. Raw results: `eval/results_evidence_v1_strict_2026-11-20.json`, `eval/results_evidence_v2_final_2026-11-20.json`. A stronger-model run (`gemini-3.5-flash`) was abandoned after 11 photos because it took 20-40 s or more per photo and saturated the free quota.
