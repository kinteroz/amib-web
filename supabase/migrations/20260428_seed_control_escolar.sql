-- 20260428_seed_control_escolar.sql

-- 1. Limpiar datos operativos huérfanos
DELETE FROM public.entregas;
DELETE FROM public.tareas;
DELETE FROM public.clases_materiales;
DELETE FROM public.asistencias;
DELETE FROM public.sesiones_catedra;
DELETE FROM public.materia_alumnos;
DELETE FROM public.materias;

-- 2. Insertar Materias asociadas a la Cátedra existente (Diplomado) usando subqueries seguras

INSERT INTO public.materias (catedra_id, profesor_id, nombre, descripcion, fecha_inicio, fecha_fin, estatus)
SELECT 
  (SELECT id FROM public.catedras WHERE nombre = 'Diplomado en Mercados Globales' LIMIT 1),
  (SELECT id FROM public.profesores WHERE nombre = 'Dr. Gabriel Zaid' LIMIT 1),
  'Mercados de Capitales I', 'Introducción a la renta variable y su operación en la BMV.', '2026-05-01', '2026-05-30', 'ACTIVA';

INSERT INTO public.materias (catedra_id, profesor_id, nombre, descripcion, fecha_inicio, fecha_fin, estatus)
SELECT 
  (SELECT id FROM public.catedras WHERE nombre = 'Diplomado en Mercados Globales' LIMIT 1),
  (SELECT id FROM public.profesores WHERE nombre = 'Mtra. Elena Poniatowska' LIMIT 1),
  'Derivados Financieros', 'Opciones, futuros y swaps.', '2026-06-01', '2026-06-30', 'ACTIVA';


-- 3. Inscribir alumnos existentes a las materias (Kardex)

INSERT INTO public.materia_alumnos (materia_id, alumno_id, calificacion_final, estado_aprobacion)
SELECT m.id, a.id, NULL, 'CURSANDO'
FROM public.materias m, public.alumnos a
WHERE m.nombre = 'Mercados de Capitales I' AND a.nombre = 'Juan Alumno de Prueba';

INSERT INTO public.materia_alumnos (materia_id, alumno_id, calificacion_final, estado_aprobacion)
SELECT m.id, a.id, NULL, 'CURSANDO'
FROM public.materias m, public.alumnos a
WHERE m.nombre = 'Mercados de Capitales I' AND a.nombre = 'Maria Estudiante Test';

INSERT INTO public.materia_alumnos (materia_id, alumno_id, calificacion_final, estado_aprobacion)
SELECT m.id, a.id, NULL, 'CURSANDO'
FROM public.materias m, public.alumnos a
WHERE m.nombre = 'Derivados Financieros' AND a.nombre = 'Juan Alumno de Prueba';


-- 4. Crear materiales para las materias
INSERT INTO public.clases_materiales (materia_id, titulo, descripcion, archivo_url, orden)
SELECT id, 'Introducción a la Bolsa', 'Conceptos básicos del mercado de valores', 'https://example.com/material_bolsa.pdf', 1
FROM public.materias WHERE nombre = 'Mercados de Capitales I';

INSERT INTO public.clases_materiales (materia_id, titulo, descripcion, archivo_url, orden)
SELECT id, 'Tipos de Órdenes', 'Limitadas, a mercado, stop loss.', 'https://example.com/ordenes.pdf', 2
FROM public.materias WHERE nombre = 'Mercados de Capitales I';


-- 5. Crear tareas para las materias
INSERT INTO public.tareas (materia_id, titulo, descripcion, fecha_limite)
SELECT id, 'Análisis de Empresa BMV', 'Realizar un análisis fundamental de una emisora.', '2026-05-15 23:59:00+00'
FROM public.materias WHERE nombre = 'Mercados de Capitales I';


-- 6. Crear sesiones para las materias (Asistencia)
INSERT INTO public.sesiones_catedra (materia_id, fecha_sesion, hora_inicio, hora_fin, qr_token, estatus)
SELECT id, '2026-05-02', '16:00:00', '18:00:00', 'TOKEN_SESSION_1_BOLSA', 'EN_CURSO'
FROM public.materias WHERE nombre = 'Mercados de Capitales I';
