create table if not exists public.eventos (
    id uuid default gen_random_uuid() primary key,
    titulo text not null,
    descripcion text,
    fecha_inicio timestamp with time zone not null,
    fecha_fin timestamp with time zone,
    tipo_acceso text default 'invitacion' check (tipo_acceso in ('libre', 'pago', 'invitacion')),
    audiencia text default 'publico' check (audiencia in ('publico', 'asociados', 'comites', 'instituciones', 'cisos', 'directores')),
    es_destacado boolean default false,
    modalidad text default 'presencial' check (modalidad in ('presencial', 'virtual', 'hibrido')),
    ubicacion text,
    imagen_url text,
    registro_url text,
    costo numeric default 0,
    activo boolean default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Set RLS
alter table public.eventos enable row level security;

-- Policies
create policy "Eventos visibles públicamente" 
    on public.eventos for select 
    using (true);

-- Insert dummy data for highlighted events
insert into public.eventos (titulo, descripcion, fecha_inicio, fecha_fin, tipo_acceso, audiencia, es_destacado, modalidad, ubicacion, imagen_url, costo, activo)
values 
('Encuentro AMIB 2024', 'El evento cumbre de la industria bursátil mexicana. Un espacio de diálogo, innovación y networking con los líderes que definen el futuro de los mercados financieros.', now() + interval '42 days 18 hours', now() + interval '43 days', 'invitacion', 'directores', true, 'presencial', 'CDMX, México', 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2670&auto=format&fit=crop', 0, true),
('Foro de Fondos de Inversión', 'Perspectivas y estrategias para el año en curso reuniendo a las principales operadoras de fondos.', now() + interval '15 days', null, 'libre', 'publico', false, 'presencial', 'Hotel Camino Real Polanco', null, 0, true),
('AMIB TechDay 2025', 'Innovación Tecnológica en el sector financiero. Solo por invitación para CISOS y Directores IT.', now() + interval '60 days', null, 'invitacion', 'cisos', false, 'hibrido', 'Centro de Convenciones AMIB', null, 0, true);
