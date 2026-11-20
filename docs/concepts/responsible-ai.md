---
title: "Safeguards, privacy and data sovereignty"
type: concept
created: 2026-11-20
updated: 2026-11-20
sources:
  - code: supabase/functions/diagnose/index.ts
  - code: docs/source-material/AIBC_Participants_Guide.pdf
verified_at: 1421a00
---

# Safeguards, privacy and data sovereignty

The design refuses to guess: it shows only advice a source card supports, and keeps farmer data on the farmer's side. Responsible AI is a first-class judging dimension.

| Risk | Safeguard |
|---|---|
| Wrong diagnosis | The model must list the card features it actually sees and does not see; fewer than two visible features, a healthy-looking leaf, or damage that matches no card all lead to "not sure, ask the officer". The result shows the share of described features seen, not a probability. Measured limits are in [[evaluation]]: the gate cut wrong answers but most answers still shown were wrong, so the output is decision support, not a verdict |
| Invented pesticide or dose | Answer prompt allows only card content; cards are human-checked against sources |
| Photo privacy | Photo processed in memory, not stored; no account needed for the demo |
| Data ownership | Knowledge base is open, cited agronomy text; no farmer data leaves the app except the API call for analysis |
| Language bias | Bangla-first UI and prompts; plain wording tested with a non-technical reader |
| Chat misuse | The chat answers only from verified cards, refuses off-topic questions and requests for doses, ignores instructions inside a message, and discards any answer containing a number that is not in the cards. Questions are not stored but are sent to Google's Gemini API, like photos. Weak spot: the Bangla wording is the model's and has not been reviewed by a native speaker; answers cannot be more detailed than the short cards |
| Out-of-scope input | Non-rice or non-plant photos rejected with a clear message |

## Congress mandatory commitments (Section 15)
- Lawful, legally sourced data (check licences for sources and test datasets)
- Transparency in AI decisions: show symptoms observed, how many described features were seen, and the source
- Active bias detection and mitigation (test across lighting, devices, growth stages)
- No misleading or fabricated demos: report measured numbers only
- Privacy-preserving design
- Data-sovereignty awareness

## Human in the loop
Low-confidence cases route to local agriculture officers; future DAE partnership lets officers review flagged cases.
