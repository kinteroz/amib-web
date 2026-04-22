'use client';

import React from 'react';
import styles from '@/components/portal/portal.module.css';

export default function DashboardPage() {
  const circulares = [
    { title: 'Circular Única de Emisoras: Actualización en Requisitos...', source: 'CNBV', time: 'Hoy, 09:12 AM', type: 'PDF (1.2MB)' },
    { title: 'Nuevas Disposiciones de Ética Profesional para Operadores...', source: 'AMIB', time: 'Ayer, 4:45 PM', type: 'DOCX (0.8MB)' },
    { title: 'Reforma a la Ley del Mercado de Valores y Ley de Sociedades...', source: 'CNBV', time: 'Oct 20, 2024', type: 'PDF (4.5MB)' },
  ];

  // ── Design tokens ────────────────────────────────────────
  const card  = { background: 'rgba(255,255,255,0.04)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.07)', padding: '1.25rem' };
  const cardHover = { transition: 'border-color 0.2s' };
  const gold  = 'var(--color-secondary-container, #EAAB00)';
  const navy  = '#060e1c';
  const text  = 'rgba(255,255,255,0.85)';
  const muted = 'rgba(255,255,255,0.4)';

  return (
    <div>
      {/* ── Welcome Banner ─────────────────────────────────── */}
      <div className={styles.welcomeBanner}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className={styles.eyebrow}>Ciclo Q4-2024</div>
          <h1 className={styles.bannerTitle}>Bienvenido de nuevo, Asociado.</h1>
          <p style={{ opacity: 0.6, maxWidth: '560px', fontSize: '1rem', lineHeight: 1.7 }}>
            Explore las últimas actualizaciones normativas y el calendario de sesiones para el ciclo actual.
          </p>
          <div className={styles.bannerActions}>
            <button style={{ background: gold, color: navy, border: 'none', padding: '0.8rem 1.75rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem' }}>
              Consultar Mi Perfil
            </button>
            <button style={{ background: 'rgba(255,255,255,0.06)', color: 'white', border: '1px solid rgba(255,255,255,0.12)', padding: '0.8rem 1.75rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(10px)', fontSize: '0.9rem' }}>
              Ver Circulares →
            </button>
          </div>
        </div>
        {/* Glow decoration */}
        <div style={{ position: 'absolute', top: '-20%', right: '-5%', width: '400px', height: '400px', background: `radial-gradient(circle, rgba(234,171,0,0.08) 0%, transparent 70%)`, borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-30%', left: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(10,80,160,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>

        {/* ── Left Col ──────────────────────────────────────── */}
        <div>
          {/* Próximas Sesiones */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: text }}>Próximas Sesiones de Comité</h3>
            <span style={{ fontSize: '0.75rem', color: gold, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em' }}>Ver Calendario →</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              { date: 'OCT 24', title: 'Comité de Vigilancia y Ética', time: '10:00 AM — Sala B-302' },
              { date: 'OCT 28', title: 'Subcomité de Renta Variable', time: '11:30 AM — Videollamada' }
            ].map((sesion, i) => (
              <div key={i} style={{ ...card, display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                {/* Date badge */}
                <div style={{ background: `rgba(234,171,0,0.08)`, border: `1px solid rgba(234,171,0,0.2)`, padding: '0.75rem', borderRadius: '12px', textAlign: 'center', minWidth: '64px' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700, color: gold, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{sesion.date.split(' ')[0]}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: gold, lineHeight: 1, marginTop: '0.1rem' }}>{sesion.date.split(' ')[1]}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: text, fontSize: '0.95rem' }}>{sesion.title}</div>
                  <div style={{ fontSize: '0.8rem', color: muted, marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    {sesion.time}
                  </div>
                </div>
                <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', color: muted }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginTop: '2rem' }}>
            {/* Biblioteca Normativa */}
            <div style={{ background: `linear-gradient(135deg, ${navy} 0%, #0d1f3c 100%)`, borderRadius: '20px', padding: '2rem', color: 'white', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: `radial-gradient(circle, rgba(234,171,0,0.08), transparent 70%)` }} />
              <div style={{ background: 'rgba(234,171,0,0.12)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: gold }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>Biblioteca Normativa</h4>
              <p style={{ fontSize: '0.82rem', color: muted, marginBottom: '1.25rem', lineHeight: 1.55 }}>Acceso centralizado a las Normas de Autorregulación vigentes.</p>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: gold, cursor: 'pointer' }}>Explorar ahora →</span>
            </div>

            {/* Soporte Técnico */}
            <div style={{ background: 'linear-gradient(135deg, rgba(234,171,0,0.12) 0%, rgba(120,80,0,0.2) 100%)', borderRadius: '20px', padding: '2rem', color: 'white', border: '1px solid rgba(234,171,0,0.15)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(234,171,0,0.1), transparent 70%)' }} />
              <div style={{ background: 'rgba(234,171,0,0.15)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: gold }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>Soporte Técnico</h4>
              <p style={{ fontSize: '0.82rem', color: muted, marginBottom: '1.25rem', lineHeight: 1.55 }}>¿Problemas con el portal o sus accesos? Nuestro equipo está listo.</p>
              <button style={{ background: 'rgba(234,171,0,0.15)', border: '1px solid rgba(234,171,0,0.25)', padding: '0.6rem 1.1rem', borderRadius: '8px', color: gold, fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}>
                Contactar →
              </button>
            </div>
          </div>
        </div>

        {/* ── Right Col: Circulares ──────────────────────────── */}
        <div style={{ ...card, padding: '1.75rem', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ width: '36px', height: '36px', background: 'rgba(234,171,0,0.12)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: gold }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
            </div>
            <h3 style={{ fontWeight: 800, fontSize: '1rem', color: text }}>Circulares Recientes</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {circulares.map((c, i) => (
              <div key={i} style={{ paddingBottom: i < circulares.length - 1 ? '1.5rem' : 0, borderBottom: i < circulares.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 800, color: gold, background: 'rgba(234,171,0,0.1)', border: '1px solid rgba(234,171,0,0.2)', padding: '0.1rem 0.45rem', borderRadius: '4px', letterSpacing: '0.06em' }}>{c.source}</span>
                  <span style={{ fontSize: '0.68rem', color: muted }}>{c.time}</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: text, marginBottom: '0.35rem', lineHeight: 1.45 }}>{c.title}</div>
                <div style={{ fontSize: '0.68rem', color: muted, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  {c.type}
                </div>
              </div>
            ))}
          </div>

          <button style={{ width: '100%', marginTop: '2rem', background: 'rgba(234,171,0,0.08)', border: '1px solid rgba(234,171,0,0.2)', padding: '0.875rem', borderRadius: '10px', color: gold, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', letterSpacing: '0.03em' }}>
            Ver Repositorio Histórico →
          </button>
        </div>

      </div>
    </div>
  );
}
