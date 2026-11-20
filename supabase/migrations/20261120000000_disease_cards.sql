create extension if not exists vector;

create table if not exists disease_cards (
  id uuid primary key default gen_random_uuid(),
  crop text not null default 'rice',
  disease_name_en text not null,
  disease_name_bn text not null,
  symptoms_bn text,
  symptoms_en text,
  cause text,
  treatment_bn text,
  prevention_bn text,
  severity_note text,
  source_name text not null,
  source_url text,
  source_page text,
  verified boolean not null default false,   -- teammate checked card against source
  verified_by text,
  embedding vector(1024),                    -- Voyage multilingual (1024 dims); change if model changes
  created_at timestamptz not null default now()
);

alter table disease_cards enable row level security;

-- Public read of verified cards only (cards are open, cited agronomy text). Writes via service role only.
create policy "read verified cards" on disease_cards
  for select using (verified = true);

create index if not exists disease_cards_embedding_idx
  on disease_cards using hnsw (embedding vector_cosine_ops);

create or replace function match_disease_cards(
  query_embedding vector(1024),
  match_count int default 5,
  min_similarity float default 0.0
)
returns table (
  id uuid, disease_name_en text, disease_name_bn text,
  symptoms_bn text, symptoms_en text, cause text,
  treatment_bn text, prevention_bn text, severity_note text,
  source_name text, source_url text, source_page text,
  similarity float
)
language sql stable as $$
  select c.id, c.disease_name_en, c.disease_name_bn,
         c.symptoms_bn, c.symptoms_en, c.cause,
         c.treatment_bn, c.prevention_bn, c.severity_note,
         c.source_name, c.source_url, c.source_page,
         1 - (c.embedding <=> query_embedding) as similarity
  from disease_cards c
  where c.verified = true and c.embedding is not null
    and 1 - (c.embedding <=> query_embedding) >= min_similarity
  order by c.embedding <=> query_embedding
  limit match_count;
$$;
