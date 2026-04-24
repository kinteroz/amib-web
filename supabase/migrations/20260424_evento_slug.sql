-- 1. Agregar la columna slug a la tabla eventos (permitiendo nulos temporalmente)
ALTER TABLE public.eventos
ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- 2. Función para generar slugs a partir del título
CREATE OR REPLACE FUNCTION generate_slug(title text) RETURNS text AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 1;
BEGIN
  -- Convertir a minúsculas, reemplazar espacios con guiones y quitar caracteres no alfanuméricos
  base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'));
  base_slug := regexp_replace(base_slug, '[\s]+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  -- Asegurar que el slug sea único
  WHILE EXISTS (SELECT 1 FROM public.eventos WHERE slug = final_slug) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- 3. Poblar la columna slug para los eventos existentes
DO $$ 
DECLARE
  evento_record RECORD;
BEGIN
  FOR evento_record IN SELECT id, titulo FROM public.eventos WHERE slug IS NULL LOOP
    UPDATE public.eventos
    SET slug = generate_slug(evento_record.titulo)
    WHERE id = evento_record.id;
  END LOOP;
END $$;

-- 4. Hacer la columna NOT NULL una vez que todos tienen slug
ALTER TABLE public.eventos
ALTER COLUMN slug SET NOT NULL;
