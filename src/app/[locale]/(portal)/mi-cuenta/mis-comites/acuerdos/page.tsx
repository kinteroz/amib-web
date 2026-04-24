'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const ESTADO_ACUERDO: Record<string, { bg: string; color: string; label: string; icon: string }> = {
  abierto:    { bg: '#fee2e2', color: '#991b1b', label: 'Abierto',      icon: '🔴' },
  en_proceso: { bg: '#fef3c7', color: '#92400e', label: 'En Proceso',   icon: '🟡' },
  cerrado:    { bg: '#dcfce7', color: '#166534', label: 'Cerrado',       icon: '🟢' },
};

interface AcuerdoForm {
  minuta_id: string;
  descripcion: string;
  responsable_id: string;
  fecha_limite: string;
  estado: string;
}

const emptyForm: AcuerdoForm = {
  minuta_id: '',
  descripcion: '',
  responsable_id: '',
  fecha_limite: '',
  estado: 'abierto',
};

function AcuerdosContent() {
  const searchParams = useSearchParams();
  const comiteIdParam = searchParams.get('comite') || '';

  const [acuerdos, setAcuerdos] = useState<any[]>([]);
  const [minutas, setMinutas] = useState<any[]>([]);
  const [miembros, setMiembros] = useState<any[]>([]);
  const [comites, setComites] = useState<any[]>([]);
  const [selectedComite, setSelectedComite] = useState(comiteIdParam);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AcuerdoForm>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [filterEstado, setFilterEstado] = useState<string>('todos');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => { fetchComites(); }, []);
  useEffect(() => { if (selectedComite) { fetchData(); } }, [selectedComite]);

  const fetchComites = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('comites_maestro').select('id, nombre')
      .eq('coordinador_amib_id', user.id).eq('activo', true);
    setComites(data || []);
    if (!selectedComite && data && data.length > 0) setSelectedComite(data[0].id);
  };

  const fetchData = async () => {
    setLoading(true);
    // Minutas del comité
    const { data: sesionesData } = await supabase
      .from('comites_sesiones').select('id').eq('comite_id', selectedComite);
    const sesionIds = (sesionesData || []).map((s: any) => s.id);

    if (sesionIds.length > 0) {
      const { data: minutasData } = await supabase
        .from('minutas').select('id, titulo').in('sesion_id', sesionIds);
      setMinutas(minutasData || []);

      const minutaIds = (minutasData || []).map((m: any) => m.id);
      if (minutaIds.length > 0) {
        const { data: acuerdosData } = await supabase
          .from('comites_acuerdos')
          .select('*, minuta:minuta_id(titulo)')
          .in('minuta_id', minutaIds)
          .order('fecha_limite', { ascending: true });
        setAcuerdos(acuerdosData || []);
      } else {
        setAcuerdos([]);
      }
    } else {
      setMinutas([]);
      setAcuerdos([]);
    }

    // Miembros del comité
    const { data: miembrosData } = await supabase
      .from('comites_miembros')
      .select('usuario_id, rol_comite')
      .eq('comite_id', selectedComite);
    setMiembros(miembrosData || []);

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const payload: any = {
        minuta_id: form.minuta_id,
        descripcion: form.descripcion,
        estado: form.estado,
      };
      if (form.responsable_id) payload.responsable_id = form.responsable_id;
      if (form.fecha_limite) payload.fecha_limite = form.fecha_limite;

      const { error } = await supabase.from('comites_acuerdos').insert([payload]);
      if (error) throw error;
      setShowModal(false);
      setForm(emptyForm);
      fetchData();
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar el acuerdo');
    } finally {
      setSaving(false);
    }
  };

  const cambiarEstado = async (id: string, nuevoEstado: string) => {
    await supabase.from('comites_acuerdos').update({ estado: nuevoEstado }).eq('id', id);
    fetchData();
  };

  const acuerdosFiltrados = filterEstado === 'todos'
    ? acuerdos
    : acuerdos.filter(a => a.estado === filterEstado);

  const stats = {
    total: acuerdos.length,
    abiertos: acuerdos.filter(a => a.estado === 'abierto').length,
    enProceso: acuerdos.filter(a => a.estado === 'en_proceso').length,
    cerrados: acuerdos.filter(a => a.estado === 'cerrado').length,
  };

  const estaVencido = (fechaLimite: string) => {
    if (!fechaLimite) return false;
    return new Date(fechaLimite) < new Date() && true;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>Acuerdos y Compromisos</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.3rem', fontSize: '0.95rem' }}>Seguimiento de acuerdos generados en las minutas.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {comites.length > 1 && (
            <select value={selectedComite} onChange={e => setSelectedComite(e.target.value)} style={selectStyle}>
              {comites.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          )}
          <button onClick={() => { setShowModal(true); setFormError(null); setForm(emptyForm); }} style={primaryBtnStyle}>
            + Nuevo Acuerdo
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total', value: stats.total, color: '#001F3F' },
          { label: 'Abiertos', value: stats.abiertos, color: '#991b1b' },
          { label: 'En Proceso', value: stats.enProceso, color: '#92400e' },
          { label: 'Cerrados', value: stats.cerrados, color: '#166534' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem 1.5rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['todos', 'abierto', 'en_proceso', 'cerrado'].map(f => (
          <button
            key={f}
            onClick={() => setFilterEstado(f)}
            style={{
              padding: '0.4rem 0.9rem', borderRadius: '999px', border: '1px solid',
              cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
              background: filterEstado === f ? '#001F3F' : 'white',
              color: filterEstado === f ? 'white' : '#64748b',
              borderColor: filterEstado === f ? '#001F3F' : '#e2e8f0',
            }}
          >
            {f === 'todos' ? 'Todos' : ESTADO_ACUERDO[f]?.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Cargando acuerdos...</p>
      ) : acuerdosFiltrados.length === 0 ? (
        <div style={{ background: '#f8fafc', border: '2px dashed #e2e8f0', borderRadius: '16px', padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>☑️</div>
          <p style={{ color: '#64748b', fontWeight: 600 }}>No hay acuerdos{filterEstado !== 'todos' ? ` con estado "${ESTADO_ACUERDO[filterEstado]?.label}"` : ''}.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {acuerdosFiltrados.map((a, i) => {
            const estado = ESTADO_ACUERDO[a.estado] || ESTADO_ACUERDO.abierto;
            const vencido = a.estado !== 'cerrado' && estaVencido(a.fecha_limite);
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{
                  background: 'white', borderRadius: '12px',
                  border: `1px solid ${vencido ? '#fca5a5' : '#e2e8f0'}`,
                  padding: '1.25rem 1.5rem',
                  display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>{a.descripcion}</span>
                    <span style={{ background: estado.bg, color: estado.color, padding: '0.15rem 0.65rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 }}>
                      {estado.icon} {estado.label}
                    </span>
                    {vencido && (
                      <span style={{ background: '#fee2e2', color: '#991b1b', padding: '0.15rem 0.65rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 }}>
                        ⚠️ Vencido
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>📋 {a.minuta?.titulo}</span>
                    {a.fecha_limite && (
                      <span style={{ fontSize: '0.78rem', color: vencido ? '#dc2626' : '#64748b', fontWeight: vencido ? 700 : 400 }}>
                        📅 {new Date(a.fecha_limite + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Cambiar estado rápido */}
                <select
                  value={a.estado}
                  onChange={e => cambiarEstado(a.id, e.target.value)}
                  style={{ padding: '0.4rem 0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', color: '#001F3F', background: 'white', cursor: 'pointer' }}
                >
                  <option value="abierto">Abierto</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="cerrado">Cerrado</option>
                </select>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal Nuevo Acuerdo */}
      <AnimatePresence>
        {showModal && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '560px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}
            >
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>Nuevo Acuerdo</h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '2rem' }}>Vincula el acuerdo a una minuta y asigna un responsable.</p>

              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.1rem' }}>
                <div style={{ display: 'grid', gap: '0.4rem' }}>
                  <label style={labelStyle}>Minuta asociada *</label>
                  <select value={form.minuta_id} onChange={e => setForm({ ...form, minuta_id: e.target.value })} style={inputStyle} required>
                    <option value="">Selecciona la minuta...</option>
                    {minutas.map(m => <option key={m.id} value={m.id}>{m.titulo}</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gap: '0.4rem' }}>
                  <label style={labelStyle}>Descripción del Acuerdo *</label>
                  <textarea
                    value={form.descripcion}
                    onChange={e => setForm({ ...form, descripcion: e.target.value })}
                    placeholder="Describe el acuerdo o compromiso alcanzado..."
                    style={{ ...inputStyle, height: '100px', resize: 'none' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'grid', gap: '0.4rem' }}>
                    <label style={labelStyle}>Fecha Límite</label>
                    <input type="date" value={form.fecha_limite} onChange={e => setForm({ ...form, fecha_limite: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ display: 'grid', gap: '0.4rem' }}>
                    <label style={labelStyle}>Estado inicial</label>
                    <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} style={inputStyle}>
                      <option value="abierto">Abierto</option>
                      <option value="en_proceso">En Proceso</option>
                    </select>
                  </div>
                </div>

                {formError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.85rem' }}>
                    {formError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowModal(false)} style={cancelBtnStyle}>Cancelar</button>
                  <button type="submit" disabled={saving} style={{ ...primaryBtnStyle, opacity: saving ? 0.7 : 1 }}>
                    {saving ? 'Guardando...' : 'Crear Acuerdo'}
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

export default function AcuerdosPage() {
  return (
    <Suspense fallback={<p style={{ color: '#94a3b8' }}>Cargando...</p>}>
      <AcuerdosContent />
    </Suspense>
  );
}

const labelStyle: React.CSSProperties = { fontSize: '0.82rem', fontWeight: 600, color: '#475569' };
const inputStyle: React.CSSProperties = {
  padding: '0.7rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1',
  fontSize: '0.875rem', background: 'white', color: '#0f172a', width: '100%', boxSizing: 'border-box',
};
const selectStyle: React.CSSProperties = {
  padding: '0.6rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1',
  fontSize: '0.875rem', color: '#001F3F', background: 'white', cursor: 'pointer',
};
const cancelBtnStyle: React.CSSProperties = {
  padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0',
  background: 'white', cursor: 'pointer', fontWeight: 600, color: '#475569', fontSize: '0.875rem',
};
const primaryBtnStyle: React.CSSProperties = {
  padding: '0.75rem 1.75rem', borderRadius: '8px', border: 'none',
  background: '#001F3F', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem',
};
