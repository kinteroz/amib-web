'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '@/components/portal/portal.module.css';

interface Informe {
  id: string;
  titulo: string;
  categoria: 'anual' | 'trimestral' | 'especial';
  fecha: string;
  descripcion: string;
  portada: string;
  url: string;
}

const informesData: Informe[] = [
  { 
    id: '2024-anual', 
    titulo: 'Gestión Bursátil 2024', 
    categoria: 'anual', 
    fecha: 'Marzo 2024', 
    descripcion: 'Análisis detallado del mercado de valores, resiliencia institucional y nuevos protocolos operativos.',
    portada: '/assets/portal/informe_2024.png',
    url: '#' 
  },
  { 
    id: '2023-anual', 
    titulo: 'Consolidación 2023', 
    categoria: 'anual', 
    fecha: 'Marzo 2023', 
    descripcion: 'Reporte de sostenibilidad financiera y crecimiento de la infraestructura del mercado mexicano.',
    portada: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=400&q=80',
    url: '#' 
  },
  { 
    id: '2022-anual', 
    titulo: 'Transición Digital 2022', 
    categoria: 'anual', 
    fecha: 'Marzo 2022', 
    descripcion: 'Iniciativas de digitalización del mercado y protocolos de ciberseguridad financiera.',
    portada: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80',
    url: '#' 
  },
  { 
    id: '2021-anual', 
    titulo: 'Resiliencia 2021', 
    categoria: 'anual', 
    fecha: 'Marzo 2021', 
    descripcion: 'Impacto post-pandemia y estrategias de reactivación del sector bursátil en México.',
    portada: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80',
    url: '#' 
  },
  { 
    id: 'q4-2023', 
    titulo: 'Reporte Trimestral Q4', 
    categoria: 'trimestral', 
    fecha: 'Dic 2023', 
    descripcion: 'Cierre del ciclo anual y proyecciones para el mercado de renta variable.',
    portada: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=400&q=80',
    url: '#' 
  },
];

export default function InformesPage() {
  const [filter, setFilter] = useState<'todos' | 'anual' | 'trimestral' | 'especial'>('todos');

  const filteredInformes = informesData.filter(inf => 
    filter === 'todos' || inf.categoria === filter
  );

  const featuredInforme = informesData[0]; // El 2024 es el destacado

  return (
    <div className={styles.informesWrapper}>
      {/* ── SECTION HERO: Destacado ────────────────────────── */}
      <section className={styles.informesHero}>
        <div className={styles.heroContent}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ 
              background: 'var(--color-secondary-container)', 
              color: '#060e1c', 
              fontSize: '0.65rem', 
              fontWeight: 800, 
              padding: '0.25rem 0.75rem', 
              borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Transparencia Institucional
            </span>
          </div>
          <h1 className={styles.heroTitle}>
            Repositorio de <span style={{ color: 'var(--color-secondary-container)' }}>Informes Anuales</span>
          </h1>
          <p className={styles.heroDesc}>
            En la Asociación Mexicana de Instituciones Bursátiles (AMIB), nuestro compromiso con la transparencia es el pilar fundamental de la confianza regulatoria. Ponemos a disposición de nuestros asociados la trayectoria de gestión y resultados estratégicos.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
            <button style={{ 
              background: 'var(--color-primary-container)', 
              color: 'white', 
              border: '1px solid rgba(255,255,255,0.1)', 
              padding: '0.875rem 1.75rem', 
              borderRadius: '12px', 
              fontWeight: 800, 
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              cursor: 'pointer'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              Último Informe (2024)
            </button>
            </div>
          </div>

        {/* Portada Destacada 3D Effect */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className={styles.featuredCover}
        >
          <div className={styles.bookWrapper}>
            <Image 
              src={featuredInforme.portada} 
              alt={featuredInforme.titulo} 
              width={320} 
              height={400} 
              className={styles.bookCover}
              priority
            />
            <div className={styles.bookOverlay}>
              {/* Overlay minimalista para efectos de luz, sin texto duplicado */}
              <div className={styles.bookShineOverlay}></div>
            </div>
            {/* Spine detail */}
            <div className={styles.bookSpine}></div>
          </div>
        </motion.div>
      </section>

      {/* ── SECTION SECONDARY: Histórico ──────────────────── */}
      <section style={{ marginTop: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem' }}>Histórico de Publicaciones</h2>
            <div style={{ width: '60px', height: '4px', background: 'var(--color-secondary-container)', borderRadius: '2px' }}></div>
          </div>

          {/* Filtros */}
          <div className={styles.filterGroup}>
            {(['todos', 'anual', 'trimestral', 'especial'] as const).map((cat) => (
              <button 
                key={cat}
                onClick={() => setFilter(cat)}
                className={`${styles.filterBtn} ${filter === cat ? styles.filterBtnActive : ''}`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.reportGrid}>
          <AnimatePresence mode="popLayout">
            {filteredInformes.map((inf) => (
              <motion.div 
                layout
                key={inf.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={styles.reportCard}
              >
                <div className={styles.cardImageInner}>
                  <Image src={inf.portada} alt={inf.titulo} fill style={{ objectFit: 'cover' }} />
                  {/* Badge del Año */}
                  <div className={styles.yearBadge}>
                    {inf.fecha.split(' ')[1] || inf.fecha}
                  </div>
                  {/* Solo un gradiente sutil, sin texto que tape la imagen principal */}
                  <div className={styles.cardGlassOverlay} />
                </div>
                
                <div className={styles.cardData}>
                  <h3 className={styles.reportCardTitle}>{inf.titulo}</h3>
                  <p className={styles.reportCardDesc}>{inf.descripcion}</p>
                  
                  <button className={styles.downloadReportBtn}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                    Descargar PDF
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Deco glow */}
      <div style={{ 
        position: 'fixed', bottom: '-10%', left: '-5%', width: '60vw', height: '60vw', 
        background: 'radial-gradient(circle, rgba(10,80,160,0.08) 0%, transparent 70%)', 
        pointerEvents: 'none', zIndex: -1 
      }} />
    </div>
  );
}
