-- Migración para añadir duración de slides
ALTER TABLE public.banners 
ADD COLUMN IF NOT EXISTS duracion integer DEFAULT 7;
