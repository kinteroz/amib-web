-- Script para generar múltiples "Eventos Premium Demo" con todos los layouts y features
-- Limpiar datos previos de demo para evitar duplicados si se corre varias veces (opcional)
-- DELETE FROM public.eventos WHERE titulo LIKE '%Demo%';

DO $$
DECLARE
    event_id_1 uuid := gen_random_uuid();
    event_id_2 uuid := gen_random_uuid();
    event_id_3 uuid := gen_random_uuid();
    event_id_4 uuid := gen_random_uuid();
BEGIN
    -- =========================================================================
    -- EVENTO 1: CUMBRE INMERSIVA (EXISTENTE MEJORADA)
    -- =========================================================================
    INSERT INTO public.eventos (
        id, titulo, descripcion, fecha_inicio, fecha_fin, modalidad, 
        ubicacion, tipo_acceso, audiencia, imagen_url, 
        tipo_hero, efecto_overlay, layout_tipo, media_tipo, media_url, badge_texto, cta_texto,
        es_destacado, activo, agenda_json, configuracion_registro
    ) VALUES (
        event_id_1, 
        'Cumbre Anual AMIB 2026: El Futuro del Mercado', 
        'Acompaña a los líderes más influyentes del sector financiero en una jornada de innovación, análisis de tendencias globales y networking de alto nivel en un entorno completamente inmersivo.', 
        timezone('utc'::text, now()) + interval '10 days', 
        timezone('utc'::text, now()) + interval '12 days', 
        'hibrido', 
        'Centro de Convenciones Santa Fe / Virtual', 
        'libre', 
        'publico', 
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop', 
        'fullscreen-image', 
        'matrix', 
        'immersive', 
        'image', 
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop', 
        'EVENTO PRINCIPAL', 
        'Asegura tu Lugar',
        true, 
        true,
        '[
            {"hora": "09:00", "titulo": "Registro y Café de Bienvenida", "descripcion": "Llegada de invitados VIP.", "ponente": ""},
            {"hora": "10:00", "titulo": "Apertura: Perspectivas 2026", "descripcion": "Keynote sobre la macroeconomía.", "ponente": "Dr. Alejandro Silva"},
            {"hora": "12:00", "titulo": "Panel: Fintech y Regulación", "descripcion": "Discusión sobre el sandbox regulatorio.", "ponente": "Varios Panelistas"}
        ]'::jsonb,
        '{"permite_invitados": true, "max_invitados": 2, "cupo_maximo": 500}'::jsonb
    );

    INSERT INTO public.evento_ponentes (evento_id, nombre, cargo, bio, imagen_url, orden)
    VALUES 
        (event_id_1, 'Elena Martínez', 'Directora de Inversiones, Fondo Alpha', 'Con más de 15 años de experiencia en mercados emergentes, Elena lidera las estrategias de renta variable y adopción de ESG.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop', 1),
        (event_id_1, 'Roberto Vargas', 'CEO, FinTech México', 'Pionero en la banca digital en la región, Roberto ha impulsado múltiples startups hacia el éxito unicornio.', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop', 2);

    INSERT INTO public.evento_galeria (evento_id, media_url, media_tipo, titulo, orden)
    VALUES
        (event_id_1, 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1000&auto=format&fit=crop', 'image', 'Salón Plenario', 1),
        (event_id_1, 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1000&auto=format&fit=crop', 'image', 'Panel de Expertos', 2);

    -- =========================================================================
    -- EVENTO 2: MASTERCLASS (SPLIT HERO - MINIMAL LAYOUT)
    -- =========================================================================
    INSERT INTO public.eventos (
        id, titulo, descripcion, fecha_inicio, fecha_fin, modalidad, 
        ubicacion, tipo_acceso, audiencia, imagen_url, 
        tipo_hero, efecto_overlay, layout_tipo, media_tipo, media_url, badge_texto, cta_texto,
        es_destacado, activo, agenda_json, configuracion_registro
    ) VALUES (
        event_id_2, 
        'Masterclass: Estrategias de Inversión 2026', 
        'Un taller intensivo enfocado en la construcción de portafolios resilientes frente a la volatilidad global.', 
        timezone('utc'::text, now()) + interval '15 days', 
        timezone('utc'::text, now()) + interval '15 days' + interval '4 hours', 
        'virtual', 
        'Plataforma Zoom AMIB', 
        'pago', 
        'asociados', 
        'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070&auto=format&fit=crop', 
        'split', 
        'none', 
        'minimal', 
        'image', 
        'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070&auto=format&fit=crop', 
        'CURSO CERTIFICADO', 
        'Comprar Boleto',
        false, 
        true,
        '[
            {"hora": "16:00", "titulo": "Introducción a Activos Alternativos", "descripcion": "Explorando el Real Estate y Private Equity.", "ponente": "Ing. Ricardo Luna"},
            {"hora": "18:00", "titulo": "Taller de Riesgos", "descripcion": "Simulación de escenarios críticos.", "ponente": "Mtra. Sofia Pons"}
        ]'::jsonb,
        '{"permite_invitados": false, "max_invitados": 0, "cupo_maximo": 100}'::jsonb
    );

    INSERT INTO public.evento_tickets (evento_id, nombre, descripcion, precio, activo)
    VALUES
        (event_id_2, 'Boleto General', 'Acceso a la sesión en vivo y grabación por 30 días.', 1500, true),
        (event_id_2, 'Boleto Premium', 'Incluye sesión Q&A privada con el ponente.', 2500, true);

    -- =========================================================================
    -- EVENTO 3: FORO REGIONAL (MODERN LAYOUT)
    -- =========================================================================
    INSERT INTO public.eventos (
        id, titulo, descripcion, fecha_inicio, fecha_fin, modalidad, 
        ubicacion, tipo_acceso, audiencia, imagen_url, 
        tipo_hero, efecto_overlay, layout_tipo, media_tipo, media_url, badge_texto, cta_texto,
        es_destacado, activo, agenda_json, configuracion_registro
    ) VALUES (
        event_id_3, 
        'Foro Regional AMIB: Bajío', 
        'El encuentro líder para el desarrollo del mercado de capitales en la zona del Bajío.', 
        timezone('utc'::text, now()) + interval '20 days', 
        timezone('utc'::text, now()) + interval '21 days', 
        'presencial', 
        'Hacienda Jurica, Querétaro', 
        'libre', 
        'publico', 
        'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop', 
        'fullscreen-image', 
        'pulse', 
        'modern', 
        'image', 
        'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop', 
        'REGIONAL', 
        'Registrar Asistencia',
        true, 
        true,
        '[
            {"hora": "08:30", "titulo": "Desayuno de Networking", "descripcion": "Espacio de interacción institucional.", "ponente": ""},
            {"hora": "10:30", "titulo": "Panel: Inversión en Infraestructura", "descripcion": "Oportunidades en Querétaro y alrededores.", "ponente": "Gobernador del Estado"}
        ]'::jsonb,
        '{"permite_invitados": true, "max_invitados": 1, "cupo_maximo": 300}'::jsonb
    );

    -- =========================================================================
    -- EVENTO 4: SEMINARIO ÉTICA (EVENTO FINALIZADO PARA PRUEBAS)
    -- =========================================================================
    INSERT INTO public.eventos (
        id, titulo, descripcion, fecha_inicio, fecha_fin, modalidad, 
        ubicacion, tipo_acceso, audiencia, imagen_url, 
        tipo_hero, efecto_overlay, layout_tipo, media_tipo, media_url, badge_texto, cta_texto,
        es_destacado, activo, agenda_json, configuracion_registro
    ) VALUES (
        event_id_4, 
        'Seminario Nacional de Ética Bursátil', 
        'Actualización obligatoria sobre el código de ética y sana práctica del mercado.', 
        timezone('utc'::text, now()) - interval '5 days', 
        timezone('utc'::text, now()) - interval '4 days', 
        'virtual', 
        'Plataforma AMIB', 
        'libre', 
        'asociados', 
        'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop', 
        'fullscreen-image', 
        'none', 
        'classic', 
        'image', 
        'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop', 
        'FINALIZADO', 
        'Ver Memorias',
        false, 
        true,
        '[
            {"hora": "09:00", "titulo": "Módulo 1: Nuevas Normativas", "descripcion": "Revisión de cambios legales 2025.", "ponente": "Lic. Carlos Ruiz"}
        ]'::jsonb,
        '{"permite_invitados": false, "max_invitados": 0, "cupo_maximo": 1000}'::jsonb
    );

END $$;
