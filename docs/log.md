# Work log

Append-only. Newest entries at the bottom.

---

## [2026-11-20] setup | docs/ wiki scaffolded

- Categories: concepts - architecture - subsystems - decisions - reference - operations - history
- Baseline commit: `47de279`
- Created: `docs/{CLAUDE,index,log}.md`, `raw/`, 4 `.claude/commands/docs-*`,
  and `.claude/scripts/docs-lint.py`

- Started in grow mode. Pages are added as work touches new areas.
- Wrote [[diagnose-pipeline]] from `supabase/functions/` and `app/src/api.js`.
- Pre-existing flat docs (`docs/*.md` in the folder root) were left untouched; not yet split into pages.

## [2026-11-20] cards | seeded 3 of 6 disease cards from Pacific Pests v10; 3 stubs unsourced

## [2026-11-20] reorganize | planning docs became wiki pages

- Moved the 12 flat planning docs into category folders with frontmatter and `[[links]]`; added [[project-guide]]; moved the requirement PDFs to `docs/source-material/`; fixed `.gitignore` so `.env.example` is committed.

## [2026-11-20] chat | added a card-grounded follow-up chat

- New `chat` Edge Function, chat panel in the app, number guard, smoke test and unit tests. See [[chat-assistant]].
