-- =====================================================
-- RLS: Oficios restringidos al rol contralor (y admin)
-- Reemplaza las políticas abiertas del migration inicial
-- =====================================================

-- Función helper para verificar rol en el JWT
-- (el rol se almacena en raw_user_meta_data->>'role')
CREATE OR REPLACE FUNCTION es_contralor_o_admin()
RETURNS BOOLEAN AS $$
  SELECT (auth.jwt() -> 'user_metadata' ->> 'role') IN ('contralor', 'admin')
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ── oficios ──────────────────────────────────────────
DROP POLICY IF EXISTS "oficios_select" ON oficios;
DROP POLICY IF EXISTS "oficios_insert" ON oficios;
DROP POLICY IF EXISTS "oficios_update" ON oficios;

CREATE POLICY "oficios_select" ON oficios
  FOR SELECT TO authenticated
  USING (es_contralor_o_admin());

CREATE POLICY "oficios_insert" ON oficios
  FOR INSERT TO authenticated
  WITH CHECK (es_contralor_o_admin() AND auth.uid() = created_by);

CREATE POLICY "oficios_update" ON oficios
  FOR UPDATE TO authenticated
  USING (es_contralor_o_admin());

-- ── oficio_tareas ─────────────────────────────────────
DROP POLICY IF EXISTS "oficio_tareas_select" ON oficio_tareas;
DROP POLICY IF EXISTS "oficio_tareas_insert" ON oficio_tareas;
DROP POLICY IF EXISTS "oficio_tareas_update" ON oficio_tareas;

CREATE POLICY "oficio_tareas_select" ON oficio_tareas
  FOR SELECT TO authenticated
  USING (es_contralor_o_admin());

CREATE POLICY "oficio_tareas_insert" ON oficio_tareas
  FOR INSERT TO authenticated
  WITH CHECK (es_contralor_o_admin());

CREATE POLICY "oficio_tareas_update" ON oficio_tareas
  FOR UPDATE TO authenticated
  USING (es_contralor_o_admin());
