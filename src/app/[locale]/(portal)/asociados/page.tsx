'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { FullBleedHero } from '@/components/ui/branding/FullBleedHero';
import { MarketBar } from '@/components/ui/branding/MarketBar';

const PILARES = [
  {
    tag: '01',
    title: 'Representación Estratégica',
    desc: 'Interlocución proactiva ante la CNBV, BANXICO y la SHCP para el desarrollo de políticas públicas que fortalezcan la competitividad del mercado de valores.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    tag: '02',
    title: 'Liderazgo en Normatividad',
    desc: 'Participación activa en la definición de estándares de autorregulación y mejores prácticas que garantizan la integridad y transparencia del mercado.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    tag: '03',
    title: 'Relaciones Globales',
    desc: 'Conexión con organismos financieros internacionales como IOSCO, ANNA y gremios latinoamericanos para promover mejores prácticas a escala mundial.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
];

const INFORMES = [
  { year: '2024', titulo: 'Gestión Bursátil 2024', desc: 'Análisis del mercado de valores, resiliencia institucional y nuevos estándares de autorregulación.', gradient: 'linear-gradient(135deg, #0a1628 0%, #1B365F 60%, #002048 100%)', accent: '#EAAB00' },
  { year: '2023', titulo: 'Consolidación 2023', desc: 'Reporte de sostenibilidad financiera y crecimiento de los participantes del mercado de valores.', gradient: 'linear-gradient(135deg, #0d1f3c 0%, #163254 60%, #0a1628 100%)', accent: '#c8920a' },
  { year: '2022', titulo: 'Transición Digital 2022', desc: 'Iniciativas de digitalización del mercado y protocolos de ciberseguridad para instituciones.', gradient: 'linear-gradient(135deg, #0f1e38 0%, #1a2e50 60%, #0d1a30 100%)', accent: '#a07808' },
  { year: '2021', titulo: 'Resiliencia 2021', desc: 'Impacto post-pandemia y estrategias de reactivación del sector bursátil mexicano.', gradient: 'linear-gradient(135deg, #0c1a30 0%, #162840 60%, #0a1520 100%)', accent: '#8a6606' },
];

const STATS = [
  { value: '35+', label: 'Años de historia gremial' },
  { value: '40+', label: 'Casas de Bolsa asociadas' },
  { value: '100%', label: 'Del mercado bursátil MX' },
  { value: '3', label: 'Líneas de operación regulatoria' },
];

const SERVICIOS = [
  { title: 'Circulares y normativa', desc: 'Acceso a toda la normativa gremial vigente y archivo histórico de circulares.' },
  { title: 'Comités técnicos', desc: 'Participación en comités de operaciones, riesgo, tecnología y cumplimiento.' },
  { title: 'Formación continua', desc: 'Programas de capacitación exclusivos para directivos y áreas operativas.' },
  { title: 'Inteligencia de mercado', desc: 'Estudios, estadísticas y análisis del sector producidos por el equipo técnico AMIB.' },
];

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: 'easeOut' as const },
  }),
};

