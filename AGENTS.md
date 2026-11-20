# Instructions for AI coding assistants

Read [`docs/concepts/project-guide.md`](docs/concepts/project-guide.md) first. It is the single source for what this project is, its current status, architecture, API contract, configuration, commands and open work. Do not duplicate its content here.

Non-negotiable rules (full list in the guide, section 10):

- Treatment advice comes only from verified, cited disease cards. Never invent a pesticide, a dose or a source.
- Never commit secrets. `.env` files stay local; only `.env.example` (names, no values) is committed.
- Keep one core use case: photo in, Bangla diagnosis out. Do not store photos.
- Report only measured evaluation numbers; re-run `eval/` after changing a prompt or the model.
- Edge Functions run on Deno, not Node. Type-check with `npx deno check supabase/functions/diagnose/index.ts`.
- When code changes, update the matching page under `docs/` and its `verified_at` (rules in `docs/CLAUDE.md`).
