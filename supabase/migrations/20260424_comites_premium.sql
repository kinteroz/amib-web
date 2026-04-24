-- ============================================================
-- Portal AMIB: Módulo de Gestión Premium de Comités
-- Fecha: 2026-04-24
-- ============================================================

-- ============================================================
-- 1. Catálogo Maestro de Comités
-- ============================================================
CREATE TABLE public.comites_maestro (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre              TEXT NOT NULL,
    coordinador_amib_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Responsable del comité
    area_responsable    TEXT,
    objetivo            TEXT,
    activo              BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER on_comites_maestro_updated
  BEFORE UPDATE ON public.comites_maestro
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

ALTER TABLE public.comites_maestro ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visibilidad publica de comites activos"
ON public.comites_maestro FOR SELECT
TO authenticated
USING (activo = TRUE);

CREATE POLICY "Solo admins gestionan comites maestro"
ON public.comites_maestro FOR ALL
TO authenticated
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);


-- ============================================================
-- 2. Miembros del Comité
-- ============================================================
CREATE TABLE public.comites_miembros (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comite_id   UUID NOT NULL REFERENCES public.comites_maestro(id) ON DELETE CASCADE,
    usuario_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rol_comite  TEXT NOT NULL CHECK (rol_comite IN ('presidente', 'secretario', 'vocal', 'invitado')),
    created_at  TIMESTAMPTZ DEFAULT now(),
    UNIQUE(comite_id, usuario_id)
);

ALTER TABLE public.comites_miembros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven miembros de sus comites"
ON public.comites_miembros FOR SELECT
TO authenticated
USING (
    usuario_id = auth.uid() OR
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'responsable_comite')
);

CREATE POLICY "Gestión de miembros por admin o coordinador"
ON public.comites_miembros FOR ALL
TO authenticated
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'responsable_comite')
);


-- ============================================================
-- 3. Actualizar Sesiones de Comités
-- ============================================================
-- Agregar la relación al comité maestro
ALTER TABLE public.comites_sesiones 
ADD COLUMN comite_id UUID REFERENCES public.comites_maestro(id) ON DELETE CASCADE,
ADD COLUMN riesgos_identificados TEXT;

-- Corregir la política defectuosa de auth.users en comites_sesiones
DROP POLICY IF EXISTS "Solo admins modifican sesiones" ON public.comites_sesiones;

CREATE POLICY "Admins y Responsables gestionan sesiones"
ON public.comites_sesiones FOR ALL
TO authenticated
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'responsable_comite')
);


-- ============================================================
-- 4. Actualizar Minutas para Soportar Tracking y Firmas
-- ============================================================
ALTER TABLE public.minutas
ADD COLUMN cuerpo_minuta JSONB,
ADD COLUMN estado_firma TEXT DEFAULT 'borrador' CHECK (estado_firma IN ('borrador', 'pendiente_firmas', 'completada'));


-- ============================================================
-- 5. Acuerdos y Compromisos
-- ============================================================
CREATE TABLE public.comites_acuerdos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    minuta_id       UUID NOT NULL REFERENCES public.minutas(id) ON DELETE CASCADE,
    descripcion     TEXT NOT NULL,
    responsable_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    fecha_limite    DATE,
    estado          TEXT DEFAULT 'abierto' CHECK (estado IN ('abierto', 'en_proceso', 'cerrado')),
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER on_comites_acuerdos_updated
  BEFORE UPDATE ON public.comites_acuerdos
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

ALTER TABLE public.comites_acuerdos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visibilidad de acuerdos"
ON public.comites_acuerdos FOR SELECT
TO authenticated
USING (true); -- La seguridad recae en que no se puede listar minutas sin permiso

CREATE POLICY "Gestión de acuerdos"
ON public.comites_acuerdos FOR ALL
TO authenticated
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'responsable_comite')
);


-- ============================================================
-- 6. Firmas Digitales
-- ============================================================
CREATE TABLE public.comites_firmas (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    minuta_id       UUID NOT NULL REFERENCES public.minutas(id) ON DELETE CASCADE,
    usuario_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fecha_firma     TIMESTAMPTZ DEFAULT now(),
    hash_firma      TEXT NOT NULL,
    ip_firma        TEXT,
    UNIQUE(minuta_id, usuario_id)
);

ALTER TABLE public.comites_firmas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver firmas de minutas visibles"
ON public.comites_firmas FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Asociados firman por si mismos"
ON public.comites_firmas FOR INSERT
TO authenticated
WITH CHECK (
    usuario_id = auth.uid()
);


-- ============================================================
-- 7. Datos de Ejemplo (Seed)
-- ============================================================
INSERT INTO public.comites_maestro (nombre, area_responsable, objetivo)
VALUES 
    ('Comité de Normatividad Bursátil', 'Dirección Jurídica', 'Analizar y proponer mejoras a la regulación del mercado.'),
    ('Comité de Ética y Vigilancia', 'Dirección de Cumplimiento', 'Vigilar el correcto actuar de los participantes del mercado.');
