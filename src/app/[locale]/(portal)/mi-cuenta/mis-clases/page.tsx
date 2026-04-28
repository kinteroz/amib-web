'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function MisClasesAlumno() {
  const [catedras, setCatedras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchEnrolledClasses();
  }, []);

  const fetchEnrolledClasses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('catedra_alumnos')
      .select(`
        *,
        catedras (
          *,
          instituciones_educativas (nombre),
          profesores (nombre)
        )
      `)
      .eq('alumno_id', user.id);
    
    setCatedras(data || []);
    setLoading(false);
  };

  if (loading) return <div style={{ padding: '3rem' }}>Cargando tus clases...</div>;

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <header style={{ marginBottom: '3.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#001F3F', letterSpacing: '-0.02em' }}>Centro Educativo AMIB</h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '0.5rem' }}>Explora tus cátedras, materiales y progreso académico.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2rem' }}>
        {catedras.length === 0 ? (
          <div style={{ gridColumn: '1/-1', padding: '5rem', background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)', borderRadius: '32px', border: '1px solid rgba(255, 255, 255, 0.5)', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>Aún no tienes clases inscritas</h2>
            <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Cuando seas inscrito en una cátedra por tu institución, aparecerá aquí.</p>
          </div>
        ) : catedras.map((item) => (
          <div key={item.catedra_id} style={{ 
            background: 'rgba(255, 255, 255, 0.7)', 
            backdropFilter: 'blur(20px)', 
            borderRadius: '32px', 
            padding: '2.5rem', 
            border: '1px solid rgba(255, 255, 255, 0.8)', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.3s ease',
            cursor: 'pointer'
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ 
                fontSize: '0.7rem', 
                fontWeight: 800, 
                color: '#001F3F', 
                background: 'rgba(0, 31, 63, 0.08)', 
                padding: '0.4rem 0.8rem', 
                borderRadius: '8px',
                textTransform: 'uppercase'
              }}>
                {item.catedras?.instituciones_educativas?.nombre}
              </span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '1rem' }}>{item.catedras?.nombre}</h3>
            </div>

            <div style={{ flex: 1, marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#001F3F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 700 }}>
                  {item.catedras?.profesores?.nombre?.substring(0, 1)}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#475569' }}>Prof. <b style={{ color: '#0f172a' }}>{item.catedras?.profesores?.nombre}</b></div>
              </div>
              
              <div style={{ height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden', marginTop: '1.5rem' }}>
                <div style={{ width: item.estado_aprobacion === 'APROBADO' ? '100%' : '35%', height: '100%', background: '#001F3F', borderRadius: '4px' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                <span>Progreso del curso</span>
                <span>{item.estado_aprobacion === 'APROBADO' ? '100%' : '35%'}</span>
              </div>
            </div>

            <Link href={`/mi-cuenta/mis-clases/${item.catedra_id}`} style={{ 
              width: '100%', 
              padding: '1rem', 
              background: '#001F3F', 
              color: 'white', 
              borderRadius: '16px', 
              textAlign: 'center', 
              textDecoration: 'none', 
              fontWeight: 700,
              boxShadow: '0 10px 15px -3px rgba(0, 31, 63, 0.3)'
            }}>
              Continuar Aprendiendo
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
