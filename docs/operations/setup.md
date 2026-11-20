---
title: "Setup: Supabase and the web app"
type: operation
created: 2026-11-20
updated: 2026-11-20
sources:
  - code: supabase/config.toml
  - code: .env.example
  - code: app/.env.example
verified_at: 2968829
---

# Setup: Supabase and the web app

## 1. Supabase
1. Create a project at supabase.com. Note the project ref.
2. Install the CLI (`npm i -g supabase` or your package manager), then:
   ```bash
   supabase login
   supabase link --project-ref <ref>
   supabase db push --remote        # runs supabase/migrations/* (newer CLI versions default to a local database)
   ```
3. Secrets (copy `.env.example` to `.env`, fill in, never commit):
   ```bash
   supabase secrets set --env-file .env
   ```
   Needs one free Gemini API key from https://aistudio.google.com/apikey (no billing). Keep embedding size equal to `vector(1024)` in the migration (`supabase/functions/_shared/gemini.ts`).
4. Deploy functions:
   ```bash
   supabase functions deploy diagnose --remote=<ref> --use-api --yes
   supabase functions deploy chat --remote=<ref> --use-api --yes
   supabase functions deploy embed-cards --remote=<ref> --use-api --yes
   ```

## 2. Knowledge base
1. `supabase/seed.sql` holds the 6 cards: 5 filled from cited sources, hispa still name-only. Load it with `supabase db query --remote -f supabase/seed.sql`. Write any new card only from real source text (see [[knowledge-base]]).
2. A teammate checks each card against its source, then sets `verified = true, verified_by = '<name>'`. The pipeline ignores unverified cards.
3. Embed the cards:
   ```bash
   curl -X POST https://<ref>.supabase.co/functions/v1/embed-cards -H "x-admin-key: $ADMIN_KEY"
   ```
   Re-run after editing any card (set `embedding = null` on edited rows first).

## 3. Web app (`app/`)
```bash
cd app
cp .env.example .env     # set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (Project Settings > API)
npm install
npm run dev              # local; open on a phone-width viewport
npm run build            # outputs app/dist for static hosting
```
Deploy `app/dist` to Vercel, Netlify or Cloudflare Pages (set the same two env vars there). The anon key is public by design; the service role key must never go in the app.

## 4. Test
Smoke test the function directly:
```bash
curl -X POST https://<ref>.supabase.co/functions/v1/diagnose \
  -H "Content-Type: application/json" \
  -d "{\"image_base64\": \"$(base64 -w0 leaf.jpg)\", \"media_type\": \"image/jpeg\"}"
```
Then follow [[evaluation]] and re-tune `SIM_THRESHOLD`, `MIN_MATCHES` and `EVIDENCE_MIN_RATIO`.

## Notes
- `diagnose` has `verify_jwt = false` for the no-account demo. Add rate limiting before any public launch to protect API spend.
- Confirm current Gemini model names, and the free-tier rate limits, before deploying.

## 5. Deploy the web app on Vercel (free)
1. At vercel.com, sign in with GitHub, **Add New > Project**, import the repo.
2. **Root Directory:** `app`. Framework: Vite. Build `npm run build`, output `dist`.
3. **Settings > Environment Variables** (not the "Environments" page, which only manages deployment targets and offers paid extras): add `VITE_SUPABASE_URL` (`https://<ref>.supabase.co`) and `VITE_SUPABASE_ANON_KEY` (the public anon key), for Production. Vercel warns that `VITE_` values are exposed to the browser; both are meant to be public, so choose **Change to Config**. Do not remove the prefix.
4. **Redeploy** (Deployments > three dots > Redeploy, build cache off). Variables are baked in at build time.
5. Check: the new JavaScript file name differs, contains your `https://<ref>.supabase.co`, and a test photo returns an answer.

> ⚠️ Traps hit on the first deploy: (a) with the variables missing, the page loads but every diagnosis fails with the Bangla "internet problem" message, because the code posts to `undefined/functions/v1/diagnose` (a 404 on the Vercel site); (b) pasting the anon key from a code block can add a trailing newline (shown as a small arrow in the box), which can break the Authorization header: delete it before saving; (c) adding variables without redeploying changes nothing.
