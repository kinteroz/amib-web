-- ============================================================
-- Portal Asociados: Tabla de minutas de comités
-- Fecha: 2026-04-24
-- ============================================================

CREATE TABLE public.minutas (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sesion_id       UUID NOT NULL REFERENCES public.comites_sesiones(id) ON DELETE CASCADE,
    titulo          TEXT NOT NULL,
    archivo_url     TEXT NOT NULL,
    fecha_subida    TIMESTAMPTZ DEFAULT now(),
    subido_por      UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.minutas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven minutas de sus sesiones o publicas"
ON public.minutas FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.comites_sesiones cs
        WHERE cs.id = minutas.sesion_id
        AND (cs.asociado_id = auth.uid() OR cs.es_publica = TRUE)
    )
);

CREATE POLICY "Solo admins modifican minutas"
ON public.minutas FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND raw_user_meta_data->>'role' = 'admin'
    )
);

-- Insert some dummy minutas for development
INSERT INTO public.minutas (sesion_id, titulo, archivo_url)
SELECT id, 'Minuta de la sesión ' || nombre, 'https://example.com/minuta.pdf'
FROM public.comites_sesiones
WHERE estado = 'realizada';
