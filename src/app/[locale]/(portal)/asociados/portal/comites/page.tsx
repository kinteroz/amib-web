// Server Component — consume Supabase directamente sin 'use client'
import React from 'react';
import styles from '@/components/portal/portal.module.css';
import { getComitesSesiones, type ComiteSesion } from '@/lib/supabase/server';

// ── Helpers ────────────────────────────────────────────────────────────────

function formatFecha(fecha: string): string {
  const d = new Date(fecha + 'T12:00:00'); // Evitar salto de zona horaria
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatHora(horaInicio: string, horaFin: string | null): string {
  const clean = (h: string) => h.substring(0, 5);
  return horaFin ? `${clean(horaInicio)} - ${clean(horaFin)} hrs` : `${clean(horaInicio)} hrs`;
}

function getStatusStyle(estado: string) {
  switch (estado) {
    case 'programada':  return { bg: '#fef3c7', text: '#b45309' };
    case 'realizada':   return { bg: '#dcfce7', text: '#166534' };
    case 'cancelada':   return { bg: '#fee2e2', text: '#b91c1c' };
    case 'pospuesta':   return { bg: '#f1f5f9', text: '#64748b' };
    default:            return { bg: '#f1f5f9', text: '#64748b' };
  }
}

// ── Componente ──────────────────────────────────────────────────────────────

export default async function ComitesPage() {
  // Datos reales de Supabase (RSC — sin useEffect, sin fetch manual)
  const sesiones: ComiteSesion[] = await getComitesSesiones();

  const programadas = sesiones.filter(s => s.estado === 'programada').length;
  const roles_presidente = sesiones.filter(s => s.rol_asociado === 'presidente').length;
  const proximaSesion = sesiones.find(s => s.estado === 'programada') ?? null;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.eyebrow}>Gestión Institucional</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className={styles.pageTitle}>Calendario de Comités</h1>
            <p className={styles.pageDesc}>Monitoreo y administración de sesiones regulatorias.</p>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className={styles.statGrid}>
        <div className={styles.summaryCard} style={{ background: '#0a1628', color: 'white' }}>
          <div style={{ background: 'rgba(234,171,0,0.1)', color: 'var(--color-secondary-container)', padding: '0.75rem', borderRadius: '12px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{programadas}</div>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.6, fontWeight: 700, letterSpacing: '0.05em' }}>Sesiones Programadas</div>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '12px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>{String(roles_presidente).padStart(2, '0')}</div>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>Roles de Presidente</div>
          </div>
        </div>

        {proximaSesion && (
          <div className={styles.summaryCard} style={{ background: '#f8fafc' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#b45309', fontWeight: 800, marginBottom: '0.25rem' }}>Próxima Sesión</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{proximaSesion.nombre}</div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  {formatHora(proximaSesion.hora_inicio, proximaSesion.hora_fin)}
                </span>
                {proximaSesion.ubicacion && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    {proximaSesion.ubicacion}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de sesiones */}
      <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>
            Historial de Sesiones
            <span style={{ marginLeft: '0.75rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', background: '#e2e8f0', padding: '0.2rem 0.6rem', borderRadius: '100px' }}>
              {sesiones.length} registros
            </span>
          </h2>
        </div>

        {sesiones.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.3 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            <p style={{ fontWeight: 600 }}>No hay sesiones registradas</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Las sesiones aparecerán aquí una vez sean creadas por el administrador.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '640px' }}>
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
                {sesiones.map((s) => {
                  const statusStyle = getStatusStyle(s.estado);
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1.5rem' }}>
                        <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem' }}>{s.nombre}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem', textTransform: 'capitalize' }}>{s.tipo}</div>
                      </td>
                      <td style={{ padding: '1.5rem' }}>
                        <div style={{ fontWeight: 700, color: '#475569', fontSize: '0.9rem' }}>{formatFecha(s.fecha)}</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{formatHora(s.hora_inicio, s.hora_fin)}</div>
                      </td>
                      <td style={{ padding: '1.5rem' }}>
                        <span style={{ background: statusStyle.bg, color: statusStyle.text, padding: '0.3rem 0.6rem', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                          • {s.estado}
                        </span>
                      </td>
                      <td style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 700, color: '#475569', textTransform: 'capitalize' }}>
                          {s.rol_asociado === 'presidente' && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#b45309" stroke="#b45309"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                          )}
                          {s.rol_asociado}
                        </div>
                      </td>
                      <td style={{ padding: '1.5rem', textAlign: 'center' }}>
                        {s.link_documento ? (
                          <a
                            href={s.link_documento}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ background: 'none', border: 'none', color: '#0a1628', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                            Ver PDF
                          </a>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #f1f5f9', fontSize: '0.8rem', color: '#94a3b8' }}>
          Total: {sesiones.length} sesiones · Datos en tiempo real vía Supabase
        </div>
      </div>
    </div>
  );
}
