# Problem Definition

## Problem
Rice is Bangladesh's staple crop. Smallholder farmers often cannot identify a disease or pest early, advice from extension officers is hard to reach, and wrong or late treatment causes field-level crop loss. Existing agronomy material is mostly English, long-form, or scattered across sources.

## Users
- Smallholder rice farmers
- Field extension workers
- Constraints: basic smartphone, weak connection, low technical literacy, Bangla-first

## Solution
Take or pick a photo of a rice leaf and receive, in simple Bangla: the likely disease, what to do now, how to prevent it, and the source name, with a visible confidence level. Advice comes only from verified, cited disease cards.

## Differentiation
- Grounded: treatments come only from human-checked cards (BRRI, DAE, IRRI, FAO); no invented pesticides or doses
- Refuses to guess: low confidence or non-rice photos trigger "send another photo" and officer referral
- Bangla-first UI and answers
- Privacy: photo processed in memory, not stored; no account needed

## Impact and KPI
- Intended outcome: reduction in field-level crop loss through earlier, correct action
- Measured KPI: diagnosis accuracy on a labelled test set of 10-15+ rice leaf photos (see [EVALUATION.md](EVALUATION.md))
- Supporting metrics: grounding, safe refusal, response time
