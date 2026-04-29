'use client';

import React, { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ProfesorExpediente({ params }: { params: Promise<{ id: string, locale: string }> }) {
  const { id, locale } = use(params);
  const [profesor, setProfesor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  
  const supabase = createClient();

  useEffect(() => {
    fetchProfesorAndEmail();
  }, [id]);

  const fetchProfesorAndEmail = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profesores')
      .select('*')
      .eq('id', id)
      .single();
    
    setProfesor(data);
    setForm(data);

    if (data?.usuario_id) {
      try {
        const res = await fetch('/api/admin/usuarios');
        const resData = await res.json();
        const userMatch = resData.users?.find((u: any) => u.id === data.usuario_id);
        if (userMatch) setEmail(userMatch.email);
      } catch (e) {
        console.error('Error fetching email', e);
      }
    }

    setLoading(false);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setSaving(true);
    const { error } = await supabase
      .from('profesores')
      .update({ estado_contrato: newStatus })
      .eq('id', id);
    
    if (!error) {
      setProfesor({ ...profesor, estado_contrato: newStatus });
      setForm({ ...form, estado_contrato: newStatus });
    }
    setSaving(false);
  };

  const handleSaveExpediente = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profesores')
      .update({
        nombre: form.nombre,
        rfc: form.rfc,
        curp: form.curp,
        especialidad: form.especialidad
      })
      .eq('id', id);
    
    if (!error) {
      setProfesor({ ...form });
      setEditMode(false);
    } else {
      alert('Error guardando expediente: ' + error.message);
    }
    setSaving(false);
  };

  if (loading) return <div style={{ padding: '2rem' }}>Cargando expediente...</div>;
  if (!profesor) return <div style={{ padding: '2rem' }}>Profesor no encontrado.</div>;

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link href={`/${locale}/admin/catedras`} style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem' }}>
            ← Volver
          </Link>
          <h1 style={{ fontSize: '1.5rem', color: '#0f172a', fontWeight: 800 }}>Expediente Docente: {profesor.nombre}</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
           <select 
             value={profesor.estado_contrato} 
             onChange={(e) => handleUpdateStatus(e.target.value)}
             disabled={saving}
             style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}
           >
             <option value="PENDIENTE">PENDIENTE</option>
             <option value="FIRMADO">FIRMADO</option>
             <option value="FINALIZADO">FINALIZADO</option>
           </select>
           {editMode ? (
             <>
               <button onClick={() => {setEditMode(false); setForm(profesor);}} style={{ padding: '0.5rem 1rem', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                 Cancelar
               </button>
               <button onClick={handleSaveExpediente} disabled={saving} style={{ padding: '0.5rem 1rem', background: '#001F3F', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                 {saving ? 'Guardando...' : 'Guardar Cambios'}
               </button>
             </>
           ) : (
             <button onClick={() => setEditMode(true)} style={{ padding: '0.5rem 1rem', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
               ✏️ Editar Expediente
             </button>
           )}
        </div>
      </header>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '400px 1fr', gap: '1px', background: '#e2e8f0', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        {/* Left Side: Details */}
        <div style={{ background: 'white', padding: '2rem', overflowY: 'auto' }}>
          <section style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: '1rem' }}>Datos Generales</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Nombre Completo</label>
                {editMode ? (
                  <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} style={inputStyle} />
                ) : (
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>{profesor.nombre}</div>
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Correo Electrónico de Acceso</label>
                <div style={{ fontWeight: 600, color: email ? '#1e293b' : '#94a3b8' }}>
                  {email || (profesor.usuario_id ? 'Cargando...' : 'No tiene acceso generado')}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>RFC</label>
                  {editMode ? (
                    <input value={form.rfc || ''} onChange={e => setForm({...form, rfc: e.target.value})} style={inputStyle} />
                  ) : (
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{profesor.rfc || 'No registrado'}</div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>CURP</label>
                  {editMode ? (
                    <input value={form.curp || ''} onChange={e => setForm({...form, curp: e.target.value})} style={inputStyle} />
                  ) : (
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{profesor.curp || 'No registrado'}</div>
                  )}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Especialidad / Área</label>
                {editMode ? (
                  <input value={form.especialidad || ''} onChange={e => setForm({...form, especialidad: e.target.value})} style={inputStyle} />
                ) : (
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>{profesor.especialidad || 'N/A'}</div>
                )}
              </div>
            </div>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: '1rem' }}>Estado del Contrato</h3>
            <div style={{ padding: '1rem', background: profesor.estado_contrato === 'FIRMADO' ? '#f0fdf4' : '#fefce8', borderRadius: '8px', border: '1px solid', borderColor: profesor.estado_contrato === 'FIRMADO' ? '#dcfce7' : '#fef08a' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: profesor.estado_contrato === 'FIRMADO' ? '#166534' : '#854d0e', fontWeight: 700, fontSize: '0.85rem' }}>
                 <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }}></span>
                 {profesor.estado_contrato}
               </div>
               <p style={{ fontSize: '0.75rem', color: profesor.estado_contrato === 'FIRMADO' ? '#15803d' : '#a16207', marginTop: '0.5rem' }}>
                 {profesor.estado_contrato === 'FIRMADO' 
                   ? 'El profesor ha cumplido con el proceso administrativo.' 
                   : 'Se requiere la revisión y carga del documento firmado.'}
               </p>
            </div>
          </section>

          <section>
            <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: '1rem' }}>Acciones Administrativas</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button style={{ width: '100%', padding: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#475569', textAlign: 'left' }}>
                📄 Reemplazar Documento
              </button>
              <button style={{ width: '100%', padding: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#475569', textAlign: 'left' }}>
                ✉️ Notificar a Profesor
              </button>
            </div>
          </section>
        </div>

        {/* Right Side: Document Viewer */}
        <div style={{ background: '#f1f5f9', display: 'flex', flexDirection: 'column' }}>
          {profesor.archivo_contrato_url ? (
            <iframe 
              src={profesor.archivo_contrato_url} 
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Visor de Contrato"
            />
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '1.5rem' }}>
                📄
              </div>
              <h4 style={{ fontSize: '1.25rem', color: '#475569', fontWeight: 700, marginBottom: '0.5rem' }}>Sin documento cargado</h4>
              <p style={{ color: '#94a3b8', maxWidth: '300px', fontSize: '0.9rem' }}>Aún no se ha adjuntado el contrato digitalizado para este profesor.</p>
              <button style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                Subir Contrato PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', color: '#1e293b', background: 'white', boxSizing: 'border-box'
};
