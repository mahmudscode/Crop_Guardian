# Crop Guardian

A Bangladeshi rice farmer photographs a sick leaf and gets a **Bangla diagnosis with treatment steps**, each backed by a **cited agronomy source**.

Built for the International AI Builders Congress 2026 (AIBC), AgriSphere AI challenge area: *Crop Guardian* (early pest and disease detection from imagery, with local-language UX; winning signal: loss reduction at the field level).

## At a glance

| | |
|---|---|
| **Users** | Smallholder rice farmers and field extension workers, on a basic smartphone and a weak connection |
| **Core use case (only one)** | Photo in, Bangla diagnosis and next steps out |
| **Scope at launch** | Rice (dhan), 6 diseases: blast, bacterial leaf blight, brown spot, sheath blight, tungro, hispa (insect pest) |
| **AI approach** | Multimodal LLM reads symptoms, then RAG over curated disease cards grounds the advice so the model never invents treatments |
| **KPI** | Diagnosis accuracy on a labelled test set of rice leaf photos (proxy for field-level crop-loss reduction) |

## Pipeline

```
Photo -> Edge Function (in memory) -> Claude vision (symptom JSON)
      -> embed symptoms -> pgvector top 3-5 disease cards
      -> Claude answer in Bangla (cards only) -> diagnosis + source + confidence
```

Low confidence or no matching card: the app asks for another photo and refers the farmer to the local agriculture officer.

## Documentation

| Doc | Contents |
|---|---|
| [docs/PROBLEM.md](docs/PROBLEM.md) | Problem, users, impact, KPI |
| [docs/TECH_STACK.md](docs/TECH_STACK.md) | Stack, rationale, fallback |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture and request flow |
| [docs/KNOWLEDGE_BASE.md](docs/KNOWLEDGE_BASE.md) | Disease card schema, sources, card rules |
| [docs/PROMPTS.md](docs/PROMPTS.md) | Vision and answer prompts |
| [docs/RESPONSIBLE_AI.md](docs/RESPONSIBLE_AI.md) | Safeguards, privacy, data sovereignty |
| [docs/EVALUATION.md](docs/EVALUATION.md) | Metrics and test protocol |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Scalability roadmap |
| [docs/BUILD_PLAN.md](docs/BUILD_PLAN.md) | 3.5 hour build plan |
| [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) | 180-second video pitch script |
| [docs/SUBMISSION_CHECKLIST.md](docs/SUBMISSION_CHECKLIST.md) | Hackathon requirements mapped to this project |

Source requirement PDFs (`AIBC_Participants_Guide(1).pdf`, `Crop Guardian Tech Stack & System Architecture.pdf`) are kept in the repo root.

## Status

Planning and documentation complete. Implementation follows [docs/BUILD_PLAN.md](docs/BUILD_PLAN.md). Only report measured results; no target numbers are quoted until tested.
