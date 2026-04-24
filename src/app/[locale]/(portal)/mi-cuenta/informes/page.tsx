import React from 'react';
import InformesClient from './InformesClient';
import { getInformes, type Informe } from '@/lib/supabase/server';

const fallbackInformes: Informe[] = [
  { 
    id: '2024-anual', 
    titulo: 'Gestión Bursátil 2024', 
    categoria: 'anual', 
    fecha_periodo: 'Marzo 2024', 
    descripcion: 'Análisis detallado del mercado de valores, resiliencia institucional y nuevos protocolos operativos.',
    portada_url: '/assets/portal/informe_2024.png',
    archivo_url: '#',
    orden: 1,
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: '2023-anual', 
    titulo: 'Consolidación 2023', 
    categoria: 'anual', 
    fecha_periodo: 'Marzo 2023', 
    descripcion: 'Reporte de sostenibilidad financiera y crecimiento de la infraestructura del mercado mexicano.',
    portada_url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=400&q=80',
    archivo_url: '#',
    orden: 2,
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: '2022-anual', 
    titulo: 'Transición Digital 2022', 
    categoria: 'anual', 
    fecha_periodo: 'Marzo 2022', 
    descripcion: 'Iniciativas de digitalización del mercado y protocolos de ciberseguridad financiera.',
    portada_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80',
    archivo_url: '#',
    orden: 3,
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: 'q4-2023', 
    titulo: 'Reporte Trimestral Q4', 
    categoria: 'trimestral', 
    fecha_periodo: 'Dic 2023', 
    descripcion: 'Cierre del ciclo anual y proyecciones para el mercado de renta variable.',
    portada_url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=400&q=80',
    archivo_url: '#',
    orden: 4,
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
];

export const metadata = {
  title: 'Informes Anuales | AMIB',
  description: 'Repositorio de informes anuales y reportes trimestrales de la AMIB.',
};

export default async function InformesPage() {
  const dbInformes = await getInformes();
  
  // Usar fallback si la base de datos aún no tiene la migración
  const informes = dbInformes.length > 0 ? dbInformes : fallbackInformes;

  return (
    <InformesClient informes={informes} />
  );
}
