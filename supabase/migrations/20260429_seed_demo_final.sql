-- 20260429_seed_demo_final.sql
-- Seed data completo y consistente para el portal educativo AMIB

-- 0. Crear tabla catalogo_materias si no existe (ya que se está corriendo manualmente)
CREATE TABLE IF NOT EXISTS public.catalogo_materias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.catalogo_materias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo a autenticados" ON public.catalogo_materias;
CREATE POLICY "Permitir todo a autenticados" ON public.catalogo_materias FOR ALL TO authenticated USING (true);

-- 1. Limpieza de datos (Orden inverso de dependencias)
DELETE FROM public.asistencias;
DELETE FROM public.sesiones_catedra;
DELETE FROM public.entregas;
DELETE FROM public.tareas;
DELETE FROM public.clases_materiales;
DELETE FROM public.materia_alumnos;
DELETE FROM public.materias;
DELETE FROM public.catedra_alumnos;
DELETE FROM public.alumnos;
DELETE FROM public.catedras;
DELETE FROM public.profesores;
DELETE FROM public.catalogo_materias;
DELETE FROM public.instituciones_educativas;

-- 2. Instituciones Educativas
INSERT INTO public.instituciones_educativas (id, nombre, contacto_principal, email, telefono, estatus)
VALUES 
('f1111111-1111-1111-1111-111111111111', 'Casa de Bolsa BBVA', 'Lic. Rodrigo Sánchez', 'rodrigo.sanchez@bbva.com', '5551234567', 'ACTIVO'),
('f2222222-2222-2222-2222-222222222222', 'Santander México', 'Mtra. Lucía Méndez', 'lucia.mendez@santander.com', '5559876543', 'ACTIVO'),
('f3333333-3333-3333-3333-333333333333', 'AMIB - Centro de Formación', 'Ing. Javier López', 'javier.lopez@amib.com.mx', '5550001122', 'ACTIVO');

-- 3. Profesores
INSERT INTO public.profesores (id, nombre, rfc, curp, especialidad, estado_contrato, archivo_contrato_url)
VALUES 
('b1111111-1111-1111-1111-111111111111', 'Dr. Gabriel Zaid', 'ZAIDG700101HDF', 'CURPZAID123', 'Mercado de Valores y Derivados', 'FIRMADO', 'https://example.com/contrato1.pdf'),
('b2222222-2222-2222-2222-222222222222', 'Mtra. Elena Poniatowska', 'PONI800505XYZ', 'CURPPONI456', 'Ética Financiera y Cumplimiento', 'FIRMADO', 'https://example.com/contrato2.pdf'),
('b3333333-3333-3333-3333-333333333333', 'Lic. Arturo Elías Ayub', 'ELIA750101ABC', 'CURPELIA789', 'Estrategia de Inversión', 'FIRMADO', 'https://example.com/contrato3.pdf');

-- 4. Catálogo de Materias
INSERT INTO public.catalogo_materias (id, nombre, descripcion)
VALUES 
('d1111111-1111-1111-1111-111111111111', 'Ética Bursátil', 'Marco ético y regulatorio de la industria financiera en México.'),
('d2222222-2222-2222-2222-222222222222', 'Análisis Fundamental', 'Valuación de empresas mediante estados financieros y múltiplos.'),
('d3333333-3333-3333-3333-333333333333', 'Derivados Financieros', 'Opciones, futuros y swaps aplicados a la cobertura de riesgos.'),
('d4444444-4444-4444-4444-444444444444', 'Gobierno Corporativo', 'Estructuras de mando y transparencia en empresas públicas.');

-- 5. Cátedras (Programas)
INSERT INTO public.catedras (id, nombre, institucion_id, fecha_inicio, fecha_fin, estatus, descripcion, encargado_amib_id)
VALUES 
('c1111111-1111-1111-1111-111111111111', 'Certificación Figura 3 - Mayo 2026', 'f3333333-3333-3333-3333-333333333333', '2026-05-01', '2026-08-15', 'ACTIVA', 'Programa oficial de preparación para Asesores en Estrategias de Inversión.', (SELECT id FROM auth.users LIMIT 1)),
('c2222222-2222-2222-2222-222222222222', 'Diplomado en Finanzas Corporativas', 'f1111111-1111-1111-1111-111111111111', '2026-06-10', '2026-11-20', 'EN_PREPARACION', 'Diplomado avanzado para ejecutivos de banca patrimonial.', (SELECT id FROM auth.users LIMIT 1));

