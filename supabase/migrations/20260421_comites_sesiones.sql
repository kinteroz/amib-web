-- ============================================================
-- Portal Asociados: Tabla de sesiones de comités
-- Fecha: 2026-04-21
-- ============================================================

CREATE TABLE public.comites_sesiones (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre          TEXT NOT NULL,                     -- Nombre del comité
    tipo            TEXT NOT NULL DEFAULT 'regular',   -- 'regular' | 'extraordinaria'
    fecha           DATE NOT NULL,
    hora_inicio     TIME NOT NULL,
    hora_fin        TIME,
    estado          TEXT NOT NULL DEFAULT 'programada', -- 'programada' | 'realizada' | 'cancelada' | 'pospuesta'
    ubicacion       TEXT,                              -- Sala o URL de videollamada
    rol_asociado    TEXT NOT NULL DEFAULT 'vocal',     -- 'presidente' | 'vocal' | 'invitado'
    asociado_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    link_documento  TEXT,                              -- URL al PDF de la minuta/convocatoria
    notas           TEXT,
    es_publica      BOOLEAN DEFAULT FALSE,             -- Si aplicara visibilidad pública futura
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Índices para consultas frecuentes
CREATE INDEX idx_comites_sesiones_fecha ON public.comites_sesiones(fecha DESC);
CREATE INDEX idx_comites_sesiones_asociado ON public.comites_sesiones(asociado_id);
CREATE INDEX idx_comites_sesiones_estado ON public.comites_sesiones(estado);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_comites_sesiones_updated
  BEFORE UPDATE ON public.comites_sesiones
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.comites_sesiones ENABLE ROW LEVEL SECURITY;

-- Asociados autenticados solo ven sus propias sesiones
CREATE POLICY "Asociados ven sus propias sesiones"
ON public.comites_sesiones FOR SELECT
TO authenticated
USING (asociado_id = auth.uid() OR es_publica = TRUE);

-- Solo admins pueden insertar/actualizar/eliminar
CREATE POLICY "Solo admins modifican sesiones"
ON public.comites_sesiones FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND raw_user_meta_data->>'role' = 'admin'
    )
);

-- ============================================================
-- Datos de ejemplo (seed) para desarrollo
-- ============================================================
INSERT INTO public.comites_sesiones 
    (nombre, tipo, fecha, hora_inicio, hora_fin, estado, ubicacion, rol_asociado, link_documento, es_publica)
VALUES
    ('Comité de Análisis de Mercados', 'regular',       '2024-10-24', '09:00', '11:30', 'programada', 'Sala B-302',           'presidente', NULL, TRUE),
    ('Comité de Ética y Vigilancia',   'regular',       '2024-10-28', '14:00', '16:00', 'programada', 'Zoom – Liga disponible','vocal',      NULL, TRUE),
    ('Comité de Normatividad Bursátil','extraordinaria','2024-10-12', '10:00', '13:00', 'realizada',  'Sala A-101',           'vocal',      'https://example.com/minuta-cnb-oct24.pdf', TRUE),
    ('Subcomité de Renta Variable',    'regular',       '2024-10-18', '11:30', '13:00', 'realizada',  'Videollamada',         'vocal',      'https://example.com/minuta-srv-oct24.pdf', TRUE);
