-- Migración de Cátedras, Instituciones, Alumnos y Profesores (AMIB)

-- 1. Instituciones Educativas
CREATE TABLE IF NOT EXISTS public.instituciones_educativas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    contacto_principal TEXT,
    email TEXT,
    telefono TEXT,
    estatus TEXT DEFAULT 'ACTIVO' CHECK (estatus IN ('ACTIVO', 'INACTIVO')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Profesores
CREATE TABLE IF NOT EXISTS public.profesores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Linked to auth.users theoretically
    nombre TEXT NOT NULL,
    rfc TEXT,
    curp TEXT,
    especialidad TEXT,
    estado_contrato TEXT DEFAULT 'PENDIENTE' CHECK (estado_contrato IN ('PENDIENTE', 'FIRMADO', 'FINALIZADO')),
    archivo_contrato_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Cátedras
CREATE TABLE IF NOT EXISTS public.catedras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institucion_id UUID REFERENCES public.instituciones_educativas(id) ON DELETE CASCADE,
    profesor_id UUID REFERENCES public.profesores(id) ON DELETE SET NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    estatus TEXT DEFAULT 'EN_PREPARACION' CHECK (estatus IN ('ACTIVA', 'FINALIZADA', 'EN_PREPARACION')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Alumnos
CREATE TABLE IF NOT EXISTS public.alumnos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Linked to auth.users
    matricula TEXT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    institucion_id UUID REFERENCES public.instituciones_educativas(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Inscripciones (catedra_alumnos)
CREATE TABLE IF NOT EXISTS public.catedra_alumnos (
    catedra_id UUID REFERENCES public.catedras(id) ON DELETE CASCADE,
    alumno_id UUID REFERENCES public.alumnos(id) ON DELETE CASCADE,
    calificacion_final NUMERIC(5,2),
    estado_aprobacion TEXT DEFAULT 'CURSANDO' CHECK (estado_aprobacion IN ('CURSANDO', 'APROBADO', 'REPROBADO', 'BAJA')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (catedra_id, alumno_id)
);

-- 6. Clases/Materiales (Asincrono)
CREATE TABLE IF NOT EXISTS public.clases_materiales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    catedra_id UUID REFERENCES public.catedras(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    archivo_url TEXT,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tareas y Entregas
CREATE TABLE IF NOT EXISTS public.tareas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    catedra_id UUID REFERENCES public.catedras(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    fecha_limite TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.entregas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tarea_id UUID REFERENCES public.tareas(id) ON DELETE CASCADE,
    alumno_id UUID REFERENCES public.alumnos(id) ON DELETE CASCADE,
    archivo_url TEXT,
    calificacion NUMERIC(5,2),
    comentarios_profesor TEXT,
    fecha_entrega TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tarea_id, alumno_id)
);

-- 8. Asistencia (Sesiones y Escaneos QR)
CREATE TABLE IF NOT EXISTS public.sesiones_catedra (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    catedra_id UUID REFERENCES public.catedras(id) ON DELETE CASCADE,
    fecha_sesion DATE NOT NULL,
    hora_inicio TIME,
    hora_fin TIME,
    qr_token TEXT UNIQUE NOT NULL, -- Token dinámico para QR
    estatus TEXT DEFAULT 'PROGRAMADA' CHECK (estatus IN ('PROGRAMADA', 'EN_CURSO', 'FINALIZADA')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.asistencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sesion_id UUID REFERENCES public.sesiones_catedra(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL, -- Puede ser alumno o profesor
    rol_asistente TEXT NOT NULL CHECK (rol_asistente IN ('ALUMNO', 'PROFESOR')),
    hora_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metodo_registro TEXT DEFAULT 'QR_SCAN',
    UNIQUE(sesion_id, usuario_id)
);

-- Habilitar RLS
ALTER TABLE public.instituciones_educativas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profesores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catedras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catedra_alumnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clases_materiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entregas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones_catedra ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asistencias ENABLE ROW LEVEL SECURITY;

-- Políticas temporales para pruebas/dev
CREATE POLICY "Permitir todo a autenticados" ON public.instituciones_educativas FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir todo a autenticados" ON public.profesores FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir todo a autenticados" ON public.catedras FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir todo a autenticados" ON public.alumnos FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir todo a autenticados" ON public.catedra_alumnos FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir todo a autenticados" ON public.clases_materiales FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir todo a autenticados" ON public.tareas FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir todo a autenticados" ON public.entregas FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir todo a autenticados" ON public.sesiones_catedra FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir todo a autenticados" ON public.asistencias FOR ALL TO authenticated USING (true);
