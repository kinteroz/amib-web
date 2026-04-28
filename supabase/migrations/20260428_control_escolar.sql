-- 20260428_control_escolar.sql
-- Migración para estructurar el sistema como Control Escolar (Cátedra -> Materias -> Profesores)

-- 1. Crear tabla de Materias
CREATE TABLE IF NOT EXISTS public.materias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    catedra_id UUID REFERENCES public.catedras(id) ON DELETE CASCADE,
    profesor_id UUID REFERENCES public.profesores(id) ON DELETE SET NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    estatus TEXT DEFAULT 'ACTIVA' CHECK (estatus IN ('ACTIVA', 'FINALIZADA', 'EN_PREPARACION')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla de Materia_Alumnos (Kardex por Materia)
CREATE TABLE IF NOT EXISTS public.materia_alumnos (
    materia_id UUID REFERENCES public.materias(id) ON DELETE CASCADE,
    alumno_id UUID REFERENCES public.alumnos(id) ON DELETE CASCADE,
    calificacion_final NUMERIC(5,2),
    estado_aprobacion TEXT DEFAULT 'CURSANDO' CHECK (estado_aprobacion IN ('CURSANDO', 'APROBADO', 'REPROBADO', 'BAJA')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (materia_id, alumno_id)
);

-- 3. Modificar tablas operativas para apuntar a materias en lugar de catedras
-- Nota: Si hay datos existentes, esto podría fallar si las columnas no aceptan NULL antes de llenarse.
-- Como estamos en desarrollo, agregamos las columnas y luego borramos las anteriores.

ALTER TABLE public.clases_materiales ADD COLUMN materia_id UUID REFERENCES public.materias(id) ON DELETE CASCADE;
ALTER TABLE public.tareas ADD COLUMN materia_id UUID REFERENCES public.materias(id) ON DELETE CASCADE;
ALTER TABLE public.sesiones_catedra ADD COLUMN materia_id UUID REFERENCES public.materias(id) ON DELETE CASCADE;

-- Limpiar dependencias viejas (Borrando la columna catedra_id de las tablas operativas)
ALTER TABLE public.clases_materiales DROP COLUMN IF EXISTS catedra_id;
ALTER TABLE public.tareas DROP COLUMN IF EXISTS catedra_id;
ALTER TABLE public.sesiones_catedra DROP COLUMN IF EXISTS catedra_id;

-- 4. Remover profesor de la cátedra global
ALTER TABLE public.catedras DROP COLUMN IF EXISTS profesor_id;

-- 5. Configurar RLS
ALTER TABLE public.materias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materia_alumnos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todo a autenticados" ON public.materias FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir todo a autenticados" ON public.materia_alumnos FOR ALL TO authenticated USING (true);

-- Permitir lectura pública de materias (para el landing page)
CREATE POLICY "Lectura publica de materias" ON public.materias FOR SELECT USING (true);
