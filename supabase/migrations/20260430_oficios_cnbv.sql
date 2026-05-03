-- =====================================================
-- OFICIOS CNBV — Sistema de seguimiento regulatorio
-- =====================================================

-- Tabla principal de oficios recibidos de la CNBV
CREATE TABLE IF NOT EXISTS oficios (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_oficio        TEXT NOT NULL,
  titulo               TEXT,
  pdf_url              TEXT,
  pdf_nombre           TEXT,
  fecha_recepcion      DATE NOT NULL,
  fecha_efectos        DATE,
  plazo_dias_habiles   INTEGER NOT NULL DEFAULT 20,
  prorroga_dias        INTEGER NOT NULL DEFAULT 0,
  fecha_vencimiento    DATE,
  estatus              TEXT NOT NULL DEFAULT 'pendiente'
                         CHECK (estatus IN ('pendiente', 'en_proceso', 'cumplido')),
  resumen_ia           TEXT,
  datos_extraidos_ia   JSONB,
  created_by           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tareas/requerimientos por oficio (generadas por IA o manualmente)
CREATE TABLE IF NOT EXISTS oficio_tareas (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oficio_id            UUID NOT NULL REFERENCES oficios(id) ON DELETE CASCADE,
  numero               INTEGER,
  descripcion          TEXT NOT NULL,
  detalle              TEXT,
  area_responsable     TEXT,
  responsable_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  fecha_planeada       DATE,
  fecha_completada     DATE,
  estatus              TEXT NOT NULL DEFAULT 'pendiente'
                         CHECK (estatus IN ('pendiente', 'en_proceso', 'concluido')),
  comentarios          TEXT,
  orden                INTEGER NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Catálogo de días festivos para cálculo de días hábiles
CREATE TABLE IF NOT EXISTS festivos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha        DATE NOT NULL UNIQUE,
  descripcion  TEXT NOT NULL,
  anio         INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM fecha)::INTEGER) STORED,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Festivos 2026 (fuente: Requerimientos CNBV 2026.xlsx)
INSERT INTO festivos (fecha, descripcion) VALUES
  ('2026-02-02', 'Día de la Constitución'),
  ('2026-03-16', 'Natalicio de Benito Juárez'),
  ('2026-04-02', 'Jueves Santo'),
  ('2026-04-03', 'Viernes Santo'),
  ('2026-05-01', 'Día del Trabajo'),
  ('2026-09-16', 'Día de la Independencia'),
  ('2026-11-02', 'Día de los Muertos'),
  ('2026-11-16', 'Día de la Revolución'),
  ('2026-12-25', 'Navidad')
ON CONFLICT (fecha) DO NOTHING;

-- =====================================================
-- Triggers updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER oficios_set_updated_at
  BEFORE UPDATE ON oficios
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER oficio_tareas_set_updated_at
  BEFORE UPDATE ON oficio_tareas
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =====================================================
-- Row Level Security
-- =====================================================
ALTER TABLE oficios       ENABLE ROW LEVEL SECURITY;
ALTER TABLE oficio_tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE festivos       ENABLE ROW LEVEL SECURITY;

CREATE POLICY "festivos_select" ON festivos
  FOR SELECT USING (true);

CREATE POLICY "oficios_select" ON oficios
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "oficios_insert" ON oficios
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "oficios_update" ON oficios
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "oficio_tareas_select" ON oficio_tareas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "oficio_tareas_insert" ON oficio_tareas
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "oficio_tareas_update" ON oficio_tareas
  FOR UPDATE TO authenticated USING (true);

-- =====================================================
-- Función: calcular fecha límite en días hábiles
-- =====================================================
CREATE OR REPLACE FUNCTION calcular_vencimiento(fecha_inicio DATE, dias INTEGER)
RETURNS DATE AS $$
DECLARE
  fecha_actual   DATE := fecha_inicio;
  dias_contados  INTEGER := 0;
BEGIN
  WHILE dias_contados < dias LOOP
    fecha_actual := fecha_actual + INTERVAL '1 day';
    IF EXTRACT(DOW FROM fecha_actual) NOT IN (0, 6)
       AND NOT EXISTS (SELECT 1 FROM festivos WHERE fecha = fecha_actual)
    THEN
      dias_contados := dias_contados + 1;
    END IF;
  END LOOP;
  RETURN fecha_actual;
END;
$$ LANGUAGE plpgsql;
