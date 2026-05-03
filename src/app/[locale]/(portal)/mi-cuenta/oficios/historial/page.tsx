'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import type { Database } from '@/types/database.types';

type Oficio = Database['public']['Tables']['oficios']['Row'];

type EstatusOficio = 'pendiente' | 'en_proceso' | 'cumplido';

function diffDias(fecha: string): number {
  return Math.ceil((new Date(fecha).getTime() - Date.now()) / 86400000);
}

function fmtFecha(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getAnio(d: string | null): number {
  if (!d) return new Date().getFullYear();
  return new Date(d).getFullYear();
}

const EST: Record<EstatusOficio, { color: string; bg: string; label: string }> = {
  pendiente:  { color: 'rgba(255,255,255,0.45)', bg: 'rgba(255,255,255,0.06)', label: 'Pendiente'  },
  en_proceso: { color: '#EAAB00',                bg: 'rgba(234,171,0,0.12)',   label: 'En proceso' },
  cumplido:   { color: '#10B981',                bg: 'rgba(16,185,129,0.12)',  label: 'Cumplido'   },
};

function getSemaforoColor(o: Oficio): string {
  if (o.estatus === 'cumplido') return '#10B981';
  if (!o.fecha_vencimiento) return '#F59E0B';
  const d = diffDias(o.fecha_vencimiento);
  if (d < 0) return '#EF4444';
  if (d <= 5) return '#F59E0B';
  return '#10B981';
}

export default function HistorialPage() {
  const { locale } = useParams();
  const [oficios, setOficios] = useState<Oficio[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [anioFiltro, setAnioFiltro] = useState<number | 'todos'>('todos');
  const [estatusFiltro, setEstatusFiltro] = useState<EstatusOficio | 'todos'>('todos');

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('oficios')
        .select('*')
        .order('fecha_recepcion', { ascending: false });
      if (data) setOficios(data);
      setLoading(false);
    })();
  }, []);

  // Años disponibles para el filtro
  const aniosDisponibles = useMemo(() => {
    const set = new Set(oficios.map(o => getAnio(o.fecha_recepcion)));
    return Array.from(set).sort((a, b) => b - a);
  }, [oficios]);

  // Filtrado
  const filtrados = useMemo(() => {
    return oficios.filter(o => {
      const matchBusqueda = !busqueda ||
        o.numero_oficio.toLowerCase().includes(busqueda.toLowerCase()) ||
        (o.titulo ?? '').toLowerCase().includes(busqueda.toLowerCase()) ||
        (o.resumen_ia ?? '').toLowerCase().includes(busqueda.toLowerCase());

      const matchAnio = anioFiltro === 'todos' || getAnio(o.fecha_recepcion) === anioFiltro;
      const matchEstatus = estatusFiltro === 'todos' || o.estatus === estatusFiltro;

      return matchBusqueda && matchAnio && matchEstatus;
    });
  }, [oficios, busqueda, anioFiltro, estatusFiltro]);

  // Métricas del historial
  const stats = useMemo(() => {
    const base = anioFiltro === 'todos' ? oficios : oficios.filter(o => getAnio(o.fecha_recepcion) === anioFiltro);
    const cumplidos = base.filter(o => o.estatus === 'cumplido').length;
    const total = base.length;
    return {
      total,
      cumplidos,
      en_proceso: base.filter(o => o.estatus === 'en_proceso').length,
      pct: total > 0 ? Math.round((cumplidos / total) * 100) : 0,
    };
  }, [oficios, anioFiltro]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: 'rgba(255,255,255,0.4)', gap: '0.75rem' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          style={{ width: '20px', height: '20px', border: '2px solid rgba(234,171,0,0.2)', borderTopColor: '#EAAB00', borderRadius: '50%' }} />
        Cargando historial…
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link href={`/${locale}/mi-cuenta/oficios`}
            style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            Dashboard
          </Link>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#EAAB00', margin: '0 0 0.35rem' }}>
            Registro histórico
          </p>
          <h1 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 800, color: '#fff', margin: 0 }}>
            Historial de oficios
          </h1>
        </div>
        <Link href={`/${locale}/mi-cuenta/oficios/nuevo`} style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(234,171,0,0.12)', color: '#EAAB00',
          border: '1px solid rgba(234,171,0,0.3)', borderRadius: '10px',
          padding: '0.6rem 1.25rem', fontSize: '0.78rem', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.05em', textDecoration: 'none',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Registrar oficio
        </Link>
      </div>

      {/* Métricas del año */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total',      value: stats.total,      color: '#60A5FA' },
          { label: 'Cumplidos',  value: stats.cumplidos,  color: '#10B981' },
          { label: 'En proceso', value: stats.en_proceso, color: '#EAAB00' },
          { label: 'Cumplimiento', value: `${stats.pct}%`, color: stats.pct >= 80 ? '#10B981' : stats.pct >= 50 ? '#F59E0B' : '#EF4444' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.1rem 1.25rem' }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.4rem' }}>
              {s.label}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Barra de cumplimiento */}
      {stats.total > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1rem 1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)' }}>
              Tasa de cumplimiento {anioFiltro !== 'todos' ? anioFiltro : '(todos los años)'}
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: stats.pct >= 80 ? '#10B981' : stats.pct >= 50 ? '#F59E0B' : '#EF4444' }}>
              {stats.pct}%
            </span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${stats.pct}%` }} transition={{ duration: 0.7, ease: 'easeOut' }}
              style={{ height: '100%', borderRadius: '99px', background: stats.pct >= 80 ? '#10B981' : stats.pct >= 50 ? '#F59E0B' : '#EF4444' }}
            />
          </div>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>

        {/* Búsqueda */}
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text" placeholder="Buscar por número, título o resumen…"
            value={busqueda} onChange={e => setBusqueda(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', padding: '0.55rem 0.75rem 0.55rem 2.25rem',
              color: '#fff', fontSize: '0.82rem', outline: 'none', fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Filtro año */}
        <select value={String(anioFiltro)} onChange={e => setAnioFiltro(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.55rem 0.75rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', outline: 'none', cursor: 'pointer' }}>
          <option value="todos">Todos los años</option>
          {aniosDisponibles.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        {/* Filtro estatus */}
        <select value={estatusFiltro} onChange={e => setEstatusFiltro(e.target.value as any)}
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.55rem 0.75rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', outline: 'none', cursor: 'pointer' }}>
          <option value="todos">Todos los estatus</option>
          <option value="cumplido">Cumplidos</option>
          <option value="en_proceso">En proceso</option>
          <option value="pendiente">Pendientes</option>
        </select>

        {(busqueda || anioFiltro !== 'todos' || estatusFiltro !== 'todos') && (
          <button onClick={() => { setBusqueda(''); setAnioFiltro('todos'); setEstatusFiltro('todos'); }}
            style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '0.5rem 0.9rem', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
            Limpiar
          </button>
        )}
      </div>

      {/* Contador de resultados */}
      <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
        {filtrados.length} {filtrados.length === 1 ? 'oficio' : 'oficios'} encontrados
      </div>

      {/* Tabla / Lista */}
      {filtrados.length === 0 ? (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '14px', padding: '3.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔍</div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', margin: 0 }}>
            {oficios.length === 0 ? 'Aún no hay oficios registrados.' : 'No se encontraron oficios con esos filtros.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filtrados.map((o, i) => {
            const es = EST[o.estatus as EstatusOficio] ?? EST.pendiente;
            const semColor = getSemaforoColor(o);

            return (
              <motion.div key={o.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.025 }}>
                <Link href={`/${locale}/mi-cuenta/oficios/${o.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '11px', overflow: 'hidden', transition: 'all 0.18s ease', cursor: 'pointer' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = 'rgba(255,255,255,0.05)'; el.style.borderColor = `${semColor}35`; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = 'rgba(255,255,255,0.03)'; el.style.borderColor = 'rgba(255,255,255,0.07)'; }}
                  >
                    {/* Franja semáforo */}
                    <div style={{ width: '3px', background: semColor, alignSelf: 'stretch', flexShrink: 0 }} />

                    {/* Año badge */}
                    <div style={{ padding: '0.8rem 1rem', flexShrink: 0 }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.2)', textAlign: 'center', lineHeight: 1.2 }}>
                        {o.fecha_recepcion ? new Date(o.fecha_recepcion).getFullYear() : '—'}
                      </div>
                    </div>

                    {/* Contenido principal */}
                    <div style={{ flex: 1, padding: '0.8rem 0', minWidth: 0 }}>
                      <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.15rem' }}>
                        {o.numero_oficio}
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '1rem' }}>
                        {o.titulo ?? 'Sin título'}
                      </div>
                      {o.resumen_ia && (
                        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', paddingRight: '1rem' }}>
                          {o.resumen_ia}
                        </div>
                      )}
                    </div>

                    {/* Fechas */}
                    <div style={{ display: 'flex', gap: '2rem', padding: '0.8rem 1.25rem', flexShrink: 0, alignItems: 'center' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', marginBottom: '2px' }}>Recepción</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{fmtFecha(o.fecha_recepcion)}</div>
                      </div>
                      <div style={{ textAlign: 'right', minWidth: '80px' }}>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', marginBottom: '2px' }}>Vencimiento</div>
                        <div style={{ fontSize: '0.75rem', color: semColor, fontWeight: 600 }}>{fmtFecha(o.fecha_vencimiento)}</div>
                      </div>
                      <span style={{ padding: '0.25rem 0.65rem', borderRadius: '100px', fontSize: '0.68rem', fontWeight: 700, background: es.bg, color: es.color, whiteSpace: 'nowrap' }}>
                        {es.label}
                      </span>
                    </div>

                    <div style={{ padding: '0 0.75rem', color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
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
