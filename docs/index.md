# Crop Guardian -- documentation

Crop Guardian: Bangla rice-disease diagnosis from a leaf photo, grounded by RAG over cited disease cards (Supabase + Gemini + React).

This directory is a wiki maintained by an LLM: linked markdown pages, nothing outside the
repository. The rules are in [`CLAUDE.md`](CLAUDE.md).

## Start here

1. [[diagnose-pipeline]] -- how a photo becomes a Bangla answer
2. Project-level planning docs (problem, architecture, prompts, evaluation, setup) sit as plain files in this folder: PROBLEM.md, ARCHITECTURE.md, PROMPTS.md, RESPONSIBLE_AI.md, EVALUATION.md, SETUP.md. They have not been converted into wiki pages yet.

---

## concepts

<!-- TODO: pages under Domain and product concepts. Mostly survive code changes. `- [[page-name]] -- one line` -->

## architecture

<!-- TODO: pages under System structure, data model, main flows. `- [[page-name]] -- one line` -->

## subsystems

- [[diagnose-pipeline]] -- Edge Function: vision, retrieval, grounded Bangla answer
- [[knowledge-cards]] -- seed disease cards, sources, what is still missing

## decisions

<!-- TODO: pages under Why it was decided that way (ADRs, known defects). `- [[page-name]] -- one line` -->

## reference

<!-- TODO: pages under Schemas, APIs, env vars -- documents you look values up in. `- [[page-name]] -- one line` -->

## operations

<!-- TODO: pages under Install, deploy, checks, incident response. `- [[page-name]] -- one line` -->

## history

<!-- TODO: pages under Development history, lessons, migrated records. `- [[page-name]] -- one line` -->

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
