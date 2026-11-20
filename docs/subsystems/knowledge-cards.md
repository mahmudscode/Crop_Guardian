---
title: Disease cards (seed data)
type: subsystem
created: 2026-11-20
updated: 2026-11-20
sources:
  - code: supabase/seed.sql
  - code: supabase/migrations/20261120000000_disease_cards.sql
  - ext: https://apps.lucidcentral.org/pppw_v10/text/web_full/entities/
verified_at: a3400ff
---

# Disease cards

`supabase/seed.sql` loads six rice cards. Blast, brown spot and bacterial leaf blight are filled from Pacific Pests, Pathogens and Weeds v10 (Grahame Jackson, 2021). Sheath blight, tungro and hispa are name-only stubs. Retrieval rules are in [[diagnose-pipeline]].

> ⚠️ Sheath blight, tungro and hispa have no source text yet: the IRRI Knowledge Bank and PhilRice hosts refused connections, the IRRI Drive chapters returned only a viewer shell, and BRRI had a TLS error. Fill them only from a real source, never from memory.

> ⚠️ All cards are `verified = false`, so the pipeline ignores them until a teammate checks each against its source. The Bangla text is Claude's translation of English source text and needs a native reader.

> ⚠️ The sources give no pesticide doses. Card text names products as the source does and says to ask an agriculture officer; do not add doses. The source spells two products `strobilburins` and `carbendazin`; the cards use the standard spellings.
