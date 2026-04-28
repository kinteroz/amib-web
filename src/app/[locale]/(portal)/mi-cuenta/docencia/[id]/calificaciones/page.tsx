'use client';

import React, { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function CentroCalificacionesDocente({ params }: { params: Promise<{ id: string, locale: string }> }) {
  const { id, locale } = use(params);
  const [catedra, setCatedra] = useState<any>(null);
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [tareas, setTareas] = useState<any[]>([]);
  const [entregas, setEntregas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

    const { data: aluData } = await supabase
      .from('catedra_alumnos')
      .select('*, alumnos(*)')
      .eq('catedra_id', id);
    setAlumnos(aluData || []);

    const { data: tarData } = await supabase
      .from('tareas')
      .select('*')
      .eq('catedra_id', id);
    setTareas(tarData || []);

    const { data: entData } = await supabase
      .from('entregas')
      .select('*')
      .in('tarea_id', (tarData || []).map(t => t.id));
    setEntregas(entData || []);

    setLoading(false);
  };

  const getGrade = (alumnoId: string, tareaId: string) => {
    const entrega = entregas.find(e => e.alumno_id === alumnoId && e.tarea_id === tareaId);
    return entrega?.calificacion !== undefined ? entrega.calificacion : '---';
  };

  if (loading) return <div style={{ padding: '3rem' }}>Cargando calificaciones...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <Link href={`/mi-cuenta/docencia/${id}`} style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>
          ← Volver a la Clase
        </Link>
        <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 800, marginTop: '1rem' }}>Centro de Calificaciones</h1>
        <p style={{ color: '#64748b' }}>{catedra.nombre} | {catedra.instituciones_educativas?.nombre}</p>
      </header>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1.25rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', minWidth: '250px' }}>Alumno</th>
              {tareas.map(tarea => (
                <th key={tarea.id} style={{ padding: '1.25rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', textAlign: 'center' }}>
                  {tarea.titulo.substring(0, 15)}{tarea.titulo.length > 15 ? '...' : ''}
                </th>
              ))}
              <th style={{ padding: '1.25rem', fontSize: '0.8rem', color: '#001F3F', fontWeight: 800, textTransform: 'uppercase', textAlign: 'center', background: 'rgba(0,31,63,0.05)' }}>Promedio</th>
            </tr>
          </thead>
          <tbody>
            {alumnos.length === 0 ? (
              <tr><td colSpan={tareas.length + 2} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No hay alumnos inscritos.</td></tr>
            ) : alumnos.map((item) => {
              const studentGrades = tareas.map(t => getGrade(item.alumno_id, t.id)).filter(g => typeof g === 'number') as number[];
              const average = studentGrades.length > 0 ? (studentGrades.reduce((a, b) => a + b, 0) / studentGrades.length).toFixed(1) : '---';

              return (
                <tr key={item.alumno_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.alumnos?.nombre}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Matrícula: {item.alumnos?.matricula || 'N/A'}</div>
                  </td>
                  {tareas.map(tarea => (
                    <td key={tarea.id} style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.9rem', color: '#475569' }}>
                      {getGrade(item.alumno_id, tarea.id)}
                    </td>
                  ))}
                  <td style={{ padding: '1.25rem', textAlign: 'center', fontWeight: 800, color: '#001F3F', background: 'rgba(0,31,63,0.02)' }}>
                    {average}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button style={{ padding: '0.75rem 1.5rem', background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
          📥 Exportar a CSV (Reporte Institucional)
        </button>
      </div>
    </div>
  );
}
