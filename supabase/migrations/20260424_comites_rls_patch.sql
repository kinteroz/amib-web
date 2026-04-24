-- ============================================================
-- Parche RLS: Permisos faltantes para responsable_comite
-- Fecha: 2026-04-24
-- ============================================================

-- ── 1. MINUTAS ─────────────────────────────────────────────
-- Permitir que responsable_comite inserte y actualice minutas de su comité
DROP POLICY IF EXISTS "Solo admins modifican minutas" ON public.minutas;

CREATE POLICY "Admins y responsables gestionan minutas"
ON public.minutas FOR ALL
TO authenticated
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'responsable_comite')
)
WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'responsable_comite')
);

-- Todos los autenticados pueden ver minutas (la visibilidad real la controla la sesión)
DROP POLICY IF EXISTS "Usuarios ven minutas de sus sesiones o publicas" ON public.minutas;

CREATE POLICY "Usuarios autenticados ven minutas"
ON public.minutas FOR SELECT
TO authenticated
USING (true);


-- ── 2. COMITES_SESIONES ────────────────────────────────────
-- Asegurarnos de que la política de la migración original sea reemplazada

-- Esta es la política defectuosa de la migración original (usa auth.users)
DROP POLICY IF EXISTS "Solo admins modifican sesiones" ON public.comites_sesiones;

-- La política correcta ya fue creada en comites_premium.sql, verificar si existe
-- Si no existe, crearla:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'comites_sesiones'
    AND policyname = 'Admins y Responsables gestionan sesiones'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Admins y Responsables gestionan sesiones"
      ON public.comites_sesiones FOR ALL
      TO authenticated
      USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'responsable_comite')
      )
    $policy$;
  END IF;
END $$;


-- ── 3. COMITES_FIRMAS — SELECT ampliado ────────────────────
-- Permitir que responsable_comite vea todas las firmas de sus minutas
DROP POLICY IF EXISTS "Ver firmas de minutas visibles" ON public.comites_firmas;

CREATE POLICY "Ver firmas de minutas"
ON public.comites_firmas FOR SELECT
TO authenticated
USING (
    usuario_id = auth.uid()
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'responsable_comite')
);


-- ── 4. INFORMES — Corrección (ya incluida en fix_informes_rls.sql) ────
-- Re-aplicar por si no se ejecutó previamente
DROP POLICY IF EXISTS "Solo admins modifican informes" ON public.informes;

CREATE POLICY "Solo admins modifican informes"
ON public.informes FOR ALL
TO authenticated
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
