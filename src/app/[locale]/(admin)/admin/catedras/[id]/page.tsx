'use client';

import React, { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { processStudentsCsv, CsvProcessingResult } from '@/app/actions/catedras';
import Link from 'next/link';

export default function CatedraDetailsPage({ params }: { params: Promise<{ id: string, locale: string }> }) {
  const { id, locale } = use(params);
  const [catedra, setCatedra] = useState<any>(null);
  const [materias, setMaterias] = useState<any[]>([]);
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<CsvProcessingResult | null>(null);
  // Encargado state
  const [encargados, setEncargados] = useState<any[]>([]);
  const [savingEncargado, setSavingEncargado] = useState(false);

  // Materias state
  const [profesoresList, setProfesoresList] = useState<any[]>([]);
  const [catalogoMaterias, setCatalogoMaterias] = useState<any[]>([]);
  const [showMateriaModal, setShowMateriaModal] = useState(false);
  const [savingMateria, setSavingMateria] = useState(false);
  const [materiaForm, setMateriaForm] = useState({ nombre: '', profesor_id: '' });

  // Encargado state
  const [potencialesEncargados, setPotencialesEncargados] = useState<any[]>([]);
  const [showEncargadoSelect, setShowEncargadoSelect] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch catedra info (profesor_id was removed; professors are now linked via materias)
    const { data: catData } = await supabase
      .from('catedras')
      .select(`
        *,
        instituciones_educativas (*)
      `)
      .eq('id', id)
      .single();
    
    setCatedra(catData);

    // Fetch materias with their professors
    const { data: matData } = await supabase
      .from('materias')
      .select(`
        *,
        profesores (*)
      `)
      .eq('catedra_id', id)
      .order('fecha_inicio', { ascending: true });
    
    setMaterias(matData || []);

    // Fetch enrolled students
    const { data: aluData } = await supabase
      .from('catedra_alumnos')
      .select(`
        *,
        alumnos (*)
      `)
      .eq('catedra_id', id);
    
    setAlumnos(aluData || []);

    // Fetch catalog of professors for the modal
    const { data: profData } = await supabase
      .from('profesores')
      .select('id, nombre, especialidad')
      .order('nombre', { ascending: true });
    setProfesoresList(profData || []);

    // Fetch catalog of materias
    const { data: catMatData } = await supabase
      .from('catalogo_materias')
      .select('id, nombre')
      .order('nombre', { ascending: true });
    setCatalogoMaterias(catMatData || []);

    // Fetch potential encargados (users with role encargado_catedra or admin)
    try {
      const res = await fetch('/api/admin/usuarios');
      if (res.ok) {
        const d = await res.json();
        const valid = d.users.filter((u: any) => u.role === 'admin' || u.role === 'encargado_catedra');
        setPotencialesEncargados(valid);
      }
    } catch(e) {}
    
    // We'll just fetch the current assigned one.
    if (catData?.encargado_amib_id) {
        const { data: userData } = await supabase.rpc('get_user_by_id', { user_id: catData.encargado_amib_id });
        if (userData && userData.length > 0) {
            setCatedra(prev => ({...prev, encargado_info: userData[0]}));
        }
    }

    setLoading(false);
  };

  const handleAssignEncargado = async (userId: string) => {
    setSavingEncargado(true);
    const { error } = await supabase
      .from('catedras')
      .update({ encargado_amib_id: userId })
      .eq('id', id);
    
    if (!error) {
      alert('Encargado asignado exitosamente');
      fetchData();
    } else {
      alert('Error: ' + error.message);
    }
    setSavingEncargado(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target?.result as string;
      try {
        const res = await processStudentsCsv(id, catedra.institucion_id, csvText);
        setResult(res);
        fetchData(); // Refresh list
      } catch (err: any) {
        alert('Error procesando CSV: ' + err.message);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleAddMateria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materiaForm.nombre || !materiaForm.profesor_id) return;
    
    setSavingMateria(true);
    const { error } = await supabase
      .from('materias')
      .insert({
        catedra_id: id,
        profesor_id: materiaForm.profesor_id,
        nombre: materiaForm.nombre,
        estatus: 'ACTIVA'
      });
      
    if (error) {
      alert('Error al agregar materia: ' + error.message);
    } else {
      setShowMateriaModal(false);
      setMateriaForm({ nombre: '', profesor_id: '' });
      fetchData();
    }
    setSavingMateria(false);
  };

  const handleDeleteMateria = async (materiaId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta materia? Esto podría afectar a las calificaciones.')) return;
    const { error } = await supabase.from('materias').delete().eq('id', materiaId);
    if (error) {
      alert('Error: ' + error.message);
    } else {
      fetchData();
    }
  };

  if (loading && !catedra) return <div style={{ padding: '2rem' }}>Cargando detalles...</div>;
  if (!catedra) return <div style={{ padding: '2rem' }}>Cátedra no encontrada.</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <Link href={`/${locale}/admin/catedras`} style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          ← Volver a Cátedras
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', color: '#0f172a', fontWeight: 800, marginBottom: '0.5rem' }}>{catedra.nombre}</h1>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <span style={{ color: '#001F3F', fontWeight: 600 }}>{catedra.instituciones_educativas?.nombre}</span>
              <span style={{ color: '#64748b' }}>Materias: <b style={{ color: '#334155' }}>{materias.length}</b></span>
              <span style={{ 
                fontSize: '0.75rem', 
                padding: '0.25rem 0.6rem', 
                background: catedra.estatus === 'ACTIVA' ? '#dcfce7' : '#f1f5f9',
                color: catedra.estatus === 'ACTIVA' ? '#166534' : '#475569',
                borderRadius: '999px',
                fontWeight: 700
              }}>
                {catedra.estatus}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <button style={{ padding: '0.75rem 1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#334155', fontWeight: 600, cursor: 'pointer' }}>
               Configuración
             </button>
             <Link href={`/${locale}/admin/catedras/${id}/asistencia`} style={{ padding: '0.75rem 1.25rem', borderRadius: '8px', background: '#001F3F', color: 'white', fontWeight: 600, textDecoration: 'none' }}>
               Control de Asistencia (QR)
             </Link>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        {/* Left Column: Students List */}
        <section style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Alumnos Inscritos ({alumnos.length})</h2>
            <div style={{ position: 'relative' }}>
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileUpload} 
                style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                disabled={uploading}
              />
              <button style={{ 
                padding: '0.5rem 1rem', 
                borderRadius: '6px', 
                background: '#f8fafc', 
                border: '1px solid #cbd5e1', 
                fontSize: '0.85rem', 
                fontWeight: 600,
                color: '#334155'
              }}>
                {uploading ? 'Cargando...' : '↑ Carga Masiva (CSV)'}
              </button>
            </div>
          </div>

          {result && (
            <div style={{ padding: '1rem 1.5rem', background: '#f0fdf4', borderBottom: '1px solid #dcfce7', color: '#166534', fontSize: '0.85rem' }}>
              <b>Carga completada:</b> {result.added} nuevos, {result.enrolled} inscritos. {result.errors > 0 && <span style={{ color: '#991b1b' }}>({result.errors} errores)</span>}
            </div>
          )}

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Alumno</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Matrícula</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Estado</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Calificación</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No hay alumnos inscritos todavía.</td></tr>
              ) : alumnos.map((item) => (
                <tr key={item.alumno_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.alumnos?.nombre}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.alumnos?.email}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#475569' }}>
                    {item.alumnos?.matricula || '---'}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      padding: '0.2rem 0.5rem', 
                      background: item.estado_aprobacion === 'CURSANDO' ? '#eff6ff' : '#f1f5f9',
                      color: item.estado_aprobacion === 'CURSANDO' ? '#1e40af' : '#475569',
                      borderRadius: '4px',
                      fontWeight: 600
                    }}>
                      {item.estado_aprobacion}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#0f172a' }}>
                    {item.calificacion_final || '---'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Right Column: Sidebar info */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Materias y Profesores</h3>
              <button onClick={() => setShowMateriaModal(true)} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                + Agregar
              </button>
            </div>
            
            {materias.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No hay materias registradas.</p>
            ) : materias.map((mat) => (
              <div key={mat.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#001F3F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                  {mat.profesores?.nombre?.substring(0, 2).toUpperCase() || 'P'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>{mat.nombre}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{mat.profesores?.nombre || 'Sin profesor'} · {mat.profesores?.especialidad || ''}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end' }}>
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '0.15rem 0.4rem',
                    background: mat.estatus === 'ACTIVA' ? '#dcfce7' : '#f1f5f9',
                    color: mat.estatus === 'ACTIVA' ? '#166534' : '#475569',
                    borderRadius: '4px',
                    fontWeight: 600
                  }}>
                    {mat.estatus}
                  </span>
                  <button onClick={() => handleDeleteMateria(mat.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600, marginTop: '0.2rem' }}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Fechas del Curso</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Inicio</div>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{catedra.fecha_inicio ? new Date(catedra.fecha_inicio).toLocaleDateString('es-MX', { dateStyle: 'long' }) : 'No definida'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Finalización</div>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{catedra.fecha_fin ? new Date(catedra.fecha_fin).toLocaleDateString('es-MX', { dateStyle: 'long' }) : 'No definida'}</div>
              </div>
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Encargado de Cátedra</h3>
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              {catedra.encargado_amib_id ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#001F3F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.75rem' }}>
                      E
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>Usuario Asignado</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {catedra.encargado_amib_id.substring(0, 8)}...</div>
                    </div>
                  </div>
                  <button onClick={() => handleAssignEncargado(null)} disabled={savingEncargado} style={{ marginTop: '0.5rem', width: '100%', padding: '0.5rem', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                    Remover Encargado
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👤</div>
                  <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem' }}>No hay encargado asignado.</div>
                  {showEncargadoSelect ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <select 
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssignEncargado(e.target.value);
                            setShowEncargadoSelect(false);
                          }
                        }}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', color: '#1e293b' }}
                      >
                        <option value="">Selecciona un usuario...</option>
                        {potencialesEncargados.map(u => (
                          <option key={u.id} value={u.id}>{u.nombre || u.email} ({u.role})</option>
                        ))}
                      </select>
                      <button onClick={() => setShowEncargadoSelect(false)} style={{ width: '100%', padding: '0.4rem', background: 'white', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setShowEncargadoSelect(true)} disabled={savingEncargado} style={{ width: '100%', padding: '0.6rem', background: '#001F3F', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                      Asignar Encargado
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Modal Add Materia */}
      {showMateriaModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '450px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>Agregar Materia</h2>
            <form onSubmit={handleAddMateria} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Materia (del Catálogo) *</label>
                <select required value={materiaForm.nombre} onChange={e => setMateriaForm({...materiaForm, nombre: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: 'white', color: '#1e293b' }}>
                  <option value="">Selecciona una materia...</option>
                  {catalogoMaterias.map(m => (
                    <option key={m.id} value={m.nombre}>{m.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Profesor Titular *</label>
                <select required value={materiaForm.profesor_id} onChange={e => setMateriaForm({...materiaForm, profesor_id: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: 'white', color: '#1e293b' }}>
                  <option value="">Selecciona un profesor...</option>
                  {profesoresList.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} ({p.especialidad || 'Sin especialidad'})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowMateriaModal(false)} style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={savingMateria} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', background: '#001F3F', color: 'white', fontWeight: 700, cursor: 'pointer', opacity: savingMateria ? 0.7 : 1 }}>
                  {savingMateria ? 'Guardando...' : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