function TiltCard({ informe, featured = false }: { informe: typeof INFORMES[0]; featured?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); x.set(0); y.set(0); }}
      style={{
        rotateX, rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
        borderRadius: featured ? 24 : 16,
        background: informe.gradient,
        border: `1px solid ${hovered ? informe.accent + '55' : 'rgba(255,255,255,0.08)'}`,
        padding: featured ? '3rem 2.5rem' : '1.75rem',
        boxShadow: hovered
          ? `0 30px 60px rgba(0,0,0,0.5), 0 0 40px ${informe.accent}22`
          : '0 10px 30px rgba(0,0,0,0.3)',
        cursor: 'default',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: featured ? 340 : 220,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow top-right */}
      <div style={{
        position: 'absolute', top: -60, right: -60,
        width: 200, height: 200, borderRadius: '50%',
        background: `radial-gradient(circle, ${informe.accent}18, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Grid lines decoration */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.06,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'inline-block',
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.25em',
          textTransform: 'uppercase', color: informe.accent,
          border: `1px solid ${informe.accent}44`,
          padding: '0.25rem 0.65rem', borderRadius: 100,
          marginBottom: '1.5rem',
        }}>
          Informe Anual AMIB
        </div>

        <div style={{
          fontFamily: 'ui-monospace, monospace',
          fontSize: featured ? 'clamp(3.5rem, 6vw, 5rem)' : '2.75rem',
          fontWeight: 800,
          color: informe.accent,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          marginBottom: '0.5rem',
        }}>
          {informe.year}
        </div>

        {featured && (
          <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            {informe.titulo}
          </div>
        )}

        {!featured && (
          <div style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            {informe.titulo}
          </div>
        )}

        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', lineHeight: 1.6 }}>
          {informe.desc}
        </p>
      </div>

      <motion.button
        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        style={{
          position: 'relative', zIndex: 1,
          marginTop: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(255,255,255,0.06)',
          border: `1px solid ${informe.accent}33`,
          color: informe.accent,
          padding: featured ? '0.8rem 1.5rem' : '0.6rem 1.1rem',
          borderRadius: 100,
          fontSize: featured ? '0.85rem' : '0.75rem',
          fontWeight: 700, cursor: 'pointer',
          width: 'fit-content',
          backdropFilter: 'blur(8px)',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
        {featured ? 'Descargar PDF 2024' : 'Descargar PDF'}
      </motion.button>
    </motion.div>
  );
}

export default function AsociadosPage() {
  return (
    <main>
      {/* ── Hero ────────────────────────────────────────────────── */}
      <FullBleedHero
        title="Unidos por la Integridad del Mercado"
        subtitle="Representamos y fortalecemos al gremio de Casas de Bolsa en México, impulsando estándares de excelencia, sana competencia y una voz unificada ante los reguladores."
        accent="var(--color-secondary-container)"
      >
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem' }}>
          <button style={{
            background: 'var(--color-secondary-container)',
            color: 'var(--color-primary)',
            padding: '0.9rem 2rem',
            borderRadius: '100px',
            fontWeight: 700,
            border: 'none',
            fontSize: '0.9rem',
            cursor: 'pointer',
            letterSpacing: '0.02em',
          }}>
            Beneficios de Socio
          </button>
          <button style={{
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.9)',
            padding: '0.9rem 2rem',
            borderRadius: '100px',
            fontWeight: 600,
            border: '1px solid rgba(255,255,255,0.15)',
            fontSize: '0.9rem',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
          }}>
            Autorregulación →
          </button>
        </div>
      </FullBleedHero>

      {/* ── Stats strip ─────────────────────────────────────────── */}
      <section style={{
        background: 'var(--color-primary)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '3rem 5%',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem' }}>
          {STATS.map((s, i) => (
            <motion.div key={i} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }} variants={reveal}
              style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, color: 'var(--color-secondary-container)', letterSpacing: '-0.03em' }}>
                {s.value}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.4rem' }}>
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Pilares ─────────────────────────────────────────────── */}
      <section style={{ background: 'var(--color-primary)', padding: '7rem 5%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            style={{ marginBottom: '4rem' }}>
            <div style={{ color: 'var(--color-secondary-container)', fontWeight: 700, letterSpacing: '0.3em', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Pilares del gremio
            </div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', maxWidth: '600px', lineHeight: 1.1 }}>
              El valor de pertenecer al gremio líder
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {PILARES.map((p, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={reveal}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                style={{
                  padding: '2.25rem',
                  borderRadius: '20px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(12px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  cursor: 'default',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    width: 52, height: 52,
                    borderRadius: 14,
                    background: 'rgba(234,171,0,0.1)',
                    border: '1px solid rgba(234,171,0,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-secondary-container)',
                  }}>
                    {p.icon}
                  </div>
                  <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', fontWeight: 700 }}>
                    {p.tag}
                  </span>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.6rem', letterSpacing: '-0.01em' }}>
                    {p.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>
                    {p.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sinergia institucional ───────────────────────────────── */}
      <section style={{ background: 'var(--color-primary-container)', padding: '7rem 5%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div style={{ color: 'var(--color-secondary-container)', fontWeight: 700, letterSpacing: '0.3em', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '1rem' }}>
                Sinergia Institucional
              </div>
              <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1.1, marginBottom: '1.5rem' }}>
                Un ecosistema que trabaja para sus miembros
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, fontSize: '1rem', marginBottom: '2rem' }}>
                Fomentamos un ambiente de cooperación técnica y sana competencia que beneficia a todos los participantes del mercado bursátil mexicano — desde la operación diaria hasta la estrategia de largo plazo.
              </p>
              <button style={{
                background: 'var(--color-secondary-container)',
                color: 'var(--color-primary)',
                padding: '0.9rem 2rem',
                borderRadius: '100px',
                fontWeight: 700,
                border: 'none',
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}>
                Consultar Directorio →
              </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {SERVICIOS.map((s, i) => (
                <motion.div key={i} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }} variants={reveal}
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderRadius: '14px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    display: 'flex',
                    gap: '1.25rem',
                    alignItems: 'flex-start',
                  }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-secondary-container)', marginTop: '0.45rem', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{s.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', lineHeight: 1.55 }}>{s.desc}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Sala de Transparencia ───────────────────────────── */}
      <section style={{ background: 'var(--color-primary)', padding: '7rem 5%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '3.5rem' }}
          >
            <div>
              <div style={{ color: 'var(--color-secondary-container)', fontWeight: 700, letterSpacing: '0.3em', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '1rem' }}>
                Transparencia Institucional
              </div>
              <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1.1 }}>
                Repositorio de Informes Anuales
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '0.75rem', maxWidth: 520, lineHeight: 1.6 }}>
                Nuestro compromiso con la transparencia es el pilar de la confianza regulatoria. Ponemos a disposición nuestra trayectoria de gestión, resultados y avances estratégicos.
              </p>
            </div>
            <button style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.7)', padding: '0.75rem 1.5rem',
              borderRadius: 100, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}>
              Ver todos los informes →
            </button>
          </motion.div>

          {/* Featured + grid layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', alignItems: 'start' }}>

            {/* Featured 2024 — left, full height */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.55 }}
            >
              <TiltCard informe={INFORMES[0]} featured />
            </motion.div>

            {/* 3 historical cards — right column grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {INFORMES.slice(1).map((informe, i) => (
                <motion.div
                  key={informe.year}
                  initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.08 }}
                >
                  <TiltCard informe={informe} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <MarketBar />
    </main>
  );
}
