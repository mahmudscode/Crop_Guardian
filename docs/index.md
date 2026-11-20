# Crop Guardian -- documentation

Crop Guardian: Bangla rice-disease diagnosis from a leaf photo, grounded by retrieval over cited disease cards (Supabase + Google Gemini + React).

This directory is a wiki maintained by an LLM: linked markdown pages, nothing outside the repository. The rules are in [`CLAUDE.md`](CLAUDE.md).

## Start here

New teammate, judge, or AI assistant: read in this order.

1. [[project-guide]] -- everything in one page: what it is, status, how it works, how to run it, rules
2. [[problem]] -- the problem, users and KPI
3. [[system-architecture]] -- the request flow and components
4. [[diagnose-pipeline]] -- implementation details and the traps already hit
5. [[evaluation]] -- what has and has not been measured (read before quoting any number)

To run or deploy: [[setup]]. To submit to the hackathon: [[submission-checklist]] and [[demo-script]].

---

## concepts

- [[project-guide]] -- the one-page overview for people and AI assistants
- [[problem]] -- problem definition, users, impact, KPI
- [[responsible-ai]] -- safeguards, privacy and data sovereignty
- [[roadmap]] -- scalability roadmap for the pitch

## architecture

- [[system-architecture]] -- diagram and request flow
- [[tech-stack]] -- stack, rationale, fallback

## subsystems

- [[diagnose-pipeline]] -- Edge Function: vision, retrieval, grounded Bangla answer
- [[knowledge-base]] -- disease card schema, sources, card rules
- [[chat-assistant]] -- follow-up chat: grounded Bangla Q&A about the diagnosed disease
- [[knowledge-cards]] -- the seeded cards, their sources, what is still missing

## decisions

(none recorded as separate pages yet; the main ones are listed in [[project-guide]])

## reference

- [[prompts]] -- vision and answer prompt rules

## operations

- [[setup]] -- Supabase and web app setup
- [[passage-review]] -- checklist for verifying the source passages before the chat may use them
- [[evaluation]] -- metrics, protocol, results so far
- [[demo-script]] -- the 180-second video pitch
- [[submission-checklist]] -- hackathon requirements mapped to this project

## history

- [[build-plan]] -- the original 3.5-hour plan

---

## Using this wiki

```
/docs-sync     right after a deploy or release -- reads only what changed since verified_at
/docs-lint     integrity check (orphans, broken links, broken sources, stale, unverified)
/docs-query    ask the docs. If it is not there, the answer says so
/docs-status   commits not yet reflected, stale pages, recent work
```

Every page carries `verified_at`, the commit it was checked against. Change code, run
`/docs-sync`.
