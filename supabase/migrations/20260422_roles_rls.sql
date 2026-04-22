-- ============================================================
-- RLS para registro de eventos y tablas relacionadas
-- Fecha: 2026-04-22
-- ============================================================
-- Roles del sistema:
--   admin    → CMS completo (gestiona eventos, banners, noticias, etc.)
--   asociado → Portal de asociados, puede registrarse a eventos
--
-- Los roles se almacenan en auth.users.raw_user_meta_data->>'role'
-- y se leen en RLS vía auth.jwt() -> 'user_metadata' ->> 'role'.
-- ============================================================

-- ============================================================
-- 1. EVENTO_TICKETS — solo admins pueden modificar tipos de boleto
-- ============================================================
ALTER TABLE public.evento_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tickets visibles públicamente"
ON public.evento_tickets FOR SELECT
USING (true);

CREATE POLICY "Solo admins gestionan tickets"
ON public.evento_tickets FOR ALL
TO authenticated
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- ============================================================
-- 2. EVENTO_REGISTROS — asociados y admins pueden insertar;
--    cada usuario solo ve sus propios registros; admins ven todo.
-- ============================================================
ALTER TABLE public.evento_registros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Asociados pueden registrarse a eventos"
ON public.evento_registros FOR INSERT
TO authenticated
WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('asociado', 'admin')
);

CREATE POLICY "Admins ven todos los registros"
ON public.evento_registros FOR SELECT
TO authenticated
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "Asociados ven sus propios registros"
ON public.evento_registros FOR SELECT
TO authenticated
USING (
    usuario_id = auth.uid()
);

CREATE POLICY "Solo admins modifican registros"
ON public.evento_registros FOR UPDATE
TO authenticated
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "Solo admins eliminan registros"
ON public.evento_registros FOR DELETE
TO authenticated
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
