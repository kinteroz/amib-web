CREATE TABLE IF NOT EXISTS public.catalogo_materias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.catalogo_materias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo a autenticados" ON public.catalogo_materias FOR ALL TO authenticated USING (true);
