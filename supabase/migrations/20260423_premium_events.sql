-- 1. Extend `eventos` table for Hero and Layouts
ALTER TABLE public.eventos
ADD COLUMN IF NOT EXISTS tipo_hero text DEFAULT 'split' CHECK (tipo_hero IN ('split', 'fullscreen-video', 'fullscreen-image')),
ADD COLUMN IF NOT EXISTS efecto_overlay text DEFAULT 'none' CHECK (efecto_overlay IN ('matrix', 'pulse', 'grain', 'none')),
ADD COLUMN IF NOT EXISTS media_url text,
ADD COLUMN IF NOT EXISTS media_tipo text DEFAULT 'image' CHECK (media_tipo IN ('image', 'video')),
ADD COLUMN IF NOT EXISTS badge_texto text,
ADD COLUMN IF NOT EXISTS cta_texto text,
ADD COLUMN IF NOT EXISTS layout_tipo text DEFAULT 'classic' CHECK (layout_tipo IN ('classic', 'modern', 'minimal', 'immersive'));

-- 2. Create `evento_ponentes` table
CREATE TABLE IF NOT EXISTS public.evento_ponentes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    evento_id uuid NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
    nombre text NOT NULL,
    cargo text,
    bio text,
    imagen_url text,
    orden integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_evento_ponentes_evento_id ON public.evento_ponentes(evento_id);

-- 3. Create `evento_asistentes` table
CREATE TABLE IF NOT EXISTS public.evento_asistentes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    evento_id uuid NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
    usuario_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for manual or external registrations
    nombre_completo text,
    email text,
    qr_code text UNIQUE NOT NULL, -- The hash for the QR
    asistio boolean DEFAULT false,
    fecha_registro timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    fecha_checkin timestamp with time zone
);

CREATE INDEX IF NOT EXISTS idx_evento_asistentes_evento_id ON public.evento_asistentes(evento_id);
CREATE INDEX IF NOT EXISTS idx_evento_asistentes_qr_code ON public.evento_asistentes(qr_code);

-- 4. Create `evento_preguntas` table
CREATE TABLE IF NOT EXISTS public.evento_preguntas (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    evento_id uuid NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
    asistente_id uuid REFERENCES public.evento_asistentes(id) ON DELETE CASCADE,
    usuario_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    autor_nombre text, -- If anonymous or external
    pregunta text NOT NULL,
    respondida boolean DEFAULT false,
    destacada boolean DEFAULT false,
    votos integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_evento_preguntas_evento_id ON public.evento_preguntas(evento_id);

-- 5. Create `evento_galeria` table
CREATE TABLE IF NOT EXISTS public.evento_galeria (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    evento_id uuid NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
    media_url text NOT NULL,
    media_tipo text DEFAULT 'image' CHECK (media_tipo IN ('image', 'video')),
    titulo text,
    orden integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_evento_galeria_evento_id ON public.evento_galeria(evento_id);

-- RLS Policies
ALTER TABLE public.evento_ponentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evento_asistentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evento_preguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evento_galeria ENABLE ROW LEVEL SECURITY;

-- Ponentes: public read, admin write
CREATE POLICY "Public read access for ponentes" ON public.evento_ponentes FOR SELECT USING (true);
CREATE POLICY "Admin write access for ponentes" ON public.evento_ponentes FOR ALL USING (auth.role() = 'authenticated'); -- simplified for now

-- Asistentes: own read, admin all
CREATE POLICY "Users can read own asistencia" ON public.evento_asistentes FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Admin write access for asistentes" ON public.evento_asistentes FOR ALL USING (auth.role() = 'authenticated');

-- Preguntas: public read, auth write (insert), admin update/delete
CREATE POLICY "Public read access for preguntas" ON public.evento_preguntas FOR SELECT USING (true);
CREATE POLICY "Auth insert access for preguntas" ON public.evento_preguntas FOR INSERT WITH CHECK (true); -- anyone can ask, maybe check auth later
CREATE POLICY "Admin update access for preguntas" ON public.evento_preguntas FOR UPDATE USING (auth.role() = 'authenticated');

-- Galeria: public read, admin write
CREATE POLICY "Public read access for galeria" ON public.evento_galeria FOR SELECT USING (true);
CREATE POLICY "Admin write access for galeria" ON public.evento_galeria FOR ALL USING (auth.role() = 'authenticated');

-- Add realtime support to preguntas
alter publication supabase_realtime add table public.evento_preguntas;
