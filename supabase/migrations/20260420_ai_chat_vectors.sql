-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store your documents
create table if not exists public.document_embeddings (
  id bigserial primary key,
  content text, 
  metadata jsonb,
  embedding vector(768) -- Gemini embeddings use 768 dimensions
);

-- Set RLS
alter table public.document_embeddings enable row level security;

-- Policies (We only want the backend to be able to read/write, but for search, we need read access if called remotely)
create policy "Permitir lectura publica de embeddings" 
    on public.document_embeddings for select 
    using (true);

-- Create a function to search for documents
create or replace function match_documents (
  query_embedding vector(768),
  match_count int DEFAULT null,
  filter jsonb DEFAULT '{}'
) returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query
  select
    id,
    content,
    metadata,
    1 - (document_embeddings.embedding <=> query_embedding) as similarity
  from document_embeddings
  where metadata @> filter
  order by document_embeddings.embedding <=> query_embedding
  limit match_count;
end;
$$;
