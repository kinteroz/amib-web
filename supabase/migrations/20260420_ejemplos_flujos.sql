-- Script de ejemplos robustos para probar flujos de registro
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
    'Semana de Educación Bursátil AMIB', 
    'Una semana intensiva de talleres y conferencias para aprender a invertir desde cero hasta niveles avanzados. Acceso libre para todo el público interesado en el mercado de valores.', 
    '2026-05-12 09:00:00+00', 
    '2026-05-19 18:00:00+00', 
    'libre', 
    'publico', 
    true, 
    'hibrido', 
    'Sede AMIB / Zoom', 
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2670&auto=format&fit=crop', 
    0, 
    true
),
(
    'Foro de Fondos de Inversión 2026', 
    'El punto de encuentro anual para los profesionales de la gestión de activos en México. Discutiremos estrategias globales y el panorama local de los fondos de inversión.', 
    '2026-06-15 08:00:00+00', 
    '2026-06-15 15:00:00+00', 
    'pago', 
    'miembros', 
    false, 
    'presencial', 
    'Hotel Four Seasons, CDMX', 
    'https://images.unsplash.com/photo-1560523160-754a9e25c68f?q=80&w=2672&auto=format&fit=crop', 
    1200, 
    true
),
(
    'TechDay AMIB: CISO & CITO Summit', 
    'Evento exclusivo para Directores de Tecnología y Seguridad de las Casas de Bolsa asociados a la AMIB. Espacio restringido para invitaciones institucionales.', 
    '2026-07-22 10:00:00+00', 
    '2026-07-22 17:00:00+00', 
    'invitacion', 
    'comites', 
    false, 
    'presencial', 
    'Club de Industriales, CDMX', 
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop', 
    0, 
    true
);
