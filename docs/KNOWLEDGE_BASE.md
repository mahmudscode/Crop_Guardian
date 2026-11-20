# Knowledge Base

One disease card per rice disease, written only from source text; each card is stored as a single chunk.

## Scope at launch
Rice (dhan), 6 diseases: blast, bacterial leaf blight, brown spot, sheath blight, tungro, hispa (insect pest).

## Card schema (one Postgres row with a vector column)

```
id, crop, disease_name_en, disease_name_bn
symptoms_bn, symptoms_en
cause              (only what the source states)
treatment_bn
prevention_bn
severity_note
source_name, source_url, source_page
embedding          (vector)
```

```sql
create extension if not exists vector;
create table disease_cards (
  id uuid primary key default gen_random_uuid(),
  crop text not null,
  disease_name_en text not null,
  disease_name_bn text not null,
  symptoms_bn text, symptoms_en text,
  cause text,
  treatment_bn text,
  prevention_bn text,
  severity_note text,
  source_name text not null,
  source_url text,
  source_page text,
  embedding vector(1024)  -- adjust to chosen embedding model
);
```

## Sources
BRRI Rice Knowledge Bank and Bangla leaflets, DAE guides, IRRI Rice Knowledge Bank, FAO and CABI PlantWise pest guides. Check each site's terms before copying. URLs are unverified; confirm before use.

## Rules for building cards
- Claude may reformat source text into the schema but must not add treatments or doses the source does not state
- A teammate checks every card against its source before it is loaded
- Pesticide names and doses are copied exactly or left out; never paraphrased from memory
- Every card has `source_name` (and URL/page where available)

## Card review log
| Disease | Source | Reviewer | Verified |
|---|---|---|---|
| Blast | Pacific Pests v10 (lucidcentral), Grahame Jackson 2021 | | no (Bangla translation by Claude, needs native review) |
| Bacterial leaf blight | Pacific Pests v10 (lucidcentral), Grahame Jackson 2021 | | no (Bangla translation by Claude, needs native review) |
| Brown spot | Pacific Pests v10 (lucidcentral), Grahame Jackson 2021 | | no (Bangla translation by Claude, needs native review) |
| Sheath blight | IRRI Rice Diseases (2018), Sec 1 Ch 3 | | no (Bangla translation by Claude, needs native review) |
| Tungro | IRRI Rice Diseases (2018), Sec 3 Ch 1 | | no (Bangla translation by Claude, needs native review) |
| Hispa | NOT YET SOURCED | | no |
