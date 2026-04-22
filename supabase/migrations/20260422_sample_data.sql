-- Migration: High-quality sample data for AMIB Portal
-- Date: 2026-04-22

-- 1. Limpiar datos de prueba anteriores (Opcional, para evitar duplicados)
TRUNCATE public.banners CASCADE;
TRUNCATE public.noticias CASCADE;

-- 2. Banners Cinematográficos (Hero)
INSERT INTO public.banners (titulo, subtitulo, media_url, media_tipo, tipo_hero, efecto_overlay, activo, orden, badge_texto, cta_texto, cta_enlace, estadisticas_json)
VALUES 
(
  'Liderazgo que Transforma el Mercado', 
  'Impulsando la integridad, transparencia y el desarrollo del sector bursátil en México desde hace más de 40 años.', 
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop', 
  'image', 
  'fullscreen-image', 
  'pulse', 
  true, 
  0, 
  'AUTORIDAD BURSÁTIL', 
  'Conocer AMIB', 
  '/nosotros',
  '[{"valor": "40+", "label": "Años de historia"}, {"valor": "78", "label": "Instituciones"}]'
),
(
  'Certificación de Clase Mundial', 
  'Garantizamos la excelencia profesional de los participantes en el mercado de valores con estándares internacionales.', 
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop', 
  'image', 
  'split', 
  'matrix', 
  true, 
  1, 
  'CAPACITACIÓN ELITE', 
  'Ver Certificaciones', 
  '/certificaciones',
  '[{"valor": "15k+", "label": "Certificados"}, {"valor": "98%", "label": "Aprobación"}]'
),
(
  'El Pulso de los Mercados en Tiempo Real', 
  'Accede a indicadores, noticias y análisis técnico de vanguardia para la toma de decisiones estratégicas.', 
  'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070&auto=format&fit=crop', 
  'image', 
  'fullscreen-image', 
  'grain', 
  true, 
  2, 
  'MERCADO EN VIVO', 
  'Ir a Mercados', 
  '/mercados',
  '[{"valor": "500+", "label": "Emisoras"}, {"valor": "24/7", "label": "Monitoreo"}]'
);

-- 3. Noticias con Rich Media (Storytelling)
INSERT INTO public.noticias (titulo, resumen, contenido, categoria, imagen_url, video_url, slug, publicado, destacado, fecha_publicacion)
VALUES 
(
  'Convocatoria: Programa Talento Bursátil 2025', 
  'Abrimos convocatoria para el programa de becas y capacitación más importante del sector financiero en México.', 
  '# Formando a los líderes del futuro\n\nEl programa **Talento Bursátil** busca identificar a los mejores perfiles universitarios para integrarlos a las instituciones más importantes del país.\n\n## Beneficios del Programa\n* Certificación AMIB nivel 3 incluida.\n* Mentoría con directivos de casas de bolsa.\n* Pasantías remuneradas.\n\n![Finanzas](https://images.unsplash.com/photo-1454165833767-027ffea7025c?q=80&w=2070)\n\nInvitamos a todos los interesados a registrarse antes del 15 de mayo.', 
  'EDUCACION', 
  'https://images.unsplash.com/photo-1454165833767-027ffea7025c?q=80&w=2070&auto=format&fit=crop', 
  'https://www.youtube.com/watch?v=X8zLJlU_-60',
  'convocatoria-talento-bursatil-2025', 
  true, 
  true, 
  '2026-04-22'
),
(
  'Alianza Estratégica con la Bolsa de Valores de Madrid', 
  'AMIB firma convenio de colaboración para el intercambio tecnológico y normativo entre México y España.', 
  '# Fortaleciendo el puente trasatlántico\n\nEsta alianza permitirá a los asesores mexicanos acceder a mercados europeos con mayor facilidad.\n\n> "Este es un paso histórico para la internacionalización de nuestro mercado." - Presidente de AMIB.', 
  'INSTITUCIONAL', 
  'https://images.unsplash.com/photo-1579532566591-9302f311cc71?q=80&w=2070&auto=format&fit=crop', 
  NULL,
  'alianza-bolsa-madrid', 
  true, 
  false, 
  '2026-04-21'
),
(
  'Nuevos Estándares ESG para el Sector Bursátil', 
  'Se publican las directrices para la integración de factores ambientales, sociales y de gobernanza en inversiones.', 
  '# Inversión con Propósito\n\nLos nuevos estándares buscan alinear a México con las tendencias globales de sustentabilidad.', 
  'MERCADOS', 
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013&auto=format&fit=crop', 
  NULL,
  'estandares-esg-2025', 
  true, 
  false, 
  '2026-04-20'
);

-- 4. Eventos Destacados para el Slider
-- Primero limpiamos para evitar duplicados si ya existen
UPDATE public.eventos SET es_destacado = false;

INSERT INTO public.eventos (titulo, descripcion, fecha_inicio, ubicacion, modalidad, es_destacado, imagen_url)
VALUES 
(
  'Convención Bursátil AMIB 2026', 
  'El evento más importante del año donde se reúnen los líderes de la industria financiera mexicana.', 
  '2026-10-15 09:00:00', 
  'Cancún, Quintana Roo', 
  'presencial', 
  true, 
  'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069&auto=format&fit=crop'
),
(
  'Webinar: Criptoactivos y Regulación Fintech', 
  'Análisis profundo sobre el futuro de las criptomonedas en el marco legal mexicano.', 
  '2026-05-20 17:00:00', 
  'Plataforma Zoom', 
  'virtual', 
  true, 
  'https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?q=80&w=2069&auto=format&fit=crop'
),
(
  'Taller de Análisis Técnico Avanzado', 
  'Domina las herramientas de gráficas y patrones para trading profesional.', 
  '2026-06-12 10:00:00', 
  'Instalaciones AMIB, CDMX', 
  'presencial', 
  true, 
  'https://images.unsplash.com/photo-1611974714024-463ef9c742f9?q=80&w=2070&auto=format&fit=crop'
);
