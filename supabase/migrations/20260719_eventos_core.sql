-- ============================================================
-- Eventos core: registro real de asistentes
-- Fecha: 2026-07-19
-- ============================================================
-- 1. evento_asistentes captura el boleto elegido, institución y
--    cargo (el wizard ya los pedía pero se descartaban).
-- 2. Se cierra la policy "Admin write access for asistentes"
--    (cualquier autenticado podía leer/escribir TODOS los
--    asistentes) → ahora solo role='admin'.
-- 3. El asistente puede consultar sus propios registros por
--    usuario_id o por el email de su sesión (para registros
--    hechos sin sesión iniciada).
-- ============================================================

ALTER TABLE public.evento_asistentes
  ADD COLUMN IF NOT EXISTS ticket_id uuid REFERENCES public.evento_tickets(id),
  ADD COLUMN IF NOT EXISTS institucion text,
  ADD COLUMN IF NOT EXISTS cargo text;

-- Cerrar la policy laxa
DROP POLICY IF EXISTS "Admin write access for asistentes" ON public.evento_asistentes;

CREATE POLICY "Solo admins gestionan asistentes"
ON public.evento_asistentes FOR ALL
TO authenticated
USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- "Users can read own asistencia" (auth.uid() = usuario_id) ya existe
-- desde 20260423_premium_events.sql. Se agrega la variante por email
-- para registros creados sin sesión:
DROP POLICY IF EXISTS "Users can read own asistencia by email" ON public.evento_asistentes;

CREATE POLICY "Users can read own asistencia by email"
ON public.evento_asistentes FOR SELECT
TO authenticated
USING (lower(email) = lower(auth.jwt() ->> 'email'));

CREATE INDEX IF NOT EXISTS idx_evento_asistentes_usuario ON public.evento_asistentes (usuario_id);
CREATE INDEX IF NOT EXISTS idx_evento_asistentes_email ON public.evento_asistentes (lower(email));
CREATE INDEX IF NOT EXISTS idx_evento_asistentes_qr ON public.evento_asistentes (qr_code);
