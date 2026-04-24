'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface SesionForm {
  comite_id: string;
  nombre: string;
  tipo: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  ubicacion: string;
  riesgos_identificados: string;
  es_publica: boolean;
}

const emptyForm = (comiteId: string): SesionForm => ({
  comite_id: comiteId,
  nombre: '',
  tipo: 'regular',
  fecha: '',
  hora_inicio: '',
  hora_fin: '',
  ubicacion: '',
  riesgos_identificados: '',
  es_publica: false,
});

const ESTADO_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  programada: { bg: '#dbeafe', color: '#1e40af', label: 'Programada' },
  realizada:  { bg: '#dcfce7', color: '#166534', label: 'Realizada' },
  cancelada:  { bg: '#fee2e2', color: '#991b1b', label: 'Cancelada' },
  pospuesta:  { bg: '#fef3c7', color: '#92400e', label: 'Pospuesta' },
};

function SesionesContent() {
  const searchParams = useSearchParams();
  const comiteIdParam = searchParams.get('comite') || '';

  const [sesiones, setSesiones] = useState<any[]>([]);
  const [comites, setComites] = useState<any[]>([]);
  const [selectedComite, setSelectedComite] = useState(comiteIdParam);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SesionForm>(emptyForm(comiteIdParam));
  const [formError, setFormError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchComites();
  }, []);

  useEffect(() => {
    fetchSesiones();
  }, [selectedComite]);

  const fetchComites = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('comites_maestro')
      .select('id, nombre')
      .eq('coordinador_amib_id', user.id)
      .eq('activo', true);
    setComites(data || []);
    if (!selectedComite && data && data.length > 0) {
      setSelectedComite(data[0].id);
    }
  };

  const fetchSesiones = async () => {
    if (!selectedComite) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('comites_sesiones')
      .select('*')
      .eq('comite_id', selectedComite)
      .order('fecha', { ascending: false });
    setSesiones(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const { error } = await supabase.from('comites_sesiones').insert([{
        ...form,
        comite_id: selectedComite,
        estado: 'programada',
      }]);
      if (error) throw error;
      setShowModal(false);
      setForm(emptyForm(selectedComite));
      fetchSesiones();
    } catch (err: any) {
      setFormError(err.message || 'Error al crear la sesión');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>Sesiones</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.3rem', fontSize: '0.95rem' }}>Programa y gestiona las sesiones de tus comités.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {comites.length > 1 && (
            <select
              value={selectedComite}
              onChange={e => setSelectedComite(e.target.value)}
              style={{ padding: '0.6rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', color: '#001F3F', background: 'white', cursor: 'pointer' }}
            >
              {comites.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          )}
          <button
            onClick={() => { setShowModal(true); setFormError(null); setForm(emptyForm(selectedComite)); }}
            style={{ background: '#001F3F', color: 'white', border: 'none', padding: '0.7rem 1.3rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.875rem' }}
          >
            + Nueva Sesión
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Cargando sesiones...</p>
      ) : sesiones.length === 0 ? (
        <div style={{ background: '#f8fafc', border: '2px dashed #e2e8f0', borderRadius: '16px', padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📅</div>
          <p style={{ color: '#64748b', fontWeight: 600 }}>No hay sesiones programadas.</p>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Crea la primera sesión para este comité.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sesiones.map((s, i) => {
            const estadoStyle = ESTADO_STYLE[s.estado] || ESTADO_STYLE['programada'];
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}
              >
                {/* Fecha destacada */}
                <div style={{ textAlign: 'center', minWidth: '60px', background: '#f8fafc', borderRadius: '10px', padding: '0.75rem 0.5rem' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#001F3F', lineHeight: 1 }}>
                    {new Date(s.fecha + 'T00:00:00').getDate()}
                  </div>
                  <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, marginTop: '0.2rem' }}>
                    {new Date(s.fecha + 'T00:00:00').toLocaleString('es-MX', { month: 'short' })}
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{s.nombre}</span>
                    <span style={{ background: estadoStyle.bg, color: estadoStyle.color, padding: '0.15rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 }}>
                      {estadoStyle.label}
                    </span>
                    <span style={{ background: '#f1f5f9', color: '#475569', padding: '0.15rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600, textTransform: 'capitalize' }}>
                      {s.tipo}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    {s.hora_inicio && (
                      <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        🕐 {s.hora_inicio}{s.hora_fin ? ` – ${s.hora_fin}` : ''}
                      </span>
                    )}
                    {s.ubicacion && (
                      <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        📍 {s.ubicacion}
                      </span>
                    )}
                  </div>
                  {s.riesgos_identificados && (
                    <div style={{ marginTop: '0.5rem', background: '#fef9ec', border: '1px solid #fde68a', borderRadius: '6px', padding: '0.4rem 0.75rem', fontSize: '0.78rem', color: '#92400e' }}>
                      ⚠️ {s.riesgos_identificados}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '580px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', margin: 'auto' }}
            >
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>Nueva Sesión</h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '2rem' }}>Define los detalles de la sesión del comité.</p>

              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.1rem' }}>
                <div style={{ display: 'grid', gap: '0.4rem' }}>
                  <label style={labelStyle}>Nombre de la Sesión *</label>
                  <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej. Sesión Ordinaria Q2 2026" style={inputStyle} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'grid', gap: '0.4rem' }}>
                    <label style={labelStyle}>Tipo *</label>
                    <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} style={inputStyle}>
                      <option value="regular">Regular</option>
                      <option value="extraordinaria">Extraordinaria</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gap: '0.4rem' }}>
                    <label style={labelStyle}>Fecha *</label>
                    <input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} style={inputStyle} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'grid', gap: '0.4rem' }}>
                    <label style={labelStyle}>Hora Inicio</label>
                    <input type="time" value={form.hora_inicio} onChange={e => setForm({ ...form, hora_inicio: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ display: 'grid', gap: '0.4rem' }}>
                    <label style={labelStyle}>Hora Fin</label>
                    <input type="time" value={form.hora_fin} onChange={e => setForm({ ...form, hora_fin: e.target.value })} style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '0.4rem' }}>
                  <label style={labelStyle}>Ubicación / Sala / URL</label>
                  <input value={form.ubicacion} onChange={e => setForm({ ...form, ubicacion: e.target.value })} placeholder="Ej. Sala B-302 o https://meet.google.com/..." style={inputStyle} />
                </div>

                <div style={{ display: 'grid', gap: '0.4rem' }}>
                  <label style={labelStyle}>Riesgos Identificados</label>
                  <textarea value={form.riesgos_identificados} onChange={e => setForm({ ...form, riesgos_identificados: e.target.value })} placeholder="Describe brevemente los riesgos conocidos para esta sesión..." style={{ ...inputStyle, height: '80px', resize: 'none' }} />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#475569' }}>
                  <input type="checkbox" checked={form.es_publica} onChange={e => setForm({ ...form, es_publica: e.target.checked })} />
                  <span>Sesión visible para todos los asociados del comité</span>
                </label>

                {formError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.85rem' }}>
                    {formError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setShowModal(false)} style={cancelBtnStyle}>Cancelar</button>
                  <button type="submit" disabled={saving} style={{ ...primaryBtnStyle, opacity: saving ? 0.7 : 1 }}>
                    {saving ? 'Guardando...' : 'Crear Sesión'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SesionesPage() {
  return (
    <Suspense fallback={<p style={{ color: '#94a3b8' }}>Cargando...</p>}>
      <SesionesContent />
    </Suspense>
  );
}

const labelStyle: React.CSSProperties = { fontSize: '0.82rem', fontWeight: 600, color: '#475569' };
const inputStyle: React.CSSProperties = {
  padding: '0.7rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1',
  fontSize: '0.875rem', background: 'white', color: '#0f172a', width: '100%', boxSizing: 'border-box',
};
const cancelBtnStyle: React.CSSProperties = {
  padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0',
  background: 'white', cursor: 'pointer', fontWeight: 600, color: '#475569', fontSize: '0.875rem',
};
const primaryBtnStyle: React.CSSProperties = {
  padding: '0.75rem 1.75rem', borderRadius: '8px', border: 'none',
  background: '#001F3F', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem',
};
