-- =====================================================
-- Plan de trabajo por oficio y pasos detallados por tarea
-- =====================================================

-- Plan general en oficios (cronograma, hitos, áreas, riesgos)
ALTER TABLE oficios ADD COLUMN IF NOT EXISTS plan_general JSONB;

-- Pasos detallados por tarea (relacional → fácil de migrar cuando haya usuarios registrados)
CREATE TABLE IF NOT EXISTS oficio_tarea_pasos (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tarea_id           UUID NOT NULL REFERENCES oficio_tareas(id) ON DELETE CASCADE,
  orden              INTEGER NOT NULL DEFAULT 0,
  descripcion        TEXT NOT NULL,
  entregable         TEXT,
  dias_estimados     INTEGER,
  responsable_nombre TEXT,          -- texto libre hasta que se registren usuarios
  responsable_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  estatus            TEXT NOT NULL DEFAULT 'pendiente'
                       CHECK (estatus IN ('pendiente', 'en_proceso', 'concluido')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER oficio_tarea_pasos_set_updated_at
  BEFORE UPDATE ON oficio_tarea_pasos
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =====================================================
-- Row Level Security
-- =====================================================
ALTER TABLE oficio_tarea_pasos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "oficio_tarea_pasos_select" ON oficio_tarea_pasos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "oficio_tarea_pasos_insert" ON oficio_tarea_pasos
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "oficio_tarea_pasos_update" ON oficio_tarea_pasos
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "oficio_tarea_pasos_delete" ON oficio_tarea_pasos
  FOR DELETE TO authenticated USING (true);
