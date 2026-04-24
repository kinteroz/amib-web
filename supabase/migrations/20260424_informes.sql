-- ============================================================
-- Portal Asociados: Tabla de informes
-- Fecha: 2026-04-24
-- ============================================================

CREATE TABLE public.informes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo          TEXT NOT NULL,
    categoria       TEXT NOT NULL CHECK (categoria IN ('anual', 'trimestral', 'especial')),
    fecha_periodo   TEXT NOT NULL,
    descripcion     TEXT,
    portada_url     TEXT,
    archivo_url     TEXT,
    orden           INTEGER DEFAULT 0,
    activo          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER on_informes_updated
  BEFORE UPDATE ON public.informes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

ALTER TABLE public.informes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos los autenticados ven informes activos"
ON public.informes FOR SELECT
TO authenticated
USING (activo = TRUE);

CREATE POLICY "Solo admins modifican informes"
ON public.informes FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND raw_user_meta_data->>'role' = 'admin'
    )
);

-- Insertar datos semilla
INSERT INTO public.informes (titulo, categoria, fecha_periodo, descripcion, portada_url, archivo_url, orden) VALUES
('Gestión Bursátil 2024', 'anual', 'Marzo 2024', 'Análisis detallado del mercado de valores, resiliencia institucional y nuevos protocolos operativos.', '/assets/portal/informe_2024.png', '#', 1),
('Consolidación 2023', 'anual', 'Marzo 2023', 'Reporte de sostenibilidad financiera y crecimiento de la infraestructura del mercado mexicano.', 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=400&q=80', '#', 2),
('Transición Digital 2022', 'anual', 'Marzo 2022', 'Iniciativas de digitalización del mercado y protocolos de ciberseguridad financiera.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80', '#', 3),
('Resiliencia 2021', 'anual', 'Marzo 2021', 'Impacto post-pandemia y estrategias de reactivación del sector bursátil en México.', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80', '#', 4),
('Reporte Trimestral Q4', 'trimestral', 'Dic 2023', 'Cierre del ciclo anual y proyecciones para el mercado de renta variable.', 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=400&q=80', '#', 5);
