'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { Database } from '@/types/database.types';

type Oficio = Database['public']['Tables']['oficios']['Row'] & {
  tareas_total?: number;
  tareas_concluidas?: number;
};
type EstatusFilter = 'todos' | 'pendiente' | 'en_proceso' | 'cumplido' | 'vencido';
type Semaforo = 'verde' | 'amarillo' | 'rojo';

// ── Helpers ──────────────────────────────────────────────────
function getSemaforo(o: Oficio): Semaforo {
  if (o.estatus === 'cumplido') return 'verde';
  if (!o.fecha_vencimiento) return 'amarillo';
  const diff = diffDias(o.fecha_vencimiento);
  if (diff < 0) return 'rojo';
  if (diff <= 5) return 'amarillo';
  return 'verde';
}

function diffDias(fecha: string): number {
  return Math.ceil((new Date(fecha).getTime() - Date.now()) / 86400000);
}

function fmtCorta(d: string): string {
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
}

const SEM: Record<Semaforo, { color: string; bg: string; label: string }> = {
  verde:    { color: '#10B981', bg: 'rgba(16,185,129,0.15)',  label: 'Al corriente' },
  amarillo: { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)',  label: 'Por vencer'   },
  rojo:     { color: '#EF4444', bg: 'rgba(239,68,68,0.15)',   label: 'Vencido'      },
};

const EST: Record<string, { color: string; bg: string; label: string }> = {
  pendiente:  { color: 'rgba(255,255,255,0.45)', bg: 'rgba(255,255,255,0.06)', label: 'Pendiente'  },
  en_proceso: { color: '#EAAB00',                bg: 'rgba(234,171,0,0.12)',   label: 'En proceso' },
  cumplido:   { color: '#10B981',                bg: 'rgba(16,185,129,0.12)',  label: 'Cumplido'   },
};

