'use client';

import React, { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AsistenciaCatedra({ params }: { params: Promise<{ id: string, locale: string }> }) {
  const { id, locale } = use(params);
  const [catedra, setCatedra] = useState<any>(null);
  const [sesiones, setSesiones] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
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

    const { data: sesData } = await supabase
      .from('sesiones_catedra')
      .select('*')
      .eq('catedra_id', id)
      .order('fecha_sesion', { ascending: false });
    
    setSesiones(sesData || []);
    setLoading(false);
  };

  const createSession = async () => {
    const today = new Date().toISOString().split('T')[0];
    const qrToken = crypto.randomUUID();
    
    const { data, error } = await supabase
      .from('sesiones_catedra')
      .insert({
        catedra_id: id,
        fecha_sesion: today,
        qr_token: qrToken,
        estatus: 'EN_CURSO'
      })
      .select()
      .single();
    
    if (!error) {
      setSesiones([data, ...sesiones]);
      setActiveSession(data);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Cargando control de asistencia...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <Link href={`/${locale}/admin/catedras/${id}`} style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>
          ← Volver a Cátedra
        </Link>
        <h1 style={{ fontSize: '1.75rem', color: '#0f172a', fontWeight: 800, marginTop: '1rem' }}>Control de Asistencia Presencial</h1>
        <p style={{ color: '#64748b' }}>{catedra?.nombre} - {catedra?.instituciones_educativas?.nombre}</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
        {/* Left Column: Sessions List */}
        <section style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Historial de Sesiones</h2>
            <button onClick={createSession} style={{ padding: '0.5rem 1rem', background: '#001F3F', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
              + Iniciar Sesión Hoy
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sesiones.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No hay sesiones registradas.</div>
            ) : sesiones.map((ses) => (
              <div 
                key={ses.id} 
                onClick={() => setActiveSession(ses)}
                style={{ 
                  padding: '1rem', 
                  borderRadius: '10px', 
                  border: '1px solid', 
                  borderColor: activeSession?.id === ses.id ? '#001F3F' : '#e2e8f0',
                  background: activeSession?.id === ses.id ? '#f0f7ff' : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>{new Date(ses.fecha_sesion).toLocaleDateString('es-MX', { dateStyle: 'full' })}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Token: {ses.qr_token.substring(0, 8)}...</div>
                </div>
                <span style={{ 
                  fontSize: '0.7rem', 
                  padding: '0.2rem 0.5rem', 
                  background: ses.estatus === 'EN_CURSO' ? '#dcfce7' : '#f1f5f9',
                  color: ses.estatus === 'EN_CURSO' ? '#166534' : '#475569',
                  borderRadius: '4px',
                  fontWeight: 700
                }}>
                  {ses.estatus}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column: QR Display (Tablet Mode) */}
        <section style={{ background: '#001F3F', borderRadius: '16px', padding: '2rem', color: 'white', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '500px' }}>
          {activeSession ? (
            <>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Escanea para Asistencia</h3>
              <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '2rem' }}>Sesión: {new Date(activeSession.fecha_sesion).toLocaleDateString()}</p>
              
              <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', marginBottom: '2rem' }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${window.location.origin}/${locale}/asistencia/registrar?token=${activeSession.qr_token}`} 
                  alt="QR Code" 
                  style={{ width: '250px', height: '250px' }}
                />
              </div>

              <div style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '0.75rem 1rem', borderRadius: '8px', maxWidth: '100%' }}>
                <div style={{ opacity: 0.6, marginBottom: '0.25rem' }}>URL de registro:</div>
                <div style={{ wordBreak: 'break-all', fontWeight: 500 }}>{window.location.origin}/{locale}/asistencia/registrar?token={activeSession.qr_token}</div>
              </div>
            </>
          ) : (
            <div style={{ opacity: 0.5 }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
              <p>Selecciona o inicia una sesión para mostrar el código QR en la tablet.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
