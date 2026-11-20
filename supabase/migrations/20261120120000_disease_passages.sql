-- Extra source passages per disease, so the follow-up chat can go deeper than the short disease cards.
-- Each passage is a faithful restatement of ONE fact (or a few related facts) from a cited source section.
create table if not exists disease_passages (
  id uuid primary key default gen_random_uuid(),
  disease_name_en text not null,            -- same name as disease_cards.disease_name_en
  topic text not null check (topic in (
    'hosts','survival_spread','favouring_conditions','impact','identification',
    'management_cultural','management_resistance','management_chemical','management_biological')),
  passage_en text not null,
  source_name text not null,
  source_url text,
  source_section text,                      -- section label in the source, so a reviewer can check it
  verified boolean not null default false,  -- a person checked it against the source
  verified_by text,
  embedding vector(1024),
  created_at timestamptz not null default now()
);

alter table disease_passages enable row level security;

-- Public read of verified passages only; writes via the service role.
create policy "read verified passages" on disease_passages
  for select using (verified = true);

create index if not exists disease_passages_embedding_idx
  on disease_passages using hnsw (embedding vector_cosine_ops);

create or replace function match_disease_passages(
  query_embedding vector(1024),
  match_count int default 4,
  min_similarity float default 0.0,
  only_disease text default null
)
returns table (
  id uuid, disease_name_en text, topic text, passage_en text,
  source_name text, source_url text, source_section text, similarity float
)
language sql stable as $$
  select p.id, p.disease_name_en, p.topic, p.passage_en,
         p.source_name, p.source_url, p.source_section,
         1 - (p.embedding <=> query_embedding) as similarity
  from disease_passages p
  where p.verified = true and p.embedding is not null
    and (only_disease is null or lower(p.disease_name_en) = lower(only_disease))
    and 1 - (p.embedding <=> query_embedding) >= min_similarity
  order by p.embedding <=> query_embedding
  limit match_count;
$$;
