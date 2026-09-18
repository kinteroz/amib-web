-- ============================================================
-- Comités: ciclo completo de gobierno
-- Fecha: 2026-07-19
-- ============================================================
-- 1. Mesas de trabajo: un comité puede tener sub-comités
--    (parent_id auto-referenciado). Una mesa hereda el patrón
--    completo: miembros, sesiones, minutas, acuerdos.
-- 2. Fix de policies de minutas: la policy "Solo admins
--    modifican minutas" consultaba auth.users (patrón defectuoso
--    ya corregido en comites_sesiones el 2026-04-24) — en la
--    práctica NADIE podía crear/editar minutas con la anon key.
-- 3. Los miembros del comité pueden LEER las minutas de sus
--    comités (necesario para firmarlas).
-- 4. Trigger: cuando todos los miembros del comité firman,
--    la minuta pasa sola a estado 'completada'.
-- ============================================================

-- ── 1. Mesas de trabajo ─────────────────────────────────────
ALTER TABLE public.comites_maestro
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.comites_maestro(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_comites_maestro_parent ON public.comites_maestro (parent_id);

-- El coordinador puede crear mesas de trabajo bajo sus propios comités
DROP POLICY IF EXISTS "Coordinador crea mesas de trabajo" ON public.comites_maestro;
CREATE POLICY "Coordinador crea mesas de trabajo"
ON public.comites_maestro FOR INSERT
TO authenticated
WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'responsable_comite')
    AND coordinador_amib_id = auth.uid()
    AND parent_id IS NOT NULL
);

-- ── 2. Fix policies de minutas ──────────────────────────────
DROP POLICY IF EXISTS "Solo admins modifican minutas" ON public.minutas;
DROP POLICY IF EXISTS "Admins y responsables gestionan minutas" ON public.minutas;

CREATE POLICY "Admins y responsables gestionan minutas"
ON public.minutas FOR ALL
TO authenticated
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'responsable_comite')
)
WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'responsable_comite')
);

-- ── 3. Miembros leen minutas de sus comités ─────────────────
DROP POLICY IF EXISTS "Miembros ven minutas de sus comites" ON public.minutas;
CREATE POLICY "Miembros ven minutas de sus comites"
ON public.minutas FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.comites_sesiones cs
        JOIN public.comites_miembros cm ON cm.comite_id = cs.comite_id
        WHERE cs.id = minutas.sesion_id
          AND cm.usuario_id = auth.uid()
    )
);

-- ── 4. Auto-completar minuta al reunir todas las firmas ─────
CREATE OR REPLACE FUNCTION public.comites_verificar_firmas()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_comite_id UUID;
    v_miembros  INT;
    v_firmas    INT;
BEGIN
    SELECT cs.comite_id INTO v_comite_id
    FROM public.minutas m
    JOIN public.comites_sesiones cs ON cs.id = m.sesion_id
    WHERE m.id = NEW.minuta_id;

    SELECT count(*) INTO v_miembros
    FROM public.comites_miembros
    WHERE comite_id = v_comite_id;

    SELECT count(*) INTO v_firmas
    FROM public.comites_firmas
    WHERE minuta_id = NEW.minuta_id;

    IF v_miembros > 0 AND v_firmas >= v_miembros THEN
        UPDATE public.minutas
        SET estado_firma = 'completada'
        WHERE id = NEW.minuta_id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_comites_firma_insertada ON public.comites_firmas;
CREATE TRIGGER on_comites_firma_insertada
  AFTER INSERT ON public.comites_firmas
  FOR EACH ROW EXECUTE PROCEDURE public.comites_verificar_firmas();
