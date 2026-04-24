'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const ESTADO_FIRMA: Record<string, { bg: string; color: string; label: string; icon: string }> = {
  borrador:          { bg: '#f1f5f9', color: '#64748b', label: 'Borrador',          icon: '✏️' },
  pendiente_firmas:  { bg: '#fef3c7', color: '#92400e', label: 'Pend. Firmas',      icon: '⏳' },
  completada:        { bg: '#dcfce7', color: '#166534', label: 'Firmada',            icon: '✅' },
};

interface MinutaForm {
  sesion_id: string;
  titulo: string;
  cuerpo_minuta: string;
}

function MinutasContent() {
  const searchParams = useSearchParams();
  const comiteIdParam = searchParams.get('comite') || '';

  const [minutas, setMinutas] = useState<any[]>([]);
  const [sesiones, setSesiones] = useState<any[]>([]);
  const [comites, setComites] = useState<any[]>([]);
  const [selectedComite, setSelectedComite] = useState(comiteIdParam);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [requestingFirmas, setRequestingFirmas] = useState(false);
  const [form, setForm] = useState<MinutaForm>({ sesion_id: '', titulo: '', cuerpo_minuta: '' });
  const [formError, setFormError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchComites();
  }, []);

  useEffect(() => {
    if (selectedComite) {
      fetchSesiones();
      fetchMinutas();
    }
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
    if (!selectedComite && data && data.length > 0) setSelectedComite(data[0].id);
  };

  const fetchSesiones = async () => {
    const { data } = await supabase
      .from('comites_sesiones')
      .select('id, nombre, fecha')
      .eq('comite_id', selectedComite)
      .order('fecha', { ascending: false });
    setSesiones(data || []);
  };

  const fetchMinutas = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('minutas')
      .select(`
        *,
        sesion:sesion_id(nombre, fecha, comite_id),
        firmas:comites_firmas(count)
      `)
      .order('fecha_subida', { ascending: false });

    // Filter by comite after fetch (we join sesion which has comite_id)
    const filtered = (data || []).filter(
      (m: any) => m.sesion?.comite_id === selectedComite
    );
    setMinutas(filtered);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const { error } = await supabase.from('minutas').insert([{
        sesion_id: form.sesion_id,
        titulo: form.titulo,
        cuerpo_minuta: { texto: form.cuerpo_minuta },
        archivo_url: '#',
        estado_firma: 'borrador',
      }]);
      if (error) throw error;
      setShowModal(false);
      setForm({ sesion_id: '', titulo: '', cuerpo_minuta: '' });
      fetchMinutas();
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const solicitarFirmas = async (minutaId: string) => {
    setRequestingFirmas(true);
    await supabase.from('minutas').update({ estado_firma: 'pendiente_firmas' }).eq('id', minutaId);
    fetchMinutas();
    setRequestingFirmas(false);
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>Minutas</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.3rem', fontSize: '0.95rem' }}>Redacta, gestiona y solicita firmas digitales.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {comites.length > 1 && (
            <select value={selectedComite} onChange={e => setSelectedComite(e.target.value)} style={selectStyle}>
              {comites.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          )}
          <button onClick={() => { setShowModal(true); setFormError(null); }} style={primaryBtnStyle}>
            + Nueva Minuta
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Cargando minutas...</p>
      ) : minutas.length === 0 ? (
        <div style={{ background: '#f8fafc', border: '2px dashed #e2e8f0', borderRadius: '16px', padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📋</div>
          <p style={{ color: '#64748b', fontWeight: 600 }}>No hay minutas para este comité.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {minutas.map((m, i) => {
            const estado = ESTADO_FIRMA[m.estado_firma] || ESTADO_FIRMA.borrador;
            const firmasCount = m.firmas?.[0]?.count ?? 0;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{m.titulo}</span>
                    <span style={{ background: estado.bg, color: estado.color, padding: '0.15rem 0.65rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 }}>
                      {estado.icon} {estado.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>📋 {m.sesion?.nombre}</span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>🗓 {m.sesion?.fecha}</span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>✍️ {firmasCount} firma{firmasCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', flexShrink: 0 }}>
                  <button
                    onClick={() => setShowViewModal(m)}
                    style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', color: '#475569' }}
                  >
                    Ver
                  </button>
                  {m.estado_firma === 'borrador' && (
                    <button
                      onClick={() => solicitarFirmas(m.id)}
                      disabled={requestingFirmas}
                      style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: '#001F3F', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
                    >
                      Solicitar Firmas
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal Crear Minuta */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '620px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>Nueva Minuta</h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '2rem' }}>Redacta el contenido de la minuta. Podrás solicitar firmas al finalizar.</p>

              <form onSubmit={handleCreate} style={{ display: 'grid', gap: '1.1rem' }}>
                <div style={{ display: 'grid', gap: '0.4rem' }}>
                  <label style={labelStyle}>Sesión asociada *</label>
                  <select value={form.sesion_id} onChange={e => setForm({ ...form, sesion_id: e.target.value })} style={inputStyle} required>
                    <option value="">Selecciona la sesión...</option>
                    {sesiones.map(s => (
                      <option key={s.id} value={s.id}>{s.nombre} — {s.fecha}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'grid', gap: '0.4rem' }}>
                  <label style={labelStyle}>Título de la Minuta *</label>
                  <input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Ej. Minuta Sesión Ordinaria Q2 2026" style={inputStyle} required />
                </div>
                <div style={{ display: 'grid', gap: '0.4rem' }}>
                  <label style={labelStyle}>Cuerpo de la Minuta</label>
                  <textarea
                    value={form.cuerpo_minuta}
                    onChange={e => setForm({ ...form, cuerpo_minuta: e.target.value })}
                    placeholder="Redacta los puntos tratados, resoluciones y acuerdos de la sesión..."
                    style={{ ...inputStyle, height: '200px', resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>
                {formError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.85rem' }}>{formError}</div>
                )}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowModal(false)} style={cancelBtnStyle}>Cancelar</button>
                  <button type="submit" disabled={saving} style={{ ...primaryBtnStyle, opacity: saving ? 0.7 : 1 }}>
                    {saving ? 'Guardando...' : 'Guardar como Borrador'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Ver Minuta */}
      <AnimatePresence>
        {showViewModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            onClick={e => { if (e.target === e.currentTarget) setShowViewModal(null); }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '700px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}
            >
              {/* Membrete */}
              <div style={{ textAlign: 'center', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '2px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#EAAB00', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  AMIB · Gobierno Corporativo
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#001F3F', marginBottom: '0.5rem' }}>{showViewModal.titulo}</h2>
                <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>📋 {showViewModal.sesion?.nombre}</span>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>🗓 {showViewModal.sesion?.fecha}</span>
                </div>
              </div>

              {/* Cuerpo */}
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: '#374151', fontSize: '0.9rem', marginBottom: '2rem' }}>
                {showViewModal.cuerpo_minuta?.texto || 'Sin contenido.'}
              </div>

              {/* Estado de Firmas */}
              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  ✍️ Estado de Firmas
                </div>
                {(() => {
                  const estado = ESTADO_FIRMA[showViewModal.estado_firma] || ESTADO_FIRMA.borrador;
                  return (
                    <span style={{ background: estado.bg, color: estado.color, padding: '0.3rem 0.9rem', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 700 }}>
                      {estado.icon} {estado.label}
                    </span>
                  );
                })()}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button onClick={() => setShowViewModal(null)} style={cancelBtnStyle}>Cerrar</button>
                {showViewModal.estado_firma === 'borrador' && (
                  <button
                    onClick={async () => { await solicitarFirmas(showViewModal.id); setShowViewModal(null); }}
                    style={primaryBtnStyle}
                  >
                    Solicitar Firmas Digitales
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MinutasPage() {
  return (
    <Suspense fallback={<p style={{ color: '#94a3b8' }}>Cargando...</p>}>
      <MinutasContent />
    </Suspense>
  );
}

const labelStyle: React.CSSProperties = { fontSize: '0.82rem', fontWeight: 600, color: '#475569' };
const inputStyle: React.CSSProperties = {
  padding: '0.7rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1',
  fontSize: '0.875rem', background: 'white', color: '#0f172a', width: '100%', boxSizing: 'border-box',
};
const selectStyle: React.CSSProperties = {
  padding: '0.6rem 0.9rem', borderRadius: '8px', border: '1px solid #e2e8f0',
  fontSize: '0.875rem', color: '#0f172a', background: 'white',
};
const cancelBtnStyle: React.CSSProperties = {
  padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0',
  background: 'white', cursor: 'pointer', fontWeight: 600, color: '#475569', fontSize: '0.875rem',
};
const primaryBtnStyle: React.CSSProperties = {
  padding: '0.75rem 1.75rem', borderRadius: '8px', border: 'none',
  background: '#001F3F', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem',
};
