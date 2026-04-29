'use client';

import React, { useState, useEffect, use } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { processStudentsCsv, CsvProcessingResult } from '@/app/actions/catedras';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AlumnosCatedraPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = use(params);
  const [catedra, setCatedra] = useState<any>(null);
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [csvResult, setCsvResult] = useState<CsvProcessingResult | null>(null);
  const [formData, setFormData] = useState({ nombre: '', email: '', matricula: '' });
  const [saving, setSaving] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const { data: catData } = await supabase
      .from('catedras')
      .select('*, instituciones_educativas (id, nombre)')
      .eq('id', id)
      .single();
    setCatedra(catData);

    const { data: aluData } = await supabase
      .from('catedra_alumnos')
      .select('*, alumnos (*)')
      .eq('catedra_id', id)
      .order('created_at', { ascending: false });
    setAlumnos(aluData || []);
    setLoading(false);
  };

  const handleAddAlumno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.email) return;
    setSaving(true);

    try {
      // Check if alumno exists
      let { data: existing } = await supabase
        .from('alumnos')
        .select('id')
        .eq('email', formData.email)
        .single();

      let alumnoId = existing?.id;

      if (!alumnoId) {
        const { data: newAlumno, error } = await supabase
          .from('alumnos')
          .insert({
            nombre: formData.nombre,
            email: formData.email,
            matricula: formData.matricula || null,
            institucion_id: catedra?.institucion_id || null,
          })
          .select('id')
          .single();
        if (error) throw error;
        alumnoId = newAlumno.id;
      }

      // Enroll
      const { error: enrollErr } = await supabase
        .from('catedra_alumnos')
        .insert({ catedra_id: id, alumno_id: alumnoId, estado_aprobacion: 'CURSANDO' });

      if (enrollErr && enrollErr.code !== '23505') throw enrollErr;

      setFormData({ nombre: '', email: '', matricula: '' });
      setShowAddForm(false);
      fetchData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !catedra) return;
    setUploading(true);
    setCsvResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target?.result as string;
      try {
        const res = await processStudentsCsv(id, catedra.institucion_id, csvText);
        setCsvResult(res);
        fetchData();
      } catch (err: any) {
        alert('Error procesando CSV: ' + err.message);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsText(file);
  };

  // Tokens
  const gold = '#EAAB00';
  const muted = 'rgba(255,255,255,0.4)';
  const text = 'rgba(255,255,255,0.85)';
  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.07)',
    overflow: 'hidden',
  };
  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '0.75rem 1rem',
    color: 'white',
    fontSize: '0.85rem',
    outline: 'none',
  };

  if (loading) return <div style={{ color: muted, padding: '2rem' }}>Cargando alumnos...</div>;

  return (
    <div>
      <Link href={`/${locale}/mi-cuenta/mis-catedras/${id}`} style={{ color: muted, textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        ← {catedra?.nombre || 'Volver'}
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: gold, fontWeight: 700, letterSpacing: '0.2em', marginBottom: '0.5rem' }}>
            Gestión de Alumnos
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
            Alumnos Inscritos ({alumnos.length})
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
              disabled={uploading}
            />
            <button style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              color: 'white', padding: '0.7rem 1.25rem', borderRadius: '10px',
              fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer'
            }}>
              {uploading ? 'Cargando...' : '↑ Carga CSV'}
            </button>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              background: gold, color: '#001F3F', border: 'none',
              padding: '0.7rem 1.25rem', borderRadius: '10px',
              fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer'
            }}
          >
            + Agregar Alumno
          </button>
        </div>
      </div>

      {/* CSV Result */}
      {csvResult && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '12px',
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            color: '#4ade80',
            fontSize: '0.85rem',
          }}
        >
          <strong>Carga completada:</strong> {csvResult.added} nuevos, {csvResult.enrolled} inscritos.
          {csvResult.errors > 0 && <span style={{ color: '#f87171' }}> ({csvResult.errors} errores)</span>}
        </motion.div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleAddAlumno}
          style={{
            ...card,
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <h3 style={{ fontWeight: 700, color: text, fontSize: '1rem', marginBottom: '1rem' }}>Nuevo Alumno</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Nombre completo *</label>
              <input style={inputStyle} value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Email *</label>
              <input type="email" style={inputStyle} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Matrícula</label>
              <input style={inputStyle} value={formData.matricula} onChange={(e) => setFormData({ ...formData, matricula: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowAddForm(false)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.6rem 1.25rem', borderRadius: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} style={{ background: gold, color: '#001F3F', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Guardando...' : 'Inscribir Alumno'}
            </button>
          </div>
        </motion.form>
      )}

      {/* Students Table */}
      <div style={card}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.65rem', color: muted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>Alumno</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.65rem', color: muted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>Matrícula</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.65rem', color: muted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>Estado</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.65rem', color: muted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>Calificación</th>
            </tr>
          </thead>
          <tbody>
            {alumnos.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: muted }}>
                  No hay alumnos inscritos. Usa el botón &quot;Agregar Alumno&quot; o &quot;Carga CSV&quot;.
                </td>
              </tr>
            ) : alumnos.map((item, i) => (
              <motion.tr
                key={item.alumno_id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' } as any}
              >
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ fontWeight: 600, color: text, fontSize: '0.9rem' }}>{item.alumnos?.nombre}</div>
                  <div style={{ fontSize: '0.75rem', color: muted }}>{item.alumnos?.email}</div>
                </td>
                <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                  {item.alumnos?.matricula || '---'}
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{
                    fontSize: '0.65rem', padding: '0.2rem 0.5rem',
                    background: item.estado_aprobacion === 'CURSANDO' ? 'rgba(59,130,246,0.15)' : item.estado_aprobacion === 'APROBADO' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
                    color: item.estado_aprobacion === 'CURSANDO' ? '#60a5fa' : item.estado_aprobacion === 'APROBADO' ? '#4ade80' : 'rgba(255,255,255,0.5)',
                    borderRadius: '4px', fontWeight: 700,
                  }}>
                    {item.estado_aprobacion}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: text, fontSize: '0.9rem' }}>
                  {item.calificacion_final || '---'}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
