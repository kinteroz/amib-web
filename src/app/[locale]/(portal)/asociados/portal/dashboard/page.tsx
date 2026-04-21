'use client';

import React from 'react';
import styles from '@/components/portal/portal.module.css';

export default function DashboardPage() {
  const circulares = [
    { title: 'Circular Única de Emisoras: Actualización en Requisitos...', source: 'CNBV', time: 'Hoy, 09:12 AM', type: 'PDF (1.2MB)' },
    { title: 'Nuevas Disposiciones de Ética Profesional para Operadores...', source: 'AMIB', time: 'Ayer, 4:45 PM', type: 'DOCX (0.8MB)' },
    { title: 'Reforma a la Ley del Mercado de Valores y Ley de Sociedades...', source: 'CNBV', time: 'Oct 20, 2024', type: 'PDF (4.5MB)' },
  ];

  return (
    <div>
      {/* Welcome Section */}
      <div className={styles.welcomeBanner}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className={styles.eyebrow} style={{ color: 'var(--color-secondary-container)' }}>Ciclo Q4-2024</div>
          <h1 className={styles.bannerTitle}>Bienvenido de nuevo, Asociado.</h1>
          <p style={{ opacity: 0.8, maxWidth: '600px', fontSize: '1.1rem' }}>
            Explore las últimas actualizaciones normativas y el calendario de sesiones para el ciclo actual.
          </p>
          <div className={styles.bannerActions}>
            <button style={{ background: 'var(--color-secondary-container)', color: '#0a1628', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
              Consultar Mi Perfil
            </button>
            <button style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '0.8rem 1.5rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
              Ver Circulares
            </button>
          </div>
        </div>
        {/* Abstract background shape */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(234,171,0,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
        
        {/* Left Col: Sessions */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.2rem' }}>Próximas Sesiones de Comité</h3>
            <span style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 700, cursor: 'pointer' }}>Ver Calendario Completo</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { date: 'OCT 24', title: 'Comité de Vigilancia y Ética', time: '10:00 AM — Sala B-302' },
              { date: 'OCT 28', title: 'Subcomité de Renta Variable', time: '11:30 AM — Videollamada' }
            ].map((sesion, i) => (
              <div key={i} style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1.5rem', border: '1px solid #e2e8f0' }}>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '12px', textAlign: 'center', minWidth: '70px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b' }}>{sesion.date.split(' ')[0]}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{sesion.date.split(' ')[1]}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>{sesion.title}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    {sesion.time}
                  </div>
                </div>
                <button style={{ background: '#f1f5f9', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2.5rem' }}>
            <div style={{ background: '#0a1628', borderRadius: '20px', padding: '2rem', color: 'white' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>Biblioteca Normativa</h4>
              <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '1.5rem' }}>Acceso centralizado a las Normas de Autorregulación vigentes.</p>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-secondary-container)', cursor: 'pointer' }}>Explorar ahora →</span>
            </div>
            <div style={{ background: '#7a5b00', borderRadius: '20px', padding: '2rem', color: 'white' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>Soporte Técnico Especializado</h4>
              <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '1.5rem' }}>¿Problemas con el portal o sus accesos? Nuestro equipo técnico está listo.</p>
              <button style={{ background: 'rgba(255,255,255,0.2)', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '10px', color: 'white', fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
                Contactar Soporte
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Circulares */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
             <div style={{ width: '36px', height: '36px', background: '#fef3c7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309' }}>
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
             </div>
             <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Circulares Recientes</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {circulares.map((c, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#2563eb', background: '#dbeafe', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{c.source}</span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{c.time}</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem', lineHeight: 1.4 }}>{c.title}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                  {c.type}
                </div>
              </div>
            ))}
          </div>

          <button style={{ width: '100%', marginTop: '2.5rem', background: '#f1f5f9', border: 'none', padding: '1rem', borderRadius: '12px', color: '#1e293b', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            Ver Repositorio Histórico
          </button>
        </div>

      </div>
    </div>
  );
}
