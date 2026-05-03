'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { Database } from '@/types/database.types';

type Oficio   = Database['public']['Tables']['oficios']['Row'];
type Tarea    = Database['public']['Tables']['oficio_tareas']['Row'];
type Paso     = Database['public']['Tables']['oficio_tarea_pasos']['Row'];
type EstatusOficio = 'pendiente' | 'en_proceso' | 'cumplido';
type EstatusTarea  = 'pendiente' | 'en_proceso' | 'concluido';
type EstatusPaso   = 'pendiente' | 'en_proceso' | 'concluido';
type Semaforo = 'verde' | 'amarillo' | 'rojo';

type PlanGeneral = {
  resumen_ejecutivo: string;
  areas_involucradas: string[];
  cronograma: { semana: number; hito: string; areas: string[] }[];
  riesgos: string[];
};

// ── Helpers ──────────────────────────────────────────────────
function getSemaforo(oficio: Oficio): Semaforo {
  if (oficio.estatus === 'cumplido') return 'verde';
  if (!oficio.fecha_vencimiento) return 'amarillo';
  const diff = Math.ceil((new Date(oficio.fecha_vencimiento).getTime() - Date.now()) / 86400000);
  if (diff < 0) return 'rojo';
  if (diff <= 5) return 'amarillo';
  return 'verde';
}

function getDiasRestantes(fecha: string | null): { texto: string; urgente: boolean } {
  if (!fecha) return { texto: 'Sin fecha límite', urgente: false };
  const diff = Math.ceil((new Date(fecha).getTime() - Date.now()) / 86400000);
  if (diff < 0)   return { texto: `${Math.abs(diff)} días vencido`, urgente: true };
  if (diff === 0) return { texto: 'Vence hoy', urgente: true };
  if (diff <= 5)  return { texto: `${diff} días restantes`, urgente: true };
  return { texto: `${diff} días restantes`, urgente: false };
}

function fmtDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

const SEMAFORO: Record<Semaforo, { color: string; bg: string; label: string }> = {
  verde:    { color: '#10B981', bg: 'rgba(16,185,129,0.15)',  label: 'Al corriente' },
  amarillo: { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)',  label: 'Por vencer'   },
  rojo:     { color: '#EF4444', bg: 'rgba(239,68,68,0.15)',   label: 'Vencido'      },
};

const ESTATUS_OFICIO: Record<EstatusOficio, { color: string; bg: string; label: string }> = {
  pendiente:  { color: 'rgba(255,255,255,0.45)', bg: 'rgba(255,255,255,0.07)', label: 'Pendiente'  },
  en_proceso: { color: '#EAAB00',                bg: 'rgba(234,171,0,0.12)',   label: 'En proceso' },
  cumplido:   { color: '#10B981',                bg: 'rgba(16,185,129,0.12)',  label: 'Cumplido'   },
};

const ESTATUS_TAREA: Record<EstatusTarea, { color: string; bg: string; label: string; next: EstatusTarea }> = {
  pendiente:  { color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.06)', label: 'Pendiente',  next: 'en_proceso' },
  en_proceso: { color: '#EAAB00',               bg: 'rgba(234,171,0,0.12)',   label: 'En proceso', next: 'concluido'  },
  concluido:  { color: '#10B981',               bg: 'rgba(16,185,129,0.12)',  label: 'Concluido',  next: 'pendiente'  },
};

const ESTATUS_PASO: Record<EstatusPaso, { color: string; bg: string; label: string; next: EstatusPaso }> = {
  pendiente:  { color: 'rgba(255,255,255,0.35)', bg: 'rgba(255,255,255,0.04)', label: 'Pendiente',  next: 'en_proceso' },
  en_proceso: { color: '#EAAB00',                bg: 'rgba(234,171,0,0.1)',    label: 'En proceso', next: 'concluido'  },
  concluido:  { color: '#10B981',                bg: 'rgba(16,185,129,0.1)',   label: 'Concluido',  next: 'pendiente'  },
};

