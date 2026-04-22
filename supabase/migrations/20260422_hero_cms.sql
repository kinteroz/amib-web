-- Migración para extender la tabla de banners y soportar el Hero Premium CMS
-- Fecha: 2026-04-22

ALTER TABLE public.banners 
ADD COLUMN IF NOT EXISTS tipo_hero text DEFAULT 'fullscreen-image' CHECK (tipo_hero IN ('split', 'fullscreen-video', 'fullscreen-image')),
ADD COLUMN IF NOT EXISTS efecto_overlay text DEFAULT 'none' CHECK (efecto_overlay IN ('matrix', 'pulse', 'grain', 'none')),
ADD COLUMN IF NOT EXISTS media_url text,
ADD COLUMN IF NOT EXISTS media_tipo text DEFAULT 'image' CHECK (media_tipo IN ('image', 'video')),
ADD COLUMN IF NOT EXISTS badge_texto text,
ADD COLUMN IF NOT EXISTS cta_texto text,
ADD COLUMN IF NOT EXISTS cta_enlace text,
ADD COLUMN IF NOT EXISTS cta_texto_2 text,
ADD COLUMN IF NOT EXISTS cta_enlace_2 text,
ADD COLUMN IF NOT EXISTS estadisticas_json jsonb DEFAULT '[]';

-- Actualizar los registros existentes para que tengan valores por defecto coherentes
UPDATE public.banners 
SET 
  tipo_hero = 'fullscreen-image',
  efecto_overlay = 'matrix',
  media_url = imagen_url,
  media_tipo = 'image',
  badge_texto = 'Autoridad Bursátil de México',
  cta_texto = 'Conocer Más',
  cta_enlace = enlace
WHERE media_url IS NULL;
