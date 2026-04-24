'use client';

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '@/components/portal/portal.module.css';

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatFecha(fecha: string): string {
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatHora(horaInicio: string, horaFin: string | null): string {
  const clean = (h: string) => h.substring(0, 5);
  return horaFin ? `${clean(horaInicio)} - ${clean(horaFin)} hrs` : `${clean(horaInicio)} hrs`;
}

function getStatusStyle(estado: string) {
  switch (estado) {
    case 'programada': return { bg: '#fef3c7', text: '#b45309' };
    case 'realizada':  return { bg: '#dcfce7', text: '#166534' };
    case 'cancelada':  return { bg: '#fee2e2', text: '#b91c1c' };
    default:           return { bg: '#f1f5f9', text: '#64748b' };
  }
}

// Genera un hash simple de confirmación (SHA-256 via Web Crypto API)
async function generarHash(userId: string, minutaId: string, timestamp: string): Promise<string> {
  const mensaje = `${userId}|${minutaId}|${timestamp}|AMIB`;
  const encoder = new TextEncoder();
  const data = encoder.encode(mensaje);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Componente ───────────────────────────────────────────────────────────────

export default function ComitesPage() {
  const [user, setUser] = useState<any>(null);
  const [sesiones, setSesiones] = useState<any[]>([]);
  const [minutasPendientes, setMinutasPendientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMinuta, setViewMinuta] = useState<any>(null);
  const [viewMinutaAcuerdos, setViewMinutaAcuerdos] = useState<any[]>([]);
  const [loadingAcuerdos, setLoadingAcuerdos] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState<string[]>([]);
  const [confirmModal, setConfirmModal] = useState<any>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const init = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);
      if (u) {
        await Promise.all([fetchSesiones(u.id), fetchMinutasPendientes(u.id)]);
      }
      setLoading(false);
    };
    init();
  }, []);

  const fetchSesiones = async (userId: string) => {
    const { data } = await supabase
      .from('comites_sesiones')
      .select('*')
      .or(`asociado_id.eq.${userId},es_publica.eq.true`)
      .order('fecha', { ascending: false });
    setSesiones(data || []);
  };

  const fetchMinutasPendientes = async (userId: string) => {
    // Minutas en estado pendiente_firmas que el usuario aún no ha firmado
    const { data: todasMinutas } = await supabase
      .from('minutas')
      .select(`
        *,
        sesion:sesion_id(nombre, fecha, comite_id),
        firmas:comites_firmas(usuario_id)
      `)
      .eq('estado_firma', 'pendiente_firmas');

    if (!todasMinutas) { setMinutasPendientes([]); return; }

    // Filtrar las que el usuario no ha firmado aún
    const pendientes = todasMinutas.filter((m: any) =>
      !m.firmas?.some((f: any) => f.usuario_id === userId)
    );
    setMinutasPendientes(pendientes);

    // Registrar cuáles ya firmó el usuario (de las completadas)
    const { data: firmadas } = await supabase
      .from('comites_firmas')
      .select('minuta_id')
      .eq('usuario_id', userId);
    setSigned((firmadas || []).map((f: any) => f.minuta_id));
  };

  const openMinuta = async (m: any) => {
    setViewMinuta(m);
    setLoadingAcuerdos(true);
    const { data } = await supabase
      .from('comites_acuerdos')
      .select('*')
      .eq('minuta_id', m.id)
      .order('created_at', { ascending: true });
    setViewMinutaAcuerdos(data || []);
    setLoadingAcuerdos(false);
  };

  const firmarMinuta = async (minuta: any) => {
    if (!user) return;
    setSigning(true);
    try {
      const timestamp = new Date().toISOString();
      const hash = await generarHash(user.id, minuta.id, timestamp);

      const { error } = await supabase.from('comites_firmas').insert([{
        minuta_id: minuta.id,
        usuario_id: user.id,
        fecha_firma: timestamp,
        hash_firma: hash,
        ip_firma: 'client', // En producción, obtener la IP del servidor
      }]);

      if (error) throw error;

      // Verificar si ya firmaron todos los miembros del comité y actualizar estado
      setSigned(prev => [...prev, minuta.id]);
      setMinutasPendientes(prev => prev.filter(m => m.id !== minuta.id));
      setViewMinuta(null);
      setConfirmModal(null);
    } catch (err) {
      console.error('Error al firmar:', err);
    } finally {
      setSigning(false);
    }
  };

  const programadas = sesiones.filter(s => s.estado === 'programada').length;
  const proximaSesion = sesiones.find(s => s.estado === 'programada') ?? null;

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.eyebrow}>Gestión Institucional</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className={styles.pageTitle}>Calendario de Comités</h1>
            <p className={styles.pageDesc}>Monitoreo de sesiones y firma digital de minutas.</p>
          </div>
        </div>
      </div>

      {/* ── Minutas Pendientes de Firma ─────────────────────────── */}
      {!loading && minutasPendientes.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#dc2626', animation: 'pulse 2s infinite' }} />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              Minutas Pendientes de tu Firma
              <span style={{ marginLeft: '0.6rem', background: '#dc2626', color: 'white', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800, padding: '0.1rem 0.5rem' }}>
                {minutasPendientes.length}
              </span>
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {minutasPendientes.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{
                  background: 'linear-gradient(135deg, #001F3F 0%, #002b5c 100%)',
                  borderRadius: '14px',
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  flexWrap: 'wrap',
                  border: '1px solid rgba(234,171,0,0.25)',
                  boxShadow: '0 4px 20px rgba(0,31,63,0.25)',
                }}
              >
                <div style={{ background: 'rgba(234,171,0,0.15)', borderRadius: '10px', padding: '0.75rem', color: '#EAAB00' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>{m.titulo}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)' }}>
                    {m.sesion?.nombre && `📋 ${m.sesion.nombre}`}
                    {m.sesion?.fecha && ` · 🗓 ${formatFecha(m.sesion.fecha)}`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', flexShrink: 0 }}>
                  <button
                    onClick={() => openMinuta(m)}
                    style={{ padding: '0.55rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}
                  >
                    Revisar
                  </button>
                  <button
                    onClick={() => setConfirmModal(m)}
                    style={{ padding: '0.55rem 1.1rem', borderRadius: '8px', border: 'none', background: '#EAAB00', color: '#001F3F', cursor: 'pointer', fontWeight: 800, fontSize: '0.82rem' }}
                  >
                    ✍️ Firmar
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className={styles.statGrid}>
        <div className={styles.summaryCard} style={{ background: '#0a1628', color: 'white' }}>
          <div style={{ background: 'rgba(234,171,0,0.1)', color: '#EAAB00', padding: '0.75rem', borderRadius: '12px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{programadas}</div>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.6, fontWeight: 700, letterSpacing: '0.05em' }}>Sesiones Programadas</div>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div style={{ background: '#dcfce7', color: '#166534', padding: '0.75rem', borderRadius: '12px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 11 12 14 22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>{signed.length}</div>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>Minutas Firmadas</div>
          </div>
        </div>

        {proximaSesion && (
          <div className={styles.summaryCard} style={{ background: '#f8fafc' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#b45309', fontWeight: 800, marginBottom: '0.25rem' }}>Próxima Sesión</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{proximaSesion.nombre}</div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.35rem' }}>
                {formatFecha(proximaSesion.fecha)}
                {proximaSesion.hora_inicio && ` · ${formatHora(proximaSesion.hora_inicio, proximaSesion.hora_fin)}`}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de sesiones */}
      <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>
            Historial de Sesiones
            <span style={{ marginLeft: '0.75rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', background: '#e2e8f0', padding: '0.2rem 0.6rem', borderRadius: '100px' }}>
              {sesiones.length} registros
            </span>
          </h2>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Cargando sesiones...</div>
        ) : sesiones.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
            <p style={{ fontWeight: 600 }}>No hay sesiones registradas</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Las sesiones aparecerán aquí una vez sean creadas.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '580px' }}>
              <thead>
                <tr style={{ background: '#0a1628', color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Comité</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Fecha y Hora</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Estado</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Rol</th>
                </tr>
              </thead>
              <tbody>
                {sesiones.map(s => {
                  const statusStyle = getStatusStyle(s.estado);
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem' }}>{s.nombre}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem', textTransform: 'capitalize' }}>{s.tipo}</div>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ fontWeight: 700, color: '#475569', fontSize: '0.9rem' }}>{formatFecha(s.fecha)}</div>
                        {s.hora_inicio && <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{formatHora(s.hora_inicio, s.hora_fin)}</div>}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <span style={{ background: statusStyle.bg, color: statusStyle.text, padding: '0.3rem 0.6rem', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                          • {s.estado}
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', color: '#475569', fontSize: '0.9rem', textTransform: 'capitalize', fontWeight: 600 }}>
                        {s.rol_asociado === 'presidente' && '⭐ '}
                        {s.rol_asociado}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', fontSize: '0.8rem', color: '#94a3b8' }}>
          Total: {sesiones.length} sesiones · Minutas firmadas: {signed.length}
        </div>
      </div>

      {/* ── Modal: Ver Minuta Completa ─────────────────────────── */}
      <AnimatePresence>
        {viewMinuta && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}
            onClick={e => { if (e.target === e.currentTarget) setViewMinuta(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '700px', maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 30px 60px rgba(0,0,0,0.25)', margin: 'auto' }}
            >
              {/* Membrete Institucional */}
              <div style={{ textAlign: 'center', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '2px solid #e2e8f0' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#001F3F', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#EAAB00', fontWeight: 900, fontSize: '1.4rem' }}>A</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#EAAB00', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  AMIB · Gobierno Corporativo
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#001F3F' }}>{viewMinuta.titulo}</h2>
                <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  {viewMinuta.sesion?.nombre && <span style={{ fontSize: '0.82rem', color: '#64748b' }}>📋 {viewMinuta.sesion.nombre}</span>}
                  {viewMinuta.sesion?.fecha && <span style={{ fontSize: '0.82rem', color: '#64748b' }}>🗓 {formatFecha(viewMinuta.sesion.fecha)}</span>}
                </div>
              </div>

              {/* Contenido */}
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.85, color: '#374151', fontSize: '0.925rem', marginBottom: '2rem', minHeight: '100px' }}>
                {viewMinuta.cuerpo_minuta?.texto || 'El responsable del comité aún no ha agregado el contenido de la minuta.'}
              </div>

              {/* Acuerdos de la Minuta */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ background: '#001F3F', color: '#EAAB00', borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Acuerdos</span>
                  Compromisos de esta Sesión
                </h3>
                {loadingAcuerdos ? (
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Cargando acuerdos...</p>
                ) : viewMinutaAcuerdos.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>No se registraron acuerdos para esta minuta.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {viewMinutaAcuerdos.map((a: any, idx: number) => {
                      const estadoColors: Record<string, { bg: string; color: string }> = {
                        abierto:    { bg: '#fee2e2', color: '#991b1b' },
                        en_proceso: { bg: '#fef3c7', color: '#92400e' },
                        cerrado:    { bg: '#dcfce7', color: '#166534' },
                      };
                      const ec = estadoColors[a.estado] || estadoColors.abierto;
                      return (
                        <div key={a.id} style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start', padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                          <div style={{ minWidth: '22px', height: '22px', borderRadius: '50%', background: '#001F3F', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0, marginTop: '1px' }}>
                            {idx + 1}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#0f172a', lineHeight: 1.55 }}>{a.descripcion}</p>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                              {a.fecha_limite && (
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>📅 Límite: {new Date(a.fecha_limite + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              )}
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, background: ec.bg, color: ec.color, padding: '0.1rem 0.5rem', borderRadius: '999px' }}>
                                {a.estado.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Aviso Legal */}
              <div style={{ background: '#fef9ec', border: '1px solid #fde68a', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.8rem', color: '#92400e', margin: 0, lineHeight: 1.6 }}>
                  <strong>⚠️ Aviso:</strong> Al firmar esta minuta, confirmas que has leído y estás de acuerdo con su contenido. Tu firma digital (con registro de fecha, hora e identificador único) quedará vinculada a este documento de manera permanente.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setViewMinuta(null)} style={cancelBtnStyle}>Cerrar</button>
                <button onClick={() => { setConfirmModal(viewMinuta); setViewMinuta(null); }} style={primaryBtnStyle}>
                  ✍️ Proceder a Firmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal: Confirmación de Firma Digital ───────────────── */}
      <AnimatePresence>
        {confirmModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '460px', textAlign: 'center', boxShadow: '0 30px 60px rgba(0,0,0,0.3)' }}
            >
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #001F3F, #003875)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.75rem' }}>
                ✍️
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
                Confirmar Firma Digital
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '0.5rem' }}>
                Estás a punto de firmar digitalmente:
              </p>
              <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{confirmModal.titulo}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                  {confirmModal.sesion?.nombre}
                </div>
              </div>
              <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#166534' }}>Firma Criptográfica</div>
                  <div style={{ fontSize: '0.72rem', color: '#4ade80' }}>Se generará un hash SHA-256 con tu ID y timestamp.</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setConfirmModal(null)} style={{ ...cancelBtnStyle, flex: 1 }}>Cancelar</button>
                <button
                  onClick={() => firmarMinuta(confirmModal)}
                  disabled={signing}
                  style={{ ...primaryBtnStyle, flex: 1, opacity: signing ? 0.7 : 1 }}
                >
                  {signing ? 'Firmando...' : '✍️ Firmar Ahora'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
}

const cancelBtnStyle: React.CSSProperties = {
  padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0',
  background: 'white', cursor: 'pointer', fontWeight: 600, color: '#475569', fontSize: '0.875rem',
};
const primaryBtnStyle: React.CSSProperties = {
  padding: '0.75rem 1.75rem', borderRadius: '8px', border: 'none',
  background: '#001F3F', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem',
};
