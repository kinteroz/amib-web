-- Migration: Upgrade news table for rich media and slugs
-- Date: 2026-04-22

ALTER TABLE public.noticias ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.noticias ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Actualizar noticias existentes con slugs basados en el título
UPDATE public.noticias 
SET slug = lower(regexp_replace(titulo, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;
