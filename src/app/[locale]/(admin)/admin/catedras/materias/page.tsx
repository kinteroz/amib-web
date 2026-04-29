'use client';

import React, { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CatalogoMateriasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const [materias, setMaterias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
  });

  const supabase = createClient();

  useEffect(() => {
    fetchMaterias();
  }, []);

  const fetchMaterias = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('catalogo_materias')
      .select('*')
      .order('nombre', { ascending: true });
    
    setMaterias(data || []);
    setLoading(false);
  };

  const handleCreateMateria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre) return;
    setSaving(true);

    const { error } = await supabase
      .from('catalogo_materias')
      .insert({
        nombre: form.nombre,
        descripcion: form.descripcion || null
      });

    if (error) {
      alert('Error creando materia en el catálogo: ' + error.message);
    } else {
      setShowModal(false);
      setForm({ nombre: '', descripcion: '' });
      fetchMaterias();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta materia del catálogo? No afectará a las cátedras que ya la tienen asignada, pero ya no aparecerá como opción nueva.')) return;
    const { error } = await supabase.from('catalogo_materias').delete().eq('id', id);
    if (error) {
      alert('Error: ' + error.message);
    } else {
      fetchMaterias();
    }
  };

  return (
    <div>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link href={`/${locale}/admin/catedras`} style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            ← Volver a Cátedras
          </Link>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 700 }}>Catálogo Global de Materias</h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Define las asignaturas disponibles para armar el programa de las Cátedras.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ 
            background: '#001F3F', color: 'white', border: 'none', 
            padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
        }}>
          + Nueva Materia
        </button>
      </header>

      {/* List */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Nombre de la Materia</th>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Descripción</th>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600, width: '100px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center' }}>Cargando catálogo...</td></tr>
            ) : materias.length === 0 ? (
              <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No hay materias registradas en el catálogo.</td></tr>
            ) : materias.map((mat) => (
              <tr key={mat.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{mat.nombre}</div>
                </td>
                <td style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#475569' }}>
                  {mat.descripcion || <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>Sin descripción</span>}
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <button onClick={() => handleDelete(mat.id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Add Materia */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ background: 'white', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '500px' }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>Nueva Materia para el Catálogo</h2>
            <form onSubmit={handleCreateMateria} style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Nombre de la Materia *</label>
                <input required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} style={inputStyle} placeholder="Ej. Finanzas Corporativas" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Descripción (Opcional)</label>
                <textarea value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} style={{...inputStyle, height: '80px', resize: 'none'}} placeholder="Breve descripción del temario..." />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={saving} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', background: '#001F3F', color: 'white', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Guardando...' : 'Crear Materia'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', color: '#1e293b'
};
