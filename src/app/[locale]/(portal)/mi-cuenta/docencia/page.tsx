'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function DocenciaDashboard() {
  const [profesor, setProfesor] = useState<any>(null);
  const [catedras, setCatedras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchProfesorData();
  }, []);

  const fetchProfesorData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Get professor record
    const { data: profData } = await supabase
      .from('profesores')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profData) {
      setProfesor(profData);
      
      // 2. Get assigned catedras
      const { data: catData } = await supabase
        .from('catedras')
        .select('*, instituciones_educativas(nombre)')
        .eq('profesor_id', profData.id)
        .order('fecha_inicio', { ascending: false });
      
      setCatedras(catData || []);
    }
    setLoading(false);
  };

  if (loading) return <div style={{ padding: '3rem' }}>Cargando portal docente...</div>;
  if (!profesor) return (
    <div style={{ padding: '3rem', textAlign: 'center' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>No tienes perfil de profesor asignado</h2>
      <p style={{ color: '#64748b', marginTop: '1rem' }}>Si crees que esto es un error, contacta al administrador de AMIB.</p>
    </div>
  );

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>Portal de Docencia</h1>
        <p style={{ color: '#64748b' }}>Bienvenido, {profesor.nombre}. Gestiona tus clases y material didáctico.</p>
      </header>

      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>Mis Cátedras Activas</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {catedras.length === 0 ? (
            <div style={{ gridColumn: '1/-1', padding: '3rem', background: '#f8fafc', borderRadius: '16px', textAlign: 'center', border: '2px dashed #e2e8f0', color: '#94a3b8' }}>
              No tienes cátedras asignadas actualmente.
            </div>
          ) : catedras.map((cat) => (
            <div key={cat.id} style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#001F3F', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cat.instituciones_educativas?.nombre}</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>{cat.nombre}</h3>
              </div>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Estatus:</span>
                  <span style={{ color: cat.estatus === 'ACTIVA' ? '#166534' : '#1e40af', fontWeight: 600 }}>{cat.estatus}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Inicio:</span>
                  <span style={{ color: '#334155' }}>{new Date(cat.fecha_inicio).toLocaleDateString()}</span>
                </div>
              </div>

              <Link href={`/mi-cuenta/docencia/${cat.id}`} style={{ 
                width: '100%', 
                padding: '0.8rem', 
                background: '#001F3F', 
                color: 'white', 
                borderRadius: '12px', 
                textAlign: 'center', 
                textDecoration: 'none', 
                fontWeight: 600,
                fontSize: '0.9rem'
              }}>
                Entrar a Clase
              </Link>
            </div>
          ))}
        </div>
      </section>

      {profesor.estado_contrato !== 'FIRMADO' && (
        <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '2rem' }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, color: '#92400e' }}>Trámite Contractual Pendiente</div>
            <p style={{ fontSize: '0.85rem', color: '#b45309' }}>Tu estatus de contrato es "{profesor.estado_contrato}". Por favor, asegúrate de enviar tu documentación a la AMIB.</p>
          </div>
        </div>
      )}
    </div>
  );
}
