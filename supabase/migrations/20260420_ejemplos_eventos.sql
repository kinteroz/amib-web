-- Insertando eventos solicitados por el usuario como ejemplos reales
insert into public.eventos (
    titulo, 
    descripcion, 
    fecha_inicio, 
    fecha_fin, 
    tipo_acceso, 
    audiencia, 
    es_destacado, 
    modalidad, 
    ubicacion, 
    imagen_url, 
    costo, 
    activo
)
values 
(
    'Encuentro de Análisis AMIB 2026', 
    'Un foro especializado para el intercambio de perspectivas sobre el mercado de valores, análisis económico y político. Reúne a los principales estrategas y analistas para discutir las tendencias que marcarán el año.', 
    '2026-03-05 15:30:00+00', 
    '2026-03-05 19:00:00+00', 
    'libre', 
    'publico', 
    false, 
    'presencial', 
    'Auditorio del Centro Bursátil (CBMV), Reforma 255, CDMX', 
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2670&auto=format&fit=crop', 
    0, 
    true
),
(
    'Semana Nacional de Educación Financiera (SNEF)', 
    'Evento educativo integral donde la AMIB imparte conferencias y talleres sobre el funcionamiento del mercado bursátil y estrategias de inversión para todo tipo de perfiles.', 
    '2024-10-15 09:00:00+00', 
    '2024-10-22 18:00:00+00', 
    'libre', 
    'publico', 
    false, 
    'hibrido', 
    'Sede Central AMIB / Digital', 
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2700&auto=format&fit=crop', 
    0, 
    true
);
