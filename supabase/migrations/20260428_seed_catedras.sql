-- Seed data para el Módulo de Cátedras (AMIB)

-- 1. Limpieza opcional (solo para desarrollo)
-- DELETE FROM public.asistencias;
-- DELETE FROM public.sesiones_catedra;
-- DELETE FROM public.entregas;
-- DELETE FROM public.tareas;
-- DELETE FROM public.clases_materiales;
-- DELETE FROM public.catedra_alumnos;
-- DELETE FROM public.alumnos;
-- DELETE FROM public.catedras;
-- DELETE FROM public.profesores;
-- DELETE FROM public.instituciones_educativas;

-- 2. Instituciones Educativas
INSERT INTO public.instituciones_educativas (nombre, contacto_principal, email, telefono, estatus)
VALUES 
('UNAM - Facultad de Economía', 'Dr. Alberto Rivera', 'economia@unam.mx', '5551234567', 'ACTIVO'),
('Universidad Panamericana (UP)', 'Lic. Sofía Martínez', 'smartinez@up.edu.mx', '5559876543', 'ACTIVO'),
('ITAM - Finanzas', 'Ing. Ricardo Salgado', 'rsalgado@itam.mx', '5550001122', 'ACTIVO'),
('Tec de Monterrey (CCM)', 'Mtra. Claudia Ruiz', 'cruiz@tec.mx', '5553334455', 'ACTIVO');

-- 3. Profesores (Usamos IDs fijos para pruebas de vinculación)
INSERT INTO public.profesores (id, nombre, rfc, curp, especialidad, estado_contrato, archivo_contrato_url)
VALUES 
('a1111111-1111-1111-1111-111111111111', 'Dr. Gabriel Zaid', 'ZAIDG700101HDF', 'CURPZAID123', 'Mercado de Valores y Derivados', 'FIRMADO', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'),
('b2222222-2222-2222-2222-222222222222', 'Mtra. Elena Poniatowska', 'PONI800505XYZ', 'CURPPONI456', 'Ética Financiera y Cumplimiento', 'PENDIENTE', NULL),
('c3333333-3333-3333-3333-333333333333', 'Lic. Arturo Elías Ayub', 'ELIA750101ABC', 'CURPELIA789', 'Negociación y Estrategia', 'FIRMADO', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

-- 4. Cátedras (Cursos)
-- Cátedra UNAM
INSERT INTO public.catedras (nombre, institucion_id, profesor_id, fecha_inicio, fecha_fin, estatus, descripcion)
SELECT 'Diplomado en Mercados Globales', id, 'a1111111-1111-1111-1111-111111111111', '2026-05-01', '2026-08-30', 'ACTIVA', 'Estudio profundo de los mercados de capitales internacionales.'
FROM public.instituciones_educativas WHERE nombre = 'UNAM - Facultad de Economía' LIMIT 1;

-- Cátedra UP
INSERT INTO public.catedras (nombre, institucion_id, profesor_id, fecha_inicio, fecha_fin, estatus, descripcion)
SELECT 'Certificación Figura 3: Asesor en Estrategias', id, 'b2222222-2222-2222-2222-222222222222', '2026-06-15', '2026-12-15', 'EN_PREPARACION', 'Preparación integral para la certificación oficial ante AMIB.'
FROM public.instituciones_educativas WHERE nombre = 'Universidad Panamericana (UP)' LIMIT 1;

-- 5. Alumnos (Inscritos a la UNAM)
INSERT INTO public.alumnos (id, nombre, email, matricula, institucion_id)
SELECT 'd4444444-4444-4444-4444-444444444444', 'Juan Alumno de Prueba', 'alumno1@demo.com', 'MAT-001', id
FROM public.instituciones_educativas WHERE nombre = 'UNAM - Facultad de Economía' LIMIT 1;

INSERT INTO public.alumnos (id, nombre, email, matricula, institucion_id)
SELECT 'e5555555-5555-5555-5555-555555555555', 'Maria Estudiante Test', 'alumno2@demo.com', 'MAT-002', id
FROM public.instituciones_educativas WHERE nombre = 'UNAM - Facultad de Economía' LIMIT 1;

-- 6. Inscripciones (Vinculamos alumnos a la cátedra de la UNAM)
INSERT INTO public.catedra_alumnos (catedra_id, alumno_id, estado_aprobacion)
SELECT c.id, a.id, 'CURSANDO'
FROM public.catedras c, public.alumnos a
WHERE c.nombre = 'Diplomado en Mercados Globales';

-- 7. Materiales para la cátedra UNAM
INSERT INTO public.clases_materiales (catedra_id, titulo, descripcion, archivo_url, orden)
SELECT id, 'Semana 1: Análisis Técnico', 'Introducción a gráficas, velas japonesas y tendencias.', 'https://example.com/manual-tecnico.pdf', 1
FROM public.catedras WHERE nombre = 'Diplomado en Mercados Globales';

INSERT INTO public.clases_materiales (catedra_id, titulo, descripcion, archivo_url, orden)
SELECT id, 'Semana 2: Análisis Fundamental', 'Evaluación de estados financieros y múltiplos.', 'https://example.com/manual-fundamental.pdf', 2
FROM public.catedras WHERE nombre = 'Diplomado en Mercados Globales';

-- 8. Tareas para la cátedra UNAM
INSERT INTO public.tareas (catedra_id, titulo, descripcion, fecha_limite)
SELECT id, 'Ensayo: Impacto de la Inflación', 'Analizar cómo la inflación actual afecta las tasas del Banco de México.', '2026-05-15 23:59:59'
FROM public.catedras WHERE nombre = 'Diplomado en Mercados Globales';

INSERT INTO public.tareas (catedra_id, titulo, descripcion, fecha_limite)
SELECT id, 'Cuestionario de Derivados', 'Responder las 20 preguntas sobre opciones y futuros.', '2026-05-25 18:00:00'
FROM public.catedras WHERE nombre = 'Diplomado en Mercados Globales';
