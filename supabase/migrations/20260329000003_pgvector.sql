-- Enable pgvector extension
create extension if not exists vector;

-- Add embedding column to visits (Gemini text-embedding-004 outputs 768 dims)
alter table public.visits
  add column if not exists embedding vector(768);

-- HNSW index for fast cosine similarity search (works on small datasets unlike IVFFlat)
create index if not exists visits_embedding_hnsw_idx
  on public.visits using hnsw (embedding vector_cosine_ops);

-- RPC function used by the Next.js API route to search visits by semantic similarity
create or replace function search_visits_by_embedding(
  query_embedding vector(768),
  match_threshold float default 0.4,
  match_count int default 8
)
returns table (
  id uuid,
  client_id uuid,
  visit_date date,
  case_notes text,
  notes text,
  similarity float,
  first_name text,
  last_name text,
  client_number text,
  service_type_name text
)
language sql stable security definer
set search_path = public
as $$
  select
    v.id,
    v.client_id,
    v.visit_date,
    v.case_notes,
    v.notes,
    round((1 - (v.embedding <=> query_embedding))::numeric, 3)::float as similarity,
    c.first_name,
    c.last_name,
    c.client_number,
    coalesce(st.name, 'Other') as service_type_name
  from visits v
  join clients c on v.client_id = c.id
  left join service_types st on v.service_type_id = st.id
  where v.embedding is not null
    and (1 - (v.embedding <=> query_embedding)) > match_threshold
  order by v.embedding <=> query_embedding
  limit match_count;
$$;

-- Grant execute to authenticated users (RLS on underlying tables already enforces access)
grant execute on function search_visits_by_embedding(vector, float, int) to authenticated;
