import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan variables de entorno en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const banners = [
  {
    orden: 0,
    activo: true,
    tipo_hero: 'fullscreen-image',
    efecto_overlay: 'matrix',
    media_url: '/images/hero/leadership.png',
    media_tipo: 'image',
    badge_texto: 'AUTORIDAD BURSÁTIL',
    titulo: 'Liderazgo en el Mercado de Valores',
    subtitulo: 'Impulsando la integridad, transparencia y el desarrollo del sector bursátil en México desde hace más de 40 años.',
    cta_texto: 'Conocer AMIB',
    cta_enlace: '/nosotros',
    estadisticas_json: [
      { valor: '40+', label: 'Años de historia' },
      { valor: '78', label: 'Instituciones' }
    ]
  },
  {
    orden: 1,
    activo: true,
    tipo_hero: 'fullscreen-video',
    efecto_overlay: 'pulse',
    media_url: 'https://bqwcfjxtmbgjynoscxjx.supabase.co/storage/v1/object/public/hero-media/18743334-hd_1920_1080_60fps.mp4',
    media_tipo: 'video',
    badge_texto: 'EXCELENCIA PROFESIONAL',
    titulo: 'Certificación de Clase Mundial',
    subtitulo: 'Garantizamos la capacidad técnica y ética de los profesionales del mercado con estándares globales de autorregulación.',
    cta_texto: 'Ver Certificaciones',
    cta_enlace: '/certificaciones',
    estadisticas_json: [
      { valor: '45K+', label: 'Certificados' },
      { valor: '12', label: 'Programas' }
    ]
  }
];

async function seed() {
  console.log('Iniciando carga de slides...');
  
  const titles = banners.map(b => b.titulo);
  
  // Eliminar banners previos con los mismos títulos para evitar duplicados visuales
  await supabase.from('banners').delete().in('titulo', titles);

  const { data, error } = await supabase
    .from('banners')
    .insert(banners);

  if (error) {
    console.error('Error al insertar:', error);
  } else {
    console.log('Slides cargados exitosamente!');
  }
}

seed();
