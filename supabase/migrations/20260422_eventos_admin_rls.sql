-- ============================================================
-- Policies de escritura para eventos (admin CMS)
-- Fecha: 2026-04-22
-- ============================================================
-- La tabla public.eventos se creó con RLS activo pero solo con
-- policy de SELECT. Cualquier INSERT/UPDATE/DELETE desde el
-- admin con la anon key devolvía 0 filas afectadas sin error,
-- haciendo que el formulario aparentara guardar pero no
-- persistiera (p.ej. el toggle "es_destacado" del slider).
--
-- Patrón alineado con 20260421_fix_comites_rls.sql:
-- autorización vía auth.jwt() -> user_metadata.role = 'admin'.
-- ============================================================

CREATE POLICY "Solo admins insertan eventos"
ON public.eventos FOR INSERT
TO authenticated
WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "Solo admins actualizan eventos"
ON public.eventos FOR UPDATE
TO authenticated
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "Solo admins eliminan eventos"
ON public.eventos FOR DELETE
TO authenticated
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