// ── Componente principal ─────────────────────────────────────
export default function OficioDetallePage() {
  const { locale, id } = useParams<{ locale: string; id: string }>();
  const router = useRouter();

  const [oficio, setOficio]         = useState<Oficio | null>(null);
  const [tareas, setTareas]         = useState<Tarea[]>([]);
  const [pasos, setPasos]           = useState<Record<string, Paso[]>>({});
  const [planGeneral, setPlanGeneral] = useState<PlanGeneral | null>(null);
  const [loading, setLoading]       = useState(true);
  const [guardando, setGuardando]   = useState<string | null>(null);
  const [confirmCumplido, setConfirmCumplido] = useState(false);
  const [tareaExpandida, setTareaExpandida]   = useState<string | null>(null);
  const [generandoPlan, setGenerandoPlan]     = useState(false);
  const [errorPlan, setErrorPlan]   = useState('');
  const [tabActivo, setTabActivo]   = useState<'tareas' | 'plan'>('tareas');

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ── Carga inicial ──────────────────────────────────────────
  const cargar = useCallback(async () => {
    const [{ data: o }, { data: t }] = await Promise.all([
      supabase.from('oficios').select('*').eq('id', id).single(),
      supabase.from('oficio_tareas').select('*').eq('oficio_id', id).order('orden'),
    ]);

    if (o) {
      setOficio(o);
      if (o.plan_general) setPlanGeneral(o.plan_general as PlanGeneral);
    }

    if (t && t.length > 0) {
      setTareas(t);
      const { data: p } = await supabase
        .from('oficio_tarea_pasos')
        .select('*')
        .in('tarea_id', t.map(x => x.id))
        .order('orden');

      if (p) {
        const agrupados = p.reduce((acc, paso) => {
          if (!acc[paso.tarea_id]) acc[paso.tarea_id] = [];
          acc[paso.tarea_id].push(paso);
          return acc;
        }, {} as Record<string, Paso[]>);
        setPasos(agrupados);
      }
    }

    setLoading(false);
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  // ── Cambiar estatus de una tarea ───────────────────────────
  const cambiarEstatusTarea = async (tarea: Tarea) => {
    const siguiente = ESTATUS_TAREA[tarea.estatus as EstatusTarea].next;
    setGuardando(tarea.id);

    const patch: Partial<Tarea> = {
      estatus: siguiente,
      fecha_completada: siguiente === 'concluido' ? new Date().toISOString().split('T')[0] : null,
    };

    setTareas(prev => prev.map(t => t.id === tarea.id ? { ...t, ...patch } : t));
    await supabase.from('oficio_tareas').update(patch).eq('id', tarea.id);

    const actualizadas = tareas.map(t => t.id === tarea.id ? { ...t, ...patch } : t);
    await sincronizarEstatusOficio(actualizadas);
    setGuardando(null);
  };

  const sincronizarEstatusOficio = async (listaTareas: Partial<Tarea>[]) => {
    if (!oficio || listaTareas.length === 0) return;
    const todas     = listaTareas.length;
    const concluidas = listaTareas.filter(t => t.estatus === 'concluido').length;
    const enProceso  = listaTareas.filter(t => t.estatus === 'en_proceso').length;

    let nuevoEstatus: EstatusOficio = 'pendiente';
    if (concluidas === todas) nuevoEstatus = 'cumplido';
    else if (concluidas > 0 || enProceso > 0) nuevoEstatus = 'en_proceso';

    if (nuevoEstatus !== oficio.estatus) {
      setOficio(prev => prev ? { ...prev, estatus: nuevoEstatus } : prev);
      await supabase.from('oficios').update({ estatus: nuevoEstatus }).eq('id', oficio.id);
    }
  };

  // ── Cambiar estatus de un paso ─────────────────────────────
  const cambiarEstatusPaso = async (paso: Paso) => {
    const siguiente = ESTATUS_PASO[paso.estatus as EstatusPaso].next;
    setPasos(prev => ({
      ...prev,
      [paso.tarea_id]: (prev[paso.tarea_id] ?? []).map(p =>
        p.id === paso.id ? { ...p, estatus: siguiente } : p
      ),
    }));
    await supabase.from('oficio_tarea_pasos').update({ estatus: siguiente }).eq('id', paso.id);
  };

  // ── Editar responsable de un paso ─────────────────────────
  const actualizarResponsable = async (paso: Paso, valor: string) => {
    await supabase.from('oficio_tarea_pasos').update({ responsable_nombre: valor || null }).eq('id', paso.id);
  };

  // ── Marcar oficio como cumplido manualmente ────────────────
  const marcarCumplido = async () => {
    if (!oficio) return;
    setConfirmCumplido(false);
    setOficio(prev => prev ? { ...prev, estatus: 'cumplido' } : prev);
    await supabase.from('oficios').update({ estatus: 'cumplido' }).eq('id', oficio.id);
    await supabase.from('oficio_tareas')
      .update({ estatus: 'concluido', fecha_completada: new Date().toISOString().split('T')[0] })
      .eq('oficio_id', oficio.id);
    setTareas(prev => prev.map(t => ({ ...t, estatus: 'concluido' as EstatusTarea, fecha_completada: new Date().toISOString().split('T')[0] })));
  };

  // ── Generar plan con IA ────────────────────────────────────
  const generarPlan = async () => {
    setGenerandoPlan(true);
    setErrorPlan('');
    try {
      const res = await fetch(`/api/oficios/${id}/generar-plan`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? 'Error al generar el plan.');
      await cargar();
      setTabActivo('plan');
    } catch (err: any) {
      setErrorPlan(err.message ?? 'Error inesperado.');
    } finally {
      setGenerandoPlan(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: 'rgba(255,255,255,0.4)', gap: '0.75rem' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          style={{ width: '20px', height: '20px', border: '2px solid rgba(234,171,0,0.2)', borderTopColor: '#EAAB00', borderRadius: '50%' }} />
        Cargando oficio…
      </div>
    );
  }

  if (!oficio) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
        <p>Oficio no encontrado.</p>
        <Link href={`/${locale}/mi-cuenta/oficios`} style={{ color: '#EAAB00', fontSize: '0.85rem' }}>← Volver a oficios</Link>
      </div>
    );
  }

  const sem    = getSemaforo(oficio);
  const sStyle = SEMAFORO[sem];
  const eStyle = ESTATUS_OFICIO[oficio.estatus as EstatusOficio];
  const dias   = getDiasRestantes(oficio.fecha_vencimiento);
  const total  = tareas.length;
  const concluidas = tareas.filter(t => t.estatus === 'concluido').length;
  const progreso   = total > 0 ? Math.round((concluidas / total) * 100) : 0;

  const totalPasos     = Object.values(pasos).flat().length;
  const pasosConcluidosCnt = Object.values(pasos).flat().filter(p => p.estatus === 'concluido').length;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px' }}>

      {/* Breadcrumb */}
      <Link href={`/${locale}/mi-cuenta/oficios`}
        style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        Oficios CNBV
      </Link>

      {/* ── Header card ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex', gap: 0, background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px',
          overflow: 'hidden', marginBottom: '1.5rem',
        }}>
        <div style={{ width: '6px', background: sStyle.color, flexShrink: 0 }} />
        <div style={{ flex: 1, padding: '1.75rem 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <div>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', margin: '0 0 0.4rem' }}>
                {oficio.numero_oficio}
              </p>
              <h1 style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.7rem)', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.3 }}>
                {oficio.titulo ?? 'Sin título'}
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
              <span style={{ padding: '0.3rem 0.85rem', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 700, background: sStyle.bg, color: sStyle.color }}>
                {sStyle.label}
              </span>
              <span style={{ padding: '0.3rem 0.85rem', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 700, background: eStyle.bg, color: eStyle.color }}>
                {eStyle.label}
              </span>
            </div>
          </div>

          {oficio.resumen_ia && (
            <div style={{
              background: 'rgba(234,171,0,0.06)', border: '1px solid rgba(234,171,0,0.15)',
              borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.25rem',
              fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6,
              display: 'flex', gap: '0.6rem',
            }}>
              <span style={{ color: '#EAAB00', flexShrink: 0, marginTop: '1px' }}>✦</span>
              {oficio.resumen_ia}
            </div>
          )}

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <Metrica label="Recibido"      value={fmtDate(oficio.fecha_recepcion)} />
            <Metrica label="Vencimiento"   value={fmtDate(oficio.fecha_vencimiento)} />
            <Metrica label="Plazo CNBV"    value={`${oficio.plazo_dias_habiles} días hábiles`} />
            <Metrica label="Tiempo restante" value={dias.texto} color={dias.urgente ? sStyle.color : undefined} />
            {total > 0 && (
              <Metrica label="Avance tareas" value={`${concluidas} / ${total}`} extra={
                <div style={{ height: '4px', width: '80px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', marginTop: '4px' }}>
                  <div style={{ height: '100%', width: `${progreso}%`, background: sStyle.color, borderRadius: '99px', transition: 'width 0.4s ease' }} />
                </div>
              } />
            )}
            {totalPasos > 0 && (
              <Metrica label="Avance pasos" value={`${pasosConcluidosCnt} / ${totalPasos}`} extra={
                <div style={{ height: '4px', width: '80px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', marginTop: '4px' }}>
                  <div style={{ height: '100%', width: `${Math.round((pasosConcluidosCnt / totalPasos) * 100)}%`, background: '#60A5FA', borderRadius: '99px', transition: 'width 0.4s ease' }} />
                </div>
              } />
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Layout de dos columnas ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>

        {/* ── Columna izquierda: tabs Tareas / Plan ── */}
        <div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '4px' }}>
            {(['tareas', 'plan'] as const).map(tab => (
              <button key={tab} onClick={() => setTabActivo(tab)} style={{
                flex: 1, padding: '0.5rem', borderRadius: '7px', fontSize: '0.78rem', fontWeight: 700,
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                background: tabActivo === tab ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: tabActivo === tab ? '#fff' : 'rgba(255,255,255,0.35)',
              }}>
                {tab === 'tareas' ? `Tareas (${total})` : planGeneral ? 'Plan de trabajo ✦' : 'Plan de trabajo'}
              </button>
            ))}
          </div>

          {/* ── TAB: Tareas ── */}
          {tabActivo === 'tareas' && (
            <div>
              {tareas.length === 0 ? (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '14px', padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
                  Este oficio no tiene tareas registradas.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {tareas.map((tarea, i) => {
                    const ts       = ESTATUS_TAREA[tarea.estatus as EstatusTarea] ?? ESTATUS_TAREA.pendiente;
                    const cargando = guardando === tarea.id;
                    const expandida = tareaExpandida === tarea.id;
                    const pasosTarea = pasos[tarea.id] ?? [];

                    return (
                      <motion.div key={tarea.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                        {/* Tarea header */}
                        <div style={{
                          background: 'rgba(255,255,255,0.03)', border: `1px solid ${expandida ? `${ts.color}30` : 'rgba(255,255,255,0.07)'}`,
                          borderRadius: expandida ? '12px 12px 0 0' : '12px',
                          borderLeft: `3px solid ${ts.color}`,
                          opacity: cargando ? 0.6 : 1, transition: 'all 0.2s',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem 1.25rem' }}>
                            <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                              {tarea.numero ?? i + 1}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: '0 0 0.35rem', fontSize: '0.875rem', fontWeight: 600, color: tarea.estatus === 'concluido' ? 'rgba(255,255,255,0.4)' : '#fff', textDecoration: tarea.estatus === 'concluido' ? 'line-through' : 'none', lineHeight: 1.4 }}>
                                {tarea.descripcion}
                              </p>
                              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                {tarea.area_responsable && (
                                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                    {tarea.area_responsable}
                                  </span>
                                )}
                                {tarea.fecha_planeada && (
                                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                    {fmtDate(tarea.fecha_planeada)}
                                  </span>
                                )}
                                {tarea.fecha_completada && (
                                  <span style={{ fontSize: '0.72rem', color: '#10B981' }}>✓ {fmtDate(tarea.fecha_completada)}</span>
                                )}
                                {pasosTarea.length > 0 && (
                                  <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.05)', padding: '0.15rem 0.5rem', borderRadius: '99px' }}>
                                    {pasosTarea.filter(p => p.estatus === 'concluido').length}/{pasosTarea.length} pasos
                                  </span>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                              {pasosTarea.length > 0 && (
                                <button onClick={() => setTareaExpandida(expandida ? null : tarea.id)}
                                  style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem' }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transition: 'transform 0.2s', transform: expandida ? 'rotate(180deg)' : 'none' }}><polyline points="6 9 12 15 18 9" /></svg>
                                  Pasos
                                </button>
                              )}
                              <button onClick={() => cambiarEstatusTarea(tarea)} disabled={cargando}
                                title={`Avanzar a: ${ESTATUS_TAREA[ts.next].label}`}
                                style={{
                                  padding: '0.3rem 0.75rem', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 700,
                                  background: ts.bg, color: ts.color, border: `1px solid ${ts.color}40`,
                                  cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s ease',
                                  display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.2)')}
                                onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
                              >
                                {cargando ? (
                                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                    style={{ width: '10px', height: '10px', border: `2px solid ${ts.color}40`, borderTopColor: ts.color, borderRadius: '50%' }} />
                                ) : ts.label}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Pasos expandibles */}
                        <AnimatePresence>
                          {expandida && pasosTarea.length > 0 && (
                            <motion.div key="pasos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                              style={{ border: `1px solid ${ts.color}20`, borderTop: 'none', borderRadius: '0 0 12px 12px', background: 'rgba(0,0,0,0.15)' }}>
                              <div style={{ padding: '0.75rem 1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <p style={{ margin: '0 0 0.5rem', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.25)' }}>
                                  Plan de ejecución
                                </p>
                                {pasosTarea.map((paso, pi) => {
                                  const ps = ESTATUS_PASO[paso.estatus as EstatusPaso] ?? ESTATUS_PASO.pendiente;
                                  return (
                                    <div key={paso.id} style={{
                                      display: 'grid', gridTemplateColumns: '20px 1fr auto',
                                      gap: '0.75rem', alignItems: 'start',
                                      padding: '0.6rem 0.75rem', borderRadius: '8px',
                                      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                                    }}>
                                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: `${ps.color}18`, color: ps.color, fontSize: '0.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                                        {pi + 1}
                                      </div>
                                      <div style={{ minWidth: 0 }}>
                                        <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', color: paso.estatus === 'concluido' ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.8)', textDecoration: paso.estatus === 'concluido' ? 'line-through' : 'none', lineHeight: 1.4 }}>
                                          {paso.descripcion}
                                        </p>
                                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                          {paso.entregable && (
                                            <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                              {paso.entregable}
                                            </span>
                                          )}
                                          {paso.dias_estimados && (
                                            <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)' }}>
                                              {paso.dias_estimados}d hábiles
                                            </span>
                                          )}
                                          {/* Responsable editable */}
                                          <input
                                            defaultValue={paso.responsable_nombre ?? ''}
                                            placeholder="Asignar responsable…"
                                            onBlur={e => actualizarResponsable(paso, e.target.value)}
                                            style={{
                                              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                              borderRadius: '5px', padding: '0.15rem 0.5rem',
                                              color: 'rgba(255,255,255,0.55)', fontSize: '0.68rem',
                                              outline: 'none', width: '140px', fontFamily: 'inherit',
                                            }}
                                            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(234,171,0,0.4)'; e.currentTarget.style.color = '#fff'; }}
                                            onBlurCapture={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
                                          />
                                        </div>
                                      </div>
                                      <button onClick={() => cambiarEstatusPaso(paso)}
                                        style={{
                                          padding: '0.2rem 0.6rem', borderRadius: '100px', fontSize: '0.62rem', fontWeight: 700,
                                          background: ps.bg, color: ps.color, border: `1px solid ${ps.color}30`,
                                          cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                                        }}>
                                        {ps.label}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Plan de trabajo ── */}
          {tabActivo === 'plan' && (
            <motion.div key="plan" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {!planGeneral ? (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '16px', padding: '3.5rem 2rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📋</div>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', margin: '0 0 0.3rem' }}>
                    Aún no se ha generado el plan de trabajo.
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', margin: 0 }}>
                    Usa el botón de la derecha para generarlo con IA.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                  {/* Resumen ejecutivo */}
                  <div style={{ background: 'rgba(234,171,0,0.05)', border: '1px solid rgba(234,171,0,0.15)', borderRadius: '14px', padding: '1.25rem 1.5rem' }}>
                    <p style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#EAAB00', margin: '0 0 0.6rem' }}>
                      Resumen ejecutivo
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: 1.7, margin: 0 }}>
                      {planGeneral.resumen_ejecutivo}
                    </p>
                  </div>

                  {/* Áreas involucradas */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.25rem 1.5rem' }}>
                    <p style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', margin: '0 0 0.75rem' }}>
                      Áreas involucradas
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {planGeneral.areas_involucradas.map((area, i) => (
                        <span key={i} style={{ padding: '0.3rem 0.8rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(96,165,250,0.1)', color: '#60A5FA', border: '1px solid rgba(96,165,250,0.2)' }}>
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Cronograma */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.25rem 1.5rem' }}>
                    <p style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', margin: '0 0 1rem' }}>
                      Cronograma de hitos
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {planGeneral.cronograma.map((item, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: '1rem', alignItems: 'start' }}>
                          <div style={{ textAlign: 'center', padding: '0.4rem', background: 'rgba(234,171,0,0.08)', border: '1px solid rgba(234,171,0,0.2)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.6rem', color: 'rgba(234,171,0,0.6)', fontWeight: 700, textTransform: 'uppercase' }}>Sem.</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#EAAB00', lineHeight: 1 }}>{item.semana}</div>
                          </div>
                          <div>
                            <p style={{ margin: '0 0 0.3rem', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }}>
                              {item.hito}
                            </p>
                            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                              {item.areas.map((a, ai) => (
                                <span key={ai} style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                                  {a}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Riesgos */}
                  {planGeneral.riesgos.length > 0 && (
                    <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '14px', padding: '1.25rem 1.5rem' }}>
                      <p style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(239,68,68,0.7)', margin: '0 0 0.75rem' }}>
                        Riesgos identificados
                      </p>
                      <ul style={{ margin: 0, padding: '0 0 0 1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {planGeneral.riesgos.map((r, i) => (
                          <li key={i} style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* ── Columna derecha ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Generar plan IA — solo visible si aún no existe */}
          {!planGeneral && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.25rem' }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', margin: '0 0 0.75rem' }}>
                Plan de trabajo IA
              </p>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', margin: '0 0 1rem', lineHeight: 1.5 }}>
                Genera automáticamente el plan de trabajo y los pasos de cada tarea.
              </p>

              <AnimatePresence>
                {errorPlan && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ fontSize: '0.72rem', color: '#FCA5A5', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '0.5rem 0.75rem', margin: '0 0 0.75rem' }}>
                    {errorPlan}
                  </motion.p>
                )}
              </AnimatePresence>

              <button onClick={generarPlan} disabled={generandoPlan || tareas.length === 0}
                style={{
                  width: '100%', padding: '0.7rem', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700,
                  background: generandoPlan ? 'rgba(234,171,0,0.06)' : 'rgba(234,171,0,0.12)',
                  color: tareas.length === 0 ? 'rgba(255,255,255,0.2)' : '#EAAB00',
                  border: `1px solid ${tareas.length === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(234,171,0,0.3)'}`,
                  cursor: generandoPlan || tareas.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                {generandoPlan ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{ width: '14px', height: '14px', border: '2px solid rgba(234,171,0,0.2)', borderTopColor: '#EAAB00', borderRadius: '50%' }} />
                    Generando…
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '1rem' }}>✦</span>
                    Generar plan
                  </>
                )}
              </button>
              {tareas.length === 0 && (
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', margin: '0.5rem 0 0', textAlign: 'center' }}>
                  Agrega tareas al oficio primero
                </p>
              )}
            </div>
          )}

          {/* Progreso circular */}
          {total > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
              <svg viewBox="0 0 80 80" width="80" height="80" style={{ margin: '0 auto', display: 'block' }}>
                <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
                <circle cx="40" cy="40" r="32" fill="none" stroke={sStyle.color} strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - progreso / 100)}`}
                  strokeLinecap="round" transform="rotate(-90 40 40)"
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
                <text x="40" y="44" textAnchor="middle" fill="white" fontSize="16" fontWeight="800">{progreso}%</text>
              </svg>
              <p style={{ margin: '0.75rem 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                {concluidas} de {total} tareas concluidas
              </p>
            </div>
          )}

          {/* Datos clave */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.25rem' }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', margin: '0 0 1rem' }}>
              Información
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <InfoRow label="Número"     value={oficio.numero_oficio} />
              <InfoRow label="Recepción"  value={fmtDate(oficio.fecha_recepcion)} />
              <InfoRow label="Plazo"      value={`${oficio.plazo_dias_habiles} días hábiles`} />
              {oficio.prorroga_dias > 0 && (
                <InfoRow label="Prórroga" value={`+${oficio.prorroga_dias} días`} />
              )}
              <InfoRow label="Vencimiento" value={fmtDate(oficio.fecha_vencimiento)} highlight />
              <InfoRow label="Estatus"    value={eStyle.label} color={eStyle.color} />
            </div>
          </div>

          {/* PDF link */}
          {oficio.pdf_url && (
            <a
              href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/authenticated/oficios-pdfs/${oficio.pdf_url}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'center',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '10px', padding: '0.65rem', fontSize: '0.78rem', fontWeight: 600,
                color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.07)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)'; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
              {oficio.pdf_nombre ?? 'Ver PDF original'}
            </a>
          )}

          {/* Marcar cumplido */}
          {oficio.estatus !== 'cumplido' && (
            <div>
              <AnimatePresence>
                {!confirmCumplido ? (
                  <motion.button key="btn" exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setConfirmCumplido(true)}
                    style={{
                      width: '100%', padding: '0.7rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700,
                      background: 'rgba(16,185,129,0.1)', color: '#10B981',
                      border: '1px solid rgba(16,185,129,0.25)', cursor: 'pointer',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    Marcar como cumplido
                  </motion.button>
                ) : (
                  <motion.div key="confirm" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', margin: '0 0 0.75rem' }}>
                      ¿Confirmas que el oficio fue atendido y enviado a la CNBV?
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => setConfirmCumplido(false)}
                        style={{ flex: 1, padding: '0.5rem', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: 'none', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer' }}>
                        Cancelar
                      </button>
                      <button onClick={marcarCumplido}
                        style={{ flex: 1, padding: '0.5rem', background: 'rgba(16,185,129,0.2)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                        Sí, cumplido
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {oficio.estatus === 'cumplido' && (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>✓</div>
              <p style={{ color: '#10B981', fontWeight: 700, fontSize: '0.82rem', margin: 0 }}>Oficio cumplido</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-componentes ──────────────────────────────────────────
function Metrica({ label, value, color, extra }: { label: string; value: string; color?: string; extra?: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.2rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: color ?? 'rgba(255,255,255,0.8)' }}>
        {value}
      </div>
      {extra}
    </div>
  );
}

function InfoRow({ label, value, highlight, color }: { label: string; value: string; highlight?: boolean; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: color ?? (highlight ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.55)'), textAlign: 'right' }}>
        {value}
      </span>
    </div>
  );
}