// ── Componente principal ─────────────────────────────────────
export default function OficiosDashboard() {
  const { locale } = useParams();
  const [oficios, setOficios] = useState<Oficio[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<EstatusFilter>('todos');
  const listaRef = useRef<HTMLDivElement>(null);

  function irALista(f: EstatusFilter = 'todos') {
    setFiltro(f);
    setTimeout(() => listaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('oficios')
        .select('*, oficio_tareas(estatus)')
        .order('fecha_recepcion', { ascending: false });

      if (data) {
        setOficios(data.map((o: any) => ({
          ...o,
          tareas_total:     o.oficio_tareas?.length ?? 0,
          tareas_concluidas: o.oficio_tareas?.filter((t: any) => t.estatus === 'concluido').length ?? 0,
        })));
      }
      setLoading(false);
    })();
  }, []);

  // ── Derivaciones ────────────────────────────────────────────
  const activos   = oficios.filter(o => o.estatus !== 'cumplido');
  const vencidos  = activos.filter(o => o.fecha_vencimiento && diffDias(o.fecha_vencimiento) < 0);
  const urgentes  = activos.filter(o => o.fecha_vencimiento && diffDias(o.fecha_vencimiento) >= 0 && diffDias(o.fecha_vencimiento) <= 3);
  const proximos  = activos.filter(o => o.fecha_vencimiento && diffDias(o.fecha_vencimiento) > 3 && diffDias(o.fecha_vencimiento) <= 14);

  const stats = {
    total:      oficios.length,
    en_proceso: oficios.filter(o => o.estatus === 'en_proceso').length,
    esta_semana: activos.filter(o => o.fecha_vencimiento && diffDias(o.fecha_vencimiento) <= 7 && diffDias(o.fecha_vencimiento) >= 0).length,
    cumplidos:  oficios.filter(o => o.estatus === 'cumplido').length,
  };

  // Timeline: próximos 21 días
  const timeline = Array.from({ length: 21 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const matches = activos.filter(o => o.fecha_vencimiento === iso);
    return { fecha: d, iso, matches };
  });

  const filtrados = filtro === 'todos'    ? oficios
    : filtro === 'vencido' ? oficios.filter(o => o.estatus !== 'cumplido' && !!o.fecha_vencimiento && diffDias(o.fecha_vencimiento) < 0)
    : oficios.filter(o => o.estatus === filtro);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: 'rgba(255,255,255,0.4)', gap: '0.75rem' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          style={{ width: '20px', height: '20px', border: '2px solid rgba(234,171,0,0.2)', borderTopColor: '#EAAB00', borderRadius: '50%' }} />
        Cargando dashboard…
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#EAAB00', margin: '0 0 0.35rem' }}>
            CNBV · Seguimiento regulatorio
          </p>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: '#fff', margin: 0 }}>
            Oficios CNBV
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href={`/${locale}/mi-cuenta/oficios/historial`} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
            padding: '0.65rem 1.1rem', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            Historial
          </Link>
          <Link href={`/${locale}/mi-cuenta/oficios/nuevo`} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(234,171,0,0.12)', color: '#EAAB00',
            border: '1px solid rgba(234,171,0,0.3)', borderRadius: '10px',
            padding: '0.65rem 1.25rem', fontSize: '0.8rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.05em', textDecoration: 'none',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Registrar oficio
          </Link>
        </div>
      </div>

      {/* ── Alertas críticas ── */}
      <AnimatePresence>
        {(vencidos.length > 0 || urgentes.length > 0) && (
          <motion.div key="alertas" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

            {vencidos.length > 0 && (
              <div style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '14px', padding: '1rem 1.25rem',
                display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
              }}>
                <div style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', padding: '0.5rem', borderRadius: '8px', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#FCA5A5' }}>
                    {vencidos.length} oficio{vencidos.length > 1 ? 's' : ''} vencido{vencidos.length > 1 ? 's' : ''}
                  </p>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'rgba(239,68,68,0.7)' }}>
                    {vencidos.map(o => o.numero_oficio).join(' · ')}
                  </p>
                </div>
                {vencidos.length === 1 ? (
                  <Link href={`/${locale}/mi-cuenta/oficios/${vencidos[0].id}`} style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '0.4rem 0.9rem', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    Ver →
                  </Link>
                ) : (
                  <button onClick={() => irALista('todos')} style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '0.4rem 0.9rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                    Ver todos →
                  </button>
                )}
              </div>
            )}

            {urgentes.length > 0 && (
              <div style={{
                background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: '14px', padding: '1rem 1.25rem',
                display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
              }}>
                <div style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', padding: '0.5rem', borderRadius: '8px', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#FCD34D' }}>
                    {urgentes.length} oficio{urgentes.length > 1 ? 's' : ''} con vencimiento en ≤ 3 días
                  </p>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'rgba(245,158,11,0.7)' }}>
                    {urgentes.map(o => `${o.numero_oficio} (${diffDias(o.fecha_vencimiento!)}d)`).join(' · ')}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total oficios',     value: stats.total,       color: '#60A5FA', sub: 'registrados'     },
          { label: 'En proceso',        value: stats.en_proceso,  color: '#EAAB00', sub: 'en atención'     },
          { label: 'Vencen esta semana',value: stats.esta_semana, color: '#F59E0B', sub: 'próximos 7 días' },
          { label: 'Cumplidos',         value: stats.cumplidos,   color: '#10B981', sub: 'atendidos'       },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.25rem 1.5rem', backdropFilter: 'blur(8px)' }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', marginBottom: '0.5rem' }}>
              {s.label}
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.3rem' }}>{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Timeline 21 días ── */}
      {activos.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', margin: '0 0 1rem' }}>
            Próximos 21 días
          </p>
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {timeline.map(({ fecha, iso, matches }) => {
              const esHoy = diffDias(iso) === 0;
              const hayVencimiento = matches.length > 0;
              const tieneVencido = matches.some(o => getSemaforo(o) === 'rojo');
              const tieneUrgente = matches.some(o => getSemaforo(o) === 'amarillo');
              const dotColor = tieneVencido ? '#EF4444' : tieneUrgente ? '#F59E0B' : '#10B981';

              return (
                <div key={iso} title={matches.map(o => o.numero_oficio).join(', ')}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '36px', cursor: hayVencimiento ? 'pointer' : 'default' }}
                  onClick={() => hayVencimiento && setFiltro('en_proceso')}>
                  <div style={{ fontSize: '0.6rem', color: esHoy ? '#EAAB00' : 'rgba(255,255,255,0.25)', fontWeight: esHoy ? 800 : 400 }}>
                    {fecha.toLocaleDateString('es-MX', { weekday: 'narrow' })}
                  </div>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: esHoy ? 'rgba(234,171,0,0.15)' : hayVencimiento ? `${dotColor}18` : 'rgba(255,255,255,0.04)',
                    color: esHoy ? '#EAAB00' : hayVencimiento ? dotColor : 'rgba(255,255,255,0.3)',
                    border: esHoy ? '1px solid rgba(234,171,0,0.3)' : hayVencimiento ? `1px solid ${dotColor}40` : '1px solid transparent',
                  }}>
                    {fecha.getDate()}
                  </div>
                  {hayVencimiento && (
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: dotColor }} />
                  )}
                </div>
              );
            })}
          </div>
          {(proximos.length > 0) && (
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {proximos.map(o => (
                <Link key={o.id} href={`/${locale}/mi-cuenta/oficios/${o.id}`}
                  style={{ fontSize: '0.7rem', color: '#F59E0B', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '6px', padding: '0.2rem 0.6rem', textDecoration: 'none' }}>
                  {o.numero_oficio} · {fmtCorta(o.fecha_vencimiento!)}
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ── Distribución por semáforo ── */}
      {oficios.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', margin: '0 0 1rem' }}>
            Distribución por semáforo
          </p>
          <BarraSemaforo oficios={oficios} />
        </motion.div>
      )}

      {/* ── Lista de oficios ── */}
      <div ref={listaRef} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
          Todos los oficios
        </h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {(['todos', 'pendiente', 'en_proceso', 'vencido', 'cumplido'] as EstatusFilter[]).map(f => {
            const count = f === 'todos'   ? oficios.length
              : f === 'vencido' ? vencidos.length
              : oficios.filter(o => o.estatus === f).length;
            const label = f === 'todos' ? 'Todos'
              : f === 'vencido' ? 'Vencidos'
              : EST[f]?.label;
            const isVencido = f === 'vencido';
            return (
              <button key={f} onClick={() => setFiltro(f)} style={{
                padding: '0.35rem 0.9rem', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 600,
                cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                background: filtro === f ? (isVencido ? 'rgba(239,68,68,0.15)' : 'rgba(234,171,0,0.15)') : 'rgba(255,255,255,0.05)',
                color: filtro === f ? (isVencido ? '#EF4444' : '#EAAB00') : (isVencido && count > 0 ? '#EF4444' : 'rgba(255,255,255,0.4)'),
                outline: filtro === f ? (isVencido ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(234,171,0,0.3)') : '1px solid transparent',
              }}>
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {filtrados.length === 0 ? (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '16px', padding: '3.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📭</div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', margin: '0 0 0.5rem' }}>
            {filtro === 'todos' ? 'Aún no hay oficios registrados.' : filtro === 'vencido' ? 'Sin oficios vencidos.' : `Sin oficios con estatus "${EST[filtro]?.label}".`}
          </p>
          {filtro === 'todos' && (
            <Link href={`/${locale}/mi-cuenta/oficios/nuevo`} style={{ color: '#EAAB00', fontSize: '0.8rem' }}>
              Registrar el primer oficio →
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {filtrados.map((o, i) => {
            const sem = getSemaforo(o);
            const ss  = SEM[sem];
            const es  = EST[o.estatus] ?? EST.pendiente;
            const pct = o.tareas_total ? Math.round((o.tareas_concluidas! / o.tareas_total) * 100) : null;
            const dias = o.fecha_vencimiento ? diffDias(o.fecha_vencimiento) : null;

            return (
              <motion.div key={o.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Link href={`/${locale}/mi-cuenta/oficios/${o.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div
                    style={{ display: 'flex', alignItems: 'stretch', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden', transition: 'all 0.2s ease', cursor: 'pointer' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = 'rgba(255,255,255,0.05)'; el.style.borderColor = `${ss.color}40`; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = 'rgba(255,255,255,0.03)'; el.style.borderColor = 'rgba(255,255,255,0.07)'; }}
                  >
                    <div style={{ width: '4px', background: ss.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, padding: '0.9rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '180px' }}>
                        <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.15rem' }}>
                          {o.numero_oficio}
                        </div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>
                          {o.titulo ?? 'Sin título'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0, flexWrap: 'wrap' }}>
                        {pct !== null && (
                          <div style={{ textAlign: 'center', minWidth: '52px' }}>
                            <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', marginBottom: '3px' }}>Tareas</div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>{o.tareas_concluidas}/{o.tareas_total}</div>
                            <div style={{ height: '2px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', marginTop: '3px', width: '52px' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: ss.color, borderRadius: '99px' }} />
                            </div>
                          </div>
                        )}
                        <div style={{ textAlign: 'right', minWidth: '80px' }}>
                          <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', marginBottom: '2px' }}>Vencimiento</div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: ss.color }}>
                            {dias === null ? '—' : dias < 0 ? `${Math.abs(dias)}d vencido` : dias === 0 ? 'Hoy' : `${dias}d`}
                          </div>
                          {o.fecha_vencimiento && <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)' }}>{fmtCorta(o.fecha_vencimiento)}</div>}
                        </div>
                        <span style={{ padding: '0.25rem 0.7rem', borderRadius: '100px', fontSize: '0.68rem', fontWeight: 700, background: es.bg, color: es.color }}>
                          {es.label}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 0.75rem', color: 'rgba(255,255,255,0.2)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Barra de distribución por semáforo ──────────────────────
function BarraSemaforo({ oficios }: { oficios: Oficio[] }) {
  const total  = oficios.length;
  const verdes   = oficios.filter(o => getSemaforo(o) === 'verde').length;
  const amarillos = oficios.filter(o => getSemaforo(o) === 'amarillo').length;
  const rojos    = oficios.filter(o => getSemaforo(o) === 'rojo').length;

  const segmentos = [
    { color: '#10B981', count: verdes,    label: 'Al corriente' },
    { color: '#F59E0B', count: amarillos, label: 'Por vencer'   },
    { color: '#EF4444', count: rojos,     label: 'Vencido'      },
  ].filter(s => s.count > 0);

  return (
    <div>
      <div style={{ display: 'flex', height: '10px', borderRadius: '99px', overflow: 'hidden', gap: '2px', marginBottom: '0.75rem' }}>
        {segmentos.map(s => (
          <motion.div key={s.color}
            initial={{ width: 0 }} animate={{ width: `${(s.count / total) * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ height: '100%', background: s.color, minWidth: s.count > 0 ? '4px' : '0' }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {[
          { color: '#10B981', count: verdes,    label: 'Al corriente' },
          { color: '#F59E0B', count: amarillos, label: 'Por vencer'   },
          { color: '#EF4444', count: rojos,     label: 'Vencido'      },
        ].map(s => (
          <div key={s.color} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>
              {s.label} <strong style={{ color: s.color }}>{s.count}</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
