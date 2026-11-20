# Setup: Supabase + web app

## 1. Supabase
1. Create a project at supabase.com. Note the project ref.
2. Install the CLI (`npm i -g supabase` or your package manager), then:
   ```bash
   supabase login
   supabase link --project-ref <ref>
   supabase db push                 # runs supabase/migrations/*
   ```
3. Secrets (copy `.env.example` to `.env`, fill in, never commit):
   ```bash
   supabase secrets set --env-file .env
   ```
   Needs an Anthropic API key and a Voyage AI key (or swap `supabase/functions/_shared/embed.ts` for Cohere embed-multilingual; keep the vector size equal to `vector(1024)` in the migration).
4. Deploy functions:
   ```bash
   supabase functions deploy diagnose
   supabase functions deploy embed-cards
   ```

## 2. Knowledge base
1. Fill the 6 cards from real sources only (see [KNOWLEDGE_BASE.md](KNOWLEDGE_BASE.md)); `supabase/seed.sql` holds a template with names only. Run it in the SQL editor, then update each row with source-based text.
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
Then follow [EVALUATION.md](EVALUATION.md) and tune `CONF_THRESHOLD` and `SIM_THRESHOLD`.

## Notes
- `diagnose` has `verify_jwt = false` for the no-account demo. Add rate limiting before any public launch to protect API spend.
- Confirm current model names for Claude and the embedding provider before deploying.
