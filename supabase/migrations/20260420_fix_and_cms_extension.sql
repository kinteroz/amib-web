-- 1. Corregir y completar la tabla de eventos con campos para el CMS (Agregando soporte para invitados y configuración)
alter table public.eventos 
add column if not exists agenda_json jsonb default '[]', -- Para la Agenda Dinámica (Sesiones)
add column if not exists configuracion_registro jsonb default '{"permite_invitados": false, "max_invitados": 0}', -- Configuración de registro
add column if not exists categoria text default 'Gremial' check (categoria in ('Gremial', 'Educación', 'Institucional', 'Social'));

-- 2. Tabla para Tipos de Boletos (Gestión de Boletos)
create table if not exists public.evento_tickets (
    id uuid default gen_random_uuid() primary key,
    evento_id uuid references public.eventos(id) on delete cascade,
    nombre text not null, -- VIP, General, Early Bird, etc.
    descripcion text,
    precio numeric default 0,
    capacidad integer,
    activo boolean default true,
    created_at timestamp with time zone default now()
);

-- 3. Tabla para Registros (Inscripciones)
create table if not exists public.evento_registros (
    id uuid default gen_random_uuid() primary key,
    evento_id uuid references public.eventos(id) on delete cascade,
    ticket_id uuid references public.evento_tickets(id),
    usuario_id uuid, -- Referencia a auth.users si es necesario
    nombre_completo text not null,
    email text not null,
    institucion text,
    cargo text,
    invitados_json jsonb default '[]', -- Lista de invitados [ {nombre, email, cargo}, ... ]
    estado_pago text check (estado_pago in ('pendiente', 'completado', 'n/a')) default 'n/a',
    created_at timestamp with time zone default now()
);

-- 4. Query CORREGIDO con valores válidos para el constraint de audiencia
-- Reemplazando 'miembros' por 'asociados'
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
    activo,
    configuracion_registro
)
values 
(
    'Semana de Educación Bursátil AMIB', 
    'Una semana intensiva de talleres y conferencias para aprender a invertir desde cero hasta niveles avanzados.', 
    '2026-05-12 09:00:00+00', 
    '2026-05-19 18:00:00+00', 
    'libre', 
    'publico', 
    true, 
    'hibrido', 
    'Sede AMIB / Zoom', 
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2670&auto=format&fit=crop', 
    0, 
    true,
    '{"permite_invitados": false, "max_invitados": 0}'
),
(
    'Foro de Fondos de Inversión 2026', 
    'El punto de encuentro anual para los profesionales de la gestión de activos en México.', 
    '2026-06-15 08:00:00+00', 
    '2026-06-15 15:00:00+00', 
    'pago', 
    'asociados', -- Corregido: 'miembros' -> 'asociados'
    false, 
    'presencial', 
    'Hotel Four Seasons, CDMX', 
    'https://images.unsplash.com/photo-1560523160-754a9e25c68f?q=80&w=2672&auto=format&fit=crop', 
    1200, 
    true,
    '{"permite_invitados": true, "max_invitados": 1}'
),
(
    'TechDay AMIB: CISO & CITO Summit', 
    'Evento exclusivo para Directores de Tecnología y Seguridad de las Casas de Bolsa asociados a la AMIB.', 
    '2026-07-22 10:00:00+00', 
    '2026-07-22 17:00:00+00', 
    'invitacion', 
    'cisos', 
    false, 
    'presencial', 
    'Club de Industriales, CDMX', 
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop', 
    0, 
    true,
    '{"permite_invitados": true, "max_invitados": 2}'
);
