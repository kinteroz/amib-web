'use client';

import React, { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ClaseDetalleAlumno({ params }: { params: Promise<{ id: string, locale: string }> }) {
  const { id, locale } = use(params);
  const [catedra, setCatedra] = useState<any>(null);
  const [materiales, setMateriales] = useState<any[]>([]);
  const [tareas, setTareas] = useState<any[]>([]);
  const [entregas, setEntregas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: catData } = await supabase
      .from('catedras')
      .select('*, instituciones_educativas(nombre), profesores(nombre)')
      .eq('id', id)
      .single();
    setCatedra(catData);

    const { data: matData } = await supabase
      .from('clases_materiales')
      .select('*')
      .eq('catedra_id', id)
      .order('orden', { ascending: true });
    setMateriales(matData || []);

    const { data: tarData } = await supabase
      .from('tareas')
      .select('*')
      .eq('catedra_id', id);
    setTareas(tarData || []);

    const { data: entData } = await supabase
      .from('entregas')
      .select('*')
      .eq('alumno_id', user.id);
    setEntregas(entData || []);

    setLoading(false);
  };

  const getTaskStatus = (tareaId: string) => {
    const entrega = entregas.find(e => e.tarea_id === tareaId);
    if (!entrega) return { label: 'Pendiente', color: '#dc2626', bg: '#fef2f2' };
    if (entrega.calificacion !== null) return { label: `Calificado: ${entrega.calificacion}`, color: '#166534', bg: '#f0fdf4' };
    return { label: 'Enviado', color: '#1e40af', bg: '#eff6ff' };
  };

  if (loading) return <div style={{ padding: '3rem' }}>Abriendo aula virtual...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <Link href={`/${locale}/mi-cuenta/mis-clases`} style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          ← Mis Clases
        </Link>
        <h1 style={{ fontSize: '2.5rem', color: '#0f172a', fontWeight: 800 }}>{catedra.nombre}</h1>
        <div style={{ display: 'flex', gap: '1.5rem', color: '#64748b', marginTop: '0.5rem' }}>
          <span>Institución: <b>{catedra.instituciones_educativas?.nombre}</b></span>
          <span>Docente: <b>{catedra.profesores?.nombre}</b></span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '3rem' }}>
        <main>
          {/* Materiales Section */}
          <section style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📚 Materiales de Clase
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {materiales.length === 0 ? (
                <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '12px', textAlign: 'center', color: '#94a3b8' }}>Aún no hay materiales compartidos.</div>
              ) : materiales.map((mat) => (
                <a key={mat.id} href={mat.archivo_url} target="_blank" rel="noopener noreferrer" style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', background: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📄</div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>{mat.titulo}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{mat.descripcion}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#001F3F' }}>Descargar</span>
                </a>
              ))}
            </div>
          </section>

          {/* Tareas Section */}
          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📝 Tareas y Entregables
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tareas.length === 0 ? (
                <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '12px', textAlign: 'center', color: '#94a3b8' }}>No hay tareas pendientes.</div>
              ) : tareas.map((tar) => {
                const status = getTaskStatus(tar.id);
                return (
                  <div key={tar.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{tar.titulo}</h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>{tar.descripcion}</p>
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.3rem 0.6rem', borderRadius: '6px', background: status.bg, color: status.color, textTransform: 'uppercase' }}>
                        {status.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Fecha Límite: <b style={{ color: '#475569' }}>{new Date(tar.fecha_limite).toLocaleDateString()}</b>
                      </div>
                      <button style={{ padding: '0.5rem 1rem', background: '#001F3F', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                        Subir Entrega
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>

        {/* Sidebar: Attendance & Grades */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ background: '#001F3F', borderRadius: '24px', padding: '1.75rem', color: 'white' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Asistencia Presencial</h3>
            <p style={{ fontSize: '0.85rem', opacity: 0.8, lineHeight: '1.5', marginBottom: '1.5rem' }}>Recuerda escanear el código QR en la tablet de AMIB al llegar a tu clase.</p>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase' }}>Sesiones Asistidas</div>
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>8 / 12</div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '24px', padding: '1.75rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>Tu Calificación</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Promedio Actual</span>
                 <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#001F3F' }}>9.2</span>
               </div>
               <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '12px', fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>
                 Estás por encima del promedio del grupo. ¡Sigue así!
               </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
