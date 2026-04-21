'use client';

import React from 'react';
import styles from '@/components/portal/portal.module.css';

export default function ComitesPage() {
  const comites = [
    { id: 'AMIB-CAM-2024-08', name: 'Comité de Análisis de Mercados', date: '24 Oct, 2024', time: '09:00 - 11:30 hrs', status: 'PROGRAMADA', role: 'Presidente', docs: true },
    { id: 'AMIB-CEV-2024-03', name: 'Comité de Ética y Vigilancia', date: '18 Oct, 2024', time: '14:00 - 16:00 hrs', status: 'REALIZADA', role: 'Vocal', docs: true },
    { id: 'AMIB-CNB-2024-12', name: 'Comité de Normatividad Bursátil', date: '12 Oct, 2024', time: '10:00 - 13:00 hrs', status: 'REALIZADA', role: 'Vocal', docs: true },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PROGRAMADA': return { bg: '#fef3c7', text: '#b45309' };
      case 'REALIZADA': return { bg: '#dcfce7', text: '#166534' };
      default: return { bg: '#f1f5f9', text: '#64748b' };
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.eyebrow}>Gestión Institucional</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className={styles.pageTitle}>Calendario de Comités</h1>
            <p className={styles.pageDesc}>Monitoreo y administración de sesiones regulatorias. Gestione su participación.</p>
          </div>
          <button style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#1e293b', padding: '0.6rem 1.25rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            Vista Mensual
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className={styles.statGrid}>
        <div className={styles.summaryCard} style={{ background: '#0a1628', color: 'white' }}>
          <div style={{ background: 'rgba(234,171,0,0.1)', color: 'var(--color-secondary-container)', padding: '0.75rem', borderRadius: '12px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>12</div>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.6, fontWeight: 700, letterSpacing: '0.05em' }}>Sesiones Programadas</div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '12px' }}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>04</div>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>Roles de Presidente</div>
          </div>
        </div>
        <div className={styles.summaryCard} style={{ background: '#f8fafc', gridColumn: 'span 2' }}>
           <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#b45309', fontWeight: 800, marginBottom: '0.25rem' }}>Próxima Sesión Crítica</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Comité de Ética y Vigilancia</div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> 14:00 hrs</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg> Sala A / Zoom</span>
              </div>
           </div>
           <div style={{ width: '80px', height: '60px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M3 21h18M3 10h18M5 10v11M19 10v11M12 10v11M7 10l5-6 5 6" /></svg>
           </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <select style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', fontWeight: 600, color: '#475569', outline: 'none' }}>
              <option>Todos los Comités</option>
            </select>
            <select style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', fontWeight: 600, color: '#475569', outline: 'none' }}>
              <option>Estado</option>
            </select>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            ORDENAR POR: <span style={{ fontWeight: 800, color: '#0f172a', cursor: 'pointer', textDecoration: 'underline' }}>Fecha más reciente</span>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#0a1628', color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Comité</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Fecha y Hora</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Estado</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Rol</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 700, textAlign: 'center' }}>Documentación</th>
            </tr>
          </thead>
          <tbody>
            {comites.map((c, i) => {
              const statusStyle = getStatusStyle(c.status);
              return (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1.5rem' }}>
                    <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem' }}>{c.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>ID: {c.id}</div>
                  </td>
                  <td style={{ padding: '1.5rem' }}>
                    <div style={{ fontWeight: 700, color: '#475569', fontSize: '0.9rem' }}>{c.date}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{c.time}</div>
                  </td>
                  <td style={{ padding: '1.5rem' }}>
                    <span style={{ background: statusStyle.bg, color: statusStyle.text, padding: '0.3rem 0.6rem', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em' }}>
                      • {c.status}
                    </span>
                  </td>
                  <td style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>
                      {c.role === 'Presidente' ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#b45309" stroke="#b45309"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      )}
                      {c.role}
                    </div>
                  </td>
                  <td style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                      <button style={{ background: 'none', border: 'none', color: '#0a1628', cursor: 'pointer' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                      </button>
                      <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h6v6" /><path d="M10 14L21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
           <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Mostrando 1-3 de 12 sesiones</div>
           <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <button style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#0a1628', color: 'white', fontWeight: 800, fontSize: '0.85rem' }}>1</button>
              <button style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 700, fontSize: '0.85rem' }}>2</button>
              <button style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 700, fontSize: '0.85rem' }}>3</button>
              <button style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
