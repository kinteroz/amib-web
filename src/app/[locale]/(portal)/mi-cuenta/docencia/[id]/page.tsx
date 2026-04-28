'use client';

import React, { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function GestionClaseDocente({ params }: { params: Promise<{ id: string, locale: string }> }) {
  const { id, locale } = use(params);
  const [catedra, setCatedra] = useState<any>(null);
  const [materiales, setMateriales] = useState<any[]>([]);
  const [tareas, setTareas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'material' | 'tareas'>('material');
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const { data: catData } = await supabase
      .from('catedras')
      .select('*, instituciones_educativas(nombre)')
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
      .eq('catedra_id', id)
      .order('fecha_limite', { ascending: true });
    setTareas(tarData || []);

    setLoading(false);
  };

  if (loading) return <div style={{ padding: '3rem' }}>Cargando clase...</div>;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <Link href={`/${locale}/mi-cuenta/docencia`} style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>
          ← Volver al Portal
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 800 }}>{catedra.nombre}</h1>
            <p style={{ color: '#64748b' }}>{catedra.instituciones_educativas?.nombre} | Gestión Docente</p>
          </div>
          <Link href={`/mi-cuenta/docencia/${id}/calificaciones`} style={{ padding: '0.75rem 1.25rem', background: '#001F3F', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
            📊 Centro de Calificaciones
          </Link>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1px' }}>
        <button 
          onClick={() => setView('material')}
          style={{ 
            padding: '1rem 1.5rem', 
            background: 'none', 
            border: 'none', 
            borderBottom: view === 'material' ? '2px solid #001F3F' : 'none',
            color: view === 'material' ? '#001F3F' : '#64748b',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Materiales y Clases
        </button>
        <button 
          onClick={() => setView('tareas')}
          style={{ 
            padding: '1rem 1.5rem', 
            background: 'none', 
            border: 'none', 
            borderBottom: view === 'tareas' ? '2px solid #001F3F' : 'none',
            color: view === 'tareas' ? '#001F3F' : '#64748b',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Tareas y Asignaciones
        </button>
      </div>

      <main>
        {view === 'material' ? (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Material de Estudio</h2>
              <button style={{ padding: '0.5rem 1rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                + Subir Material
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {materiales.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #e2e8f0', color: '#94a3b8' }}>
                  Aún no has subido materiales para esta clase.
                </div>
              ) : materiales.map((mat) => (
                <div key={mat.id} style={{ background: 'white', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>📄</span>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{mat.titulo}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{mat.descripcion || 'Sin descripción'}</div>
                    </div>
                  </div>
                  <button style={{ color: '#001F3F', background: 'none', border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Editar</button>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Tareas Programadas</h2>
              <button style={{ padding: '0.5rem 1rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                + Nueva Tarea
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tareas.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #e2e8f0', color: '#94a3b8' }}>
                  No hay tareas creadas para este curso.
                </div>
              ) : tareas.map((tar) => (
                <div key={tar.id} style={{ background: 'white', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{tar.titulo}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Fecha Límite: <b style={{ color: '#dc2626' }}>{new Date(tar.fecha_limite).toLocaleDateString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}</b>
                    </div>
                  </div>
                  <Link href={`/mi-cuenta/docencia/${id}/tareas/${tar.id}`} style={{ color: '#001F3F', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>
                    Ver Entregas
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
