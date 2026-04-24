'use client';

import React from 'react';
import { motion } from 'framer-motion';
import styles from '@/components/portal/portal.module.css';
import Link from 'next/link';

export function DashboardCertificado({ user, locale }: { user: any, locale: string }) {
  // ── Design tokens ────────────────────────────────────────
  const card  = { background: 'rgba(255,255,255,0.04)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.07)', padding: '1.5rem' };
  const gold  = 'var(--color-secondary-container, #EAAB00)';
  const navy  = '#060e1c';
  const text  = 'rgba(255,255,255,0.85)';
  const muted = 'rgba(255,255,255,0.4)';

  return (
    <div>
      {/* ── Welcome Banner ─────────────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.welcomeBanner}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className={styles.eyebrow}>Certificación Activa</div>
          <h1 className={styles.bannerTitle}>Hola, {user?.name?.split(' ')[0] || 'Profesional'}.</h1>
          <p style={{ opacity: 0.6, maxWidth: '560px', fontSize: '1rem', lineHeight: 1.7 }}>
            Aquí puedes consultar el estado de tu figura, el avance de tus puntos y acceder rápidamente a tu credencial digital y próximos eventos.
          </p>
          <div className={styles.bannerActions}>
            <Link href={`/${locale}/mi-cuenta/credencial`} style={{ textDecoration: 'none', background: gold, color: navy, border: 'none', padding: '0.8rem 1.75rem', borderRadius: '10px', fontWeight: 800, display: 'inline-block', fontSize: '0.9rem' }}>
              Ver Credencial Digital
            </Link>
            <Link href={`/${locale}/mi-cuenta/figura`} style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.06)', color: 'white', border: '1px solid rgba(255,255,255,0.12)', padding: '0.8rem 1.75rem', borderRadius: '10px', fontWeight: 600, display: 'inline-block', backdropFilter: 'blur(10px)', fontSize: '0.9rem' }}>
              Detalles de Figura →
            </Link>
          </div>
        </div>
        {/* Glow decoration */}
        <div style={{ position: 'absolute', top: '-20%', right: '-5%', width: '400px', height: '400px', background: `radial-gradient(circle, rgba(234,171,0,0.08) 0%, transparent 70%)`, borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-30%', left: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(10,80,160,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Puntos */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ ...card, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05, fontSize: '6rem' }}>🎯</div>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Puntos de Renovación</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 900, color: gold, lineHeight: 1 }}>120</span>
            <span style={{ fontSize: '1rem', color: muted, marginBottom: '0.3rem', fontWeight: 600 }}>/ 150</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ background: gold, height: '100%', width: '80%', borderRadius: '3px' }} />
          </div>
          <p style={{ fontSize: '0.75rem', color: muted, marginTop: '0.75rem' }}>Faltan 30 puntos para asegurar la renovación de tu figura.</p>
        </motion.div>

        {/* Estatus */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ ...card, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05, fontSize: '6rem' }}>🏅</div>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Figura Actual</h3>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: text, lineHeight: 1.3, marginBottom: '1rem' }}>
            Asesor en Estrategias de Inversión
          </div>
          <div style={{ display: 'inline-block', background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', padding: '0.3rem 0.75rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(34, 197, 94, 0.2)' }}>
            Vigente
          </div>
        </motion.div>

        {/* Vigencia */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ ...card, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05, fontSize: '6rem' }}>⏳</div>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Vigencia</h3>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: text, marginBottom: '0.2rem' }}>
            Octubre 2027
          </div>
          <p style={{ fontSize: '0.85rem', color: gold, fontWeight: 600 }}>Expira en 18 meses</p>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
        {/* Próximos Eventos */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: text }}>Próximos Eventos AMIB</h3>
            <Link href={`/${locale}/mi-cuenta/mis-eventos`} style={{ fontSize: '0.75rem', color: gold, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em', textDecoration: 'none' }}>Ver Todos →</Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              { date: 'NOV 12', title: 'Congreso Anual de Inversiones 2026', type: 'Presencial', status: 'Registrado' },
              { date: 'DIC 05', title: 'Webinar: Cambios en Ley del Mercado', type: 'Virtual', status: 'Inscripciones Abiertas' }
            ].map((evento, i) => (
              <div key={i} style={{ ...card, display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ background: `rgba(234,171,0,0.08)`, border: `1px solid rgba(234,171,0,0.2)`, padding: '0.75rem', borderRadius: '12px', textAlign: 'center', minWidth: '64px' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700, color: gold, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{evento.date.split(' ')[0]}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: gold, lineHeight: 1, marginTop: '0.1rem' }}>{evento.date.split(' ')[1]}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: text, fontSize: '0.95rem' }}>{evento.title}</div>
                  <div style={{ fontSize: '0.8rem', color: muted, marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ padding: '0.1rem 0.4rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>{evento.type}</span>
                    {evento.status === 'Registrado' ? (
                        <span style={{ color: '#4ade80', fontWeight: 600 }}>✓ Registrado</span>
                    ) : (
                        <span style={{ color: gold, fontWeight: 600 }}>{evento.status}</span>
                    )}
                  </div>
                </div>
                <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', color: muted }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cursos / Capacitaciones recomendadas */}
        <div style={{ ...card, padding: '1.75rem', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ width: '36px', height: '36px', background: 'rgba(234,171,0,0.12)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: gold }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
            </div>
            <h3 style={{ fontWeight: 800, fontSize: '1rem', color: text }}>Gana Puntos</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[
              { title: 'Ética Bursátil Avanzada', pts: '+20 Pts', type: 'Curso Online' },
              { title: 'Actualización Normativa Q3', pts: '+15 Pts', type: 'Seminario' },
            ].map((c, i) => (
              <div key={i} style={{ paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 800, color: gold, background: 'rgba(234,171,0,0.1)', border: '1px solid rgba(234,171,0,0.2)', padding: '0.1rem 0.45rem', borderRadius: '4px', letterSpacing: '0.06em' }}>{c.type}</span>
                  <span style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: 800 }}>{c.pts}</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: text, marginBottom: '0.35rem', lineHeight: 1.45 }}>{c.title}</div>
              </div>
            ))}
          </div>

          <button style={{ width: '100%', marginTop: '0.5rem', background: 'rgba(234,171,0,0.08)', border: '1px solid rgba(234,171,0,0.2)', padding: '0.875rem', borderRadius: '10px', color: gold, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', letterSpacing: '0.03em' }}>
            Ver Catálogo de Cursos →
          </button>
        </div>
      </div>
    </div>
  );
}
