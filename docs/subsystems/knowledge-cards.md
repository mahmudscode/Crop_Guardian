---
title: "Disease cards (seed data)"
type: subsystem
created: 2026-11-20
updated: 2026-11-20
sources:
  - code: supabase/seed.sql
  - code: supabase/migrations/20261120000000_disease_cards.sql
  - ext: https://apps.lucidcentral.org/pppw_v10/text/web_full/entities/
verified_at: 33e0bef
---

# Disease cards

`supabase/seed.sql` loads six rice cards. Blast, brown spot and bacterial leaf blight are filled from Pacific Pests, Pathogens and Weeds v10 (Grahame Jackson, 2021). Sheath blight and tungro are filled from the IRRI "Rice Diseases: Biology & Selected Management Practices" chapters (2018; PDFs kept in `docs/raw/`, git-ignored because they are IRRI's copyrighted files). Hispa is a name-only stub. Retrieval rules are in [[diagnose-pipeline]].

> ⚠️ Hispa has no source text yet: the IRRI Knowledge Bank and PhilRice hosts refused connections, BRRI had a TLS error, and hispa is not in the IRRI chapters or Pacific Pests index. Fill it only from a real source, never from memory.

> ⚠️ All cards are `verified = false`, so the pipeline ignores them until a teammate checks each against its source. The Bangla text is Claude's translation of English source text and needs a native reader.

> ⚠️ The sources give no pesticide doses. Card text names products as the source does and says to ask an agriculture officer; do not add doses. The source spells two products `strobilburins` and `carbendazin`; the cards use the standard spellings.

> ⚠️ Tungro card names no insecticide on purpose: the source's examples (e.g. carbofuran, with documented resistance) are not safe to recommend blindly. Add a product only with a current, locally approved source.
