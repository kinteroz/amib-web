'use client';

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { motion, AnimatePresence } from 'framer-motion';

interface ComiteForm {
  nombre: string;
  area_responsable: string;
  objetivo: string;
  coordinador_amib_id: string;
}

const emptyForm: ComiteForm = {
  nombre: '',
  area_responsable: '',
  objetivo: '',
  coordinador_amib_id: '',
};

export default function AdminComites() {
  const [comites, setComites] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ComiteForm>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchComites();
    fetchPotentialCoordinators();
  }, []);

  const fetchComites = async () => {
    const { data, error } = await supabase
      .from('comites_maestro')
      .select('*, coordinador:coordinador_amib_id(id, email, raw_user_meta_data)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setComites(data);
    }
    setLoading(false);
  };

  const fetchPotentialCoordinators = async () => {
    try {
      const res = await fetch('/api/admin/usuarios');
      const data = await res.json();
      if (data.users) {
        // Filtramos por admin o responsable_comite
        const staff = data.users.filter((u: any) => 
          ['admin', 'responsable_comite'].includes(u.role)
        );
        setUsuarios(staff);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    if (!form.nombre || !form.area_responsable || !form.coordinador_amib_id) {
      setFormError('Por favor completa los campos obligatorios (*)');
      setSaving(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('comites_maestro')
        .insert([{
          nombre: form.nombre,
          area_responsable: form.area_responsable,
          objetivo: form.objetivo,
          coordinador_amib_id: form.coordinador_amib_id,
          activo: true
        }]);

      if (error) throw error;

      setShowModal(false);
      setForm(emptyForm);
      fetchComites();
    } catch (err: any) {
      setFormError(err.message || 'Error al crear el comité');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 700 }}>Gestión de Comités (Maestro)</h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Crea los comités y asigna a los responsables de AMIB.</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setFormError(null); setForm(emptyForm); }}
          style={{ background: '#001F3F', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          + Crear Comité
        </button>
      </header>

      {loading ? (
        <p>Cargando comités...</p>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Nombre del Comité</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Área Responsable</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Coordinador Asignado</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Estado</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {comites.map(comite => (
                <tr key={comite.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{comite.nombre}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{comite.objetivo}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: '#475569', fontSize: '0.9rem' }}>
                    {comite.area_responsable}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: '#475569', fontSize: '0.9rem' }}>
                    {comite.coordinador?.raw_user_meta_data?.nombre || comite.coordinador?.email || 'Sin asignar'}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '999px', 
                      fontSize: '0.8rem', 
                      fontWeight: 600,
                      background: comite.activo ? '#dcfce7' : '#fee2e2',
                      color: comite.activo ? '#166534' : '#991b1b'
                    }}>
                      {comite.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <button style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
              {comites.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    No hay comités registrados. Crea uno nuevo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Crear Comité */}
      <AnimatePresence>
        {showModal && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '550px', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}
            >
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>Nuevo Comité Maestro</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.4rem' }}>Define los parámetros base y asigna un coordinador de la AMIB.</p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Nombre del Comité *</label>
                  <input 
                    value={form.nombre} 
                    onChange={e => setForm({ ...form, nombre: e.target.value })} 
                    placeholder="Ej. Comité de Ética y Vigilancia" 
                    style={inputStyle} 
                    required
                  />
                </div>

                <div style={{ display: 'grid', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Área Responsable *</label>
                  <input 
                    value={form.area_responsable} 
                    onChange={e => setForm({ ...form, area_responsable: e.target.value })} 
                    placeholder="Ej. Dirección de Cumplimiento" 
                    style={inputStyle} 
                    required
                  />
                </div>

                <div style={{ display: 'grid', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Coordinador AMIB Asignado *</label>
                  <select 
                    value={form.coordinador_amib_id} 
                    onChange={e => setForm({ ...form, coordinador_amib_id: e.target.value })} 
                    style={inputStyle}
                    required
                  >
                    <option value="">Selecciona un responsable...</option>
                    {usuarios.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.nombre || u.email} ({u.role === 'admin' ? 'Admin' : 'Staff'})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Objetivo del Comité</label>
                  <textarea 
                    value={form.objetivo} 
                    onChange={e => setForm({ ...form, objetivo: e.target.value })} 
                    placeholder="Describe el propósito del comité..." 
                    style={{ ...inputStyle, height: '100px', resize: 'none' }}
                  />
                </div>

                {formError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.85rem' }}>
                    {formError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)} 
                    style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 600, color: '#475569' }}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving} 
                    style={{ padding: '0.75rem 1.75rem', borderRadius: '8px', border: 'none', background: '#001F3F', color: 'white', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, opacity: saving ? 0.7 : 1 }}
                  >
                    {saving ? 'Guardando...' : 'Crear Comité'}
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

const inputStyle: React.CSSProperties = {
  padding: '0.7rem 0.9rem',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '0.9rem',
  background: 'white',
  color: '#0f172a',
  width: '100%',
  boxSizing: 'border-box',
};
