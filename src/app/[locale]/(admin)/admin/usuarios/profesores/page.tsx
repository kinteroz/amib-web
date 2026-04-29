'use client';

import React, { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdminProfesores({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const [profesores, setProfesores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State for creation
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Modal State for linking existing professor
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkingProfId, setLinkingProfId] = useState<string | null>(null);
  const [linkForm, setLinkForm] = useState({ email: '', password: '' });
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rfc: '',
    curp: '',
    especialidad: '',
  });

  const supabase = createClient();

  useEffect(() => {
    fetchProfesores();
  }, []);

  const fetchProfesores = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profesores')
      .select(`
        *,
        materias(count)
      `)
      .order('created_at', { ascending: false });
    
    setProfesores(data || []);
    setLoading(false);
  };

  const handleCreateProfesor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.password) {
      alert('Nombre, correo y contraseña son obligatorios.');
      return;
    }
    setSaving(true);

    // 1. Crear el usuario de autenticación
    const res = await fetch('/api/admin/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        role: 'profesor',
        nombre: form.nombre,
        institucion: 'AMIB (Profesorado)'
      }),
    });
    
    const userData = await res.json();
    
    if (!res.ok) {
      alert('Error creando acceso de usuario: ' + userData.error);
      setSaving(false);
      return;
    }

    const newUserId = userData.user.id;

    // 2. Crear el expediente del profesor vinculado al ID del usuario
    const { error } = await supabase
      .from('profesores')
      .insert({
        usuario_id: newUserId,
        nombre: form.nombre,
        rfc: form.rfc || null,
        curp: form.curp || null,
        especialidad: form.especialidad || null,
        estado_contrato: 'PENDIENTE'
      });

    if (error) {
      alert('Error guardando expediente del profesor: ' + error.message);
    } else {
      setShowModal(false);
      setForm({ nombre: '', email: '', password: '', rfc: '', curp: '', especialidad: '' });
      fetchProfesores();
    }
    setSaving(false);
  };

  const handleLinkAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkForm.email || !linkForm.password || !linkingProfId) return;
    setSaving(true);

    const prof = profesores.find(p => p.id === linkingProfId);

    const res = await fetch('/api/admin/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: linkForm.email,
        password: linkForm.password,
        role: 'profesor',
        nombre: prof?.nombre || 'Profesor',
        institucion: 'AMIB (Profesorado)'
      }),
    });
    
    const userData = await res.json();
    if (!res.ok) {
      alert('Error creando acceso: ' + userData.error);
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('profesores')
      .update({ usuario_id: userData.user.id })
      .eq('id', linkingProfId);

    if (error) {
      alert('Error vinculando expediente: ' + error.message);
    } else {
      setShowLinkModal(false);
      setLinkForm({ email: '', password: '' });
      fetchProfesores();
    }
    setSaving(false);
  };

  return (
    <div>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 700 }}>Catálogo de Profesores</h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Administra el expediente y estado de contratos del profesorado.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ 
            background: '#001F3F', color: 'white', border: 'none', 
            padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
        }}>
          + Dar de alta Profesor
        </button>
      </header>

      {/* List */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Profesor</th>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Especialidad</th>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Estado del Contrato</th>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Materias Asignadas</th>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Expediente</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Cargando catálogo...</td></tr>
            ) : profesores.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No hay profesores registrados en el sistema.</td></tr>
            ) : profesores.map((prof) => (
              <tr key={prof.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{prof.nombre}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>RFC: {prof.rfc || '---'}</div>
                </td>
                <td style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#475569' }}>
                  {prof.especialidad || 'N/A'}
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <span style={{ 
                    fontSize: '0.75rem', padding: '0.25rem 0.5rem', 
                    background: prof.estado_contrato === 'FIRMADO' ? '#dcfce7' : '#fef3c7',
                    color: prof.estado_contrato === 'FIRMADO' ? '#166534' : '#92400e',
                    borderRadius: '4px', fontWeight: 600
                  }}>
                    {prof.estado_contrato}
                  </span>
                </td>
                <td style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                  {prof.materias?.[0]?.count || 0}
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <Link href={`/${locale}/admin/usuarios/profesores/${prof.id}`} style={{ 
                        background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', 
                        padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem',
                        textDecoration: 'none', fontWeight: 600, display: 'inline-block', marginBottom: '0.25rem'
                    }}
                  >
                    Ver Expediente
                  </Link>
                  {!prof.usuario_id && (
                    <button 
                      onClick={() => { setLinkingProfId(prof.id); setShowLinkModal(true); }}
                      style={{ 
                        background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', 
                        padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem',
                        fontWeight: 600, cursor: 'pointer', display: 'inline-block', width: '100%'
                    }}>
                      Generar Acceso
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Alta Profesor */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ background: 'white', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '500px' }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>Dar de alta Profesor</h2>
            <form onSubmit={handleCreateProfesor} style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Nombre Completo *</label>
                <input required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Correo Electrónico *</label>
                  <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="profesor@ejemplo.com" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Contraseña Temporal *</label>
                  <input type="password" required minLength={8} value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Mínimo 8 caracteres" style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>RFC</label>
                  <input value={form.rfc} onChange={e => setForm({...form, rfc: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>CURP</label>
                  <input value={form.curp} onChange={e => setForm({...form, curp: e.target.value})} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Especialidad / Área</label>
                <input value={form.especialidad} onChange={e => setForm({...form, especialidad: e.target.value})} placeholder="Ej. Finanzas, Contabilidad..." style={inputStyle} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={saving} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', background: '#001F3F', color: 'white', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Guardando...' : 'Crear'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal Vincular Acceso */}
      {showLinkModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ background: 'white', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '400px' }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>Generar Acceso</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
              Se creará un usuario de inicio de sesión para este expediente.
            </p>
            <form onSubmit={handleLinkAccess} style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Correo Electrónico *</label>
                <input type="email" required value={linkForm.email} onChange={e => setLinkForm({...linkForm, email: e.target.value})} placeholder="profesor@ejemplo.com" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Contraseña Temporal *</label>
                <input type="password" required minLength={8} value={linkForm.password} onChange={e => setLinkForm({...linkForm, password: e.target.value})} placeholder="Mínimo 8 caracteres" style={inputStyle} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowLinkModal(false)} style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={saving} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', background: '#d97706', color: 'white', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Vinculando...' : 'Vincular'}
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
