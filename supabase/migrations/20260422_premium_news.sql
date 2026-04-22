-- Migration: 4 Premium News with Generated Images
-- Date: 2026-04-22

-- Limpiar noticias previas para que estas sean las principales
TRUNCATE public.noticias CASCADE;

INSERT INTO public.noticias (titulo, resumen, contenido, categoria, imagen_url, video_url, slug, publicado, destacado, fecha_publicacion)
VALUES 
(
  'Innovación Digital: El Futuro de los Mercados Bursátiles', 
  'Exploramos cómo la inteligencia artificial y el blockchain están redefiniendo la eficiencia en las operaciones financieras globales.', 
  '# La Transformación Digital en México\n\nEl mercado de valores no es ajeno a la revolución tecnológica. La implementación de algoritmos de alta frecuencia y contratos inteligentes está permitiendo una transparencia sin precedentes.\n\n## Puntos Clave\n* **Eficiencia Operativa**: Reducción de tiempos de liquidación.\n* **Seguridad**: Criptografía avanzada para proteger activos.\n* **Accesibilidad**: Nuevas plataformas para inversores minoristas.\n\n> "La tecnología no es solo una herramienta, es el nuevo cimiento de la confianza financiera."', 
  'EDUCACION', 
  '/assets/news/innovacion.png', 
  'https://assets.mixkit.co/videos/preview/mixkit-stock-market-data-on-a-monitor-screen-21448-large.mp4',
  'innovacion-digital-futuro-mercados', 
  true, 
  true, 
  '2026-04-22'
),
(
  'Criterios ESG: Liderando la Inversión Sustentable', 
  'AMIB reafirma su compromiso con el medio ambiente y la responsabilidad social mediante nuevas directrices para emisoras.', 
  '# Invertir con Conciencia Ambiental\n\nLos criterios ESG (Environmental, Social, and Governance) se han vuelto el estándar de oro para los inversores institucionales.\n\n## Nuestra Estrategia\n1. **Monitoreo de Carbono**: Evaluación de huella ecológica.\n2. **Equidad**: Fomentar la diversidad en consejos de administración.\n3. **Ética**: Gobernanza transparente y anticorrupción.\n\n![Sustentabilidad](/assets/news/sustentabilidad.png)', 
  'INSTITUCIONAL', 
  '/assets/news/sustentabilidad.png', 
  NULL,
  'criterios-esg-inversion-sustentable', 
  true, 
  true, 
  '2026-04-22'
),
(
  'Certificación AMIB: Excelencia en la Asesoría Financiera', 
  'Conoce los nuevos módulos de ética y cumplimiento que integran el proceso de certificación para este 2025.', 
  '# Elevando el Estándar Profesional\n\nLa confianza del inversionista depende de la capacidad y ética de su asesor. Por ello, hemos robustecido nuestros exámenes de certificación.\n\n## ¿Qué hay de nuevo?\n* Casos prácticos de dilemas éticos.\n* Actualización en normatividad internacional.\n* Evaluación continua mediante plataformas digitales.', 
  'PRENSA', 
  '/assets/news/certificacion.png', 
  NULL,
  'certificacion-amib-excelencia-asesoria', 
  true, 
  true, 
  '2026-04-22'
),
(
  'Análisis de Mercados 2025: Perspectivas y Oportunidades', 
  'Presentamos el informe semestral de proyecciones económicas para el mercado bursátil mexicano y global.', 
  '# Panorama Económico 2025\n\nA pesar de la volatilidad global, el mercado mexicano presenta oportunidades sólidas en sectores de infraestructura y tecnología.\n\n## Resumen del Informe\n* **Crecimiento Estimado**: 2.4% para el sector bursátil local.\n* **Tasas de Interés**: Proyección de ajustes a la baja.\n* **Nearshoring**: El motor de la inversión extranjera.', 
  'MERCADOS', 
  '/assets/news/analisis.png', 
  'https://assets.mixkit.co/videos/preview/mixkit-financial-district-at-night-with-light-trails-2334-large.mp4',
  'analisis-mercados-2025-perspectivas', 
  true, 
  true, 
  '2026-04-22'
);
