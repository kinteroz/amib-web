-- Tabla de chunks del documento (sin vectores, usando Full Text Search nativo de Postgres)
create table if not exists public.document_chunks (
  id bigserial primary key,
  content text not null,
  metadata jsonb default '{}',
  ts_content tsvector generated always as (to_tsvector('spanish', content)) stored,
  created_at timestamp with time zone default now()
);

-- Índice para búsqueda rápida
create index if not exists idx_document_chunks_ts on public.document_chunks using gin(ts_content);

-- RLS: Allow public read access (backend will search these)
alter table public.document_chunks enable row level security;

create policy "Lectura pública de chunks" 
    on public.document_chunks for select 
    using (true);

-- Función de búsqueda textual semántica
create or replace function search_chunks(
    query_text text,
    match_count int default 5
) returns table (
    id bigint,
    content text,
    metadata jsonb,
    rank real
)
language sql
as $$
    select
        id,
        content,
        metadata,
        ts_rank(ts_content, plainto_tsquery('spanish', query_text)) as rank
    from document_chunks
    where ts_content @@ plainto_tsquery('spanish', query_text)
    order by rank desc
    limit match_count;
$$;
