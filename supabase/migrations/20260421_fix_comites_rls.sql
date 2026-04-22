-- ============================================================
-- Fix RLS: reemplazar acceso a auth.users por auth.jwt()
-- Fecha: 2026-04-21
-- ============================================================
-- El error "permission denied for table users" ocurre porque
-- la política FOR ALL intentaba hacer SELECT en auth.users,
-- tabla que Supabase no expone al rol authenticated.
-- Solución: usar auth.jwt() para leer el metadata del usuario.
-- ============================================================

-- 1. Eliminar la política problemática
DROP POLICY IF EXISTS "Solo admins modifican sesiones" ON public.comites_sesiones;

-- 2. Recrear SOLO para escritura (INSERT, UPDATE, DELETE)
--    usando auth.jwt() en lugar de auth.users
CREATE POLICY "Solo admins insertan sesiones"
ON public.comites_sesiones FOR INSERT
TO authenticated
WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "Solo admins actualizan sesiones"
ON public.comites_sesiones FOR UPDATE
TO authenticated
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "Solo admins eliminan sesiones"
ON public.comites_sesiones FOR DELETE
TO authenticated
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