-- 6. Materias (Asignadas a Cátedras)
INSERT INTO public.materias (id, catedra_id, profesor_id, nombre, estatus, fecha_inicio, fecha_fin)
VALUES 
('e1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', 'Ética Bursátil', 'ACTIVA', '2026-05-01', '2026-05-30'),
('e2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'Derivados Financieros', 'ACTIVA', '2026-06-01', '2026-06-30');

-- 7. Alumnos
INSERT INTO public.alumnos (id, nombre, email, matricula, institucion_id)
VALUES 
('a1111111-1111-1111-1111-111111111111', 'Armando Demo', 'demo.alumno@amib.com.mx', 'ALU-2026-001', 'f3333333-3333-3333-3333-333333333333'),
('a2222222-2222-2222-2222-222222222222', 'Beatriz Inversiones', 'beatriz@bbva.com', 'ALU-2026-002', 'f1111111-1111-1111-1111-111111111111'),
('a3333333-3333-3333-3333-333333333333', 'Carlos Trader', 'carlos@santander.com', 'ALU-2026-003', 'f2222222-2222-2222-2222-222222222222');

-- 8. Inscripciones
INSERT INTO public.catedra_alumnos (catedra_id, alumno_id, estado_aprobacion)
VALUES 
('c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'CURSANDO'),
('c1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 'CURSANDO'),
('c1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 'CURSANDO');

INSERT INTO public.materia_alumnos (materia_id, alumno_id, estado_aprobacion)
VALUES 
('e1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'CURSANDO'),
('e1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 'CURSANDO'),
('e2222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333', 'CURSANDO');

-- 9. Sesiones con Modalidad
INSERT INTO public.sesiones_catedra (materia_id, fecha_sesion, hora_inicio, hora_fin, qr_token, estatus, modalidad, nombre_sesion, enlace_sesion)
VALUES 
('e1111111-1111-1111-1111-111111111111', '2026-05-02', '09:00:00', '11:00:00', 'QR_ETICA_SES1', 'PROGRAMADA', 'PRESENCIAL', 'Introducción a la Ética Bursátil', NULL),
('e1111111-1111-1111-1111-111111111111', '2026-05-05', '18:00:00', '20:00:00', 'QR_ETICA_SES2', 'PROGRAMADA', 'EN_LINEA', 'Caso de Estudio: Conflictos de Interés', 'https://zoom.us/j/123456789'),
('e2222222-2222-2222-2222-222222222222', '2026-06-03', '10:00:00', '13:00:00', 'QR_DERIV_SES1', 'PROGRAMADA', 'PRESENCIAL', 'Valuación de Opciones Americanas', NULL);

-- 10. Materiales demo
INSERT INTO public.clases_materiales (materia_id, titulo, descripcion, archivo_url, orden)
VALUES 
('e1111111-1111-1111-1111-111111111111', 'Código de Ética Profesional', 'Documento oficial de la AMIB para prestadores de servicios.', 'https://example.com/etica.pdf', 1),
('e2222222-2222-2222-2222-222222222222', 'Guía de Opciones y Futuros', 'Conceptos matemáticos básicos para la valuación de derivados.', 'https://example.com/guia_derivados.pdf', 1);

-- 11. Tareas demo
INSERT INTO public.tareas (materia_id, titulo, descripcion, fecha_limite)
VALUES 
('e1111111-1111-1111-1111-111111111111', 'Análisis Ético: Caso FICREA', 'Identificar las fallas éticas y regulatorias en el caso FICREA.', '2026-05-20 23:59:59'),
('e2222222-2222-2222-2222-222222222222', 'Ejercicios de Valuación Black-Scholes', 'Resolver el set de problemas 1 a 5 usando el modelo BS.', '2026-06-15 23:59:59');
