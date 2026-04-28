'use client';

import React, { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';

export default function RegistrarAsistenciaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Procesando tu asistencia...');
  const supabase = createClient();

  useEffect(() => {
    if (token) {
      handleRegistration();
    } else {
      setStatus('error');
      setMessage('Código QR inválido o expirado.');
    }
  }, [token]);

  const handleRegistration = async () => {
    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setStatus('error');
      setMessage('Debes iniciar sesión para registrar tu asistencia.');
      return;
    }

    // 2. Find session by token
    const { data: session, error: sessionError } = await supabase
      .from('sesiones_catedra')
      .select('*, catedras(nombre)')
      .eq('qr_token', token)
      .single();
    
    if (sessionError || !session) {
      setStatus('error');
      setMessage('Sesión no encontrada o token inválido.');
      return;
    }

    // 3. Determine role (checking if they are in profesores or alumnos)
    // For simplicity, we check the metadata or just try to insert with a inferred role
    // Ideally we should have a more robust way to check roles.
    const isProfesor = user.user_metadata?.role === 'profesor' || user.user_metadata?.role === 'admin';
    const role = isProfesor ? 'PROFESOR' : 'ALUMNO';

    // 4. Record attendance
    const { error: attendError } = await supabase
      .from('asistencias')
      .insert({
        sesion_id: session.id,
        usuario_id: user.id,
        rol_asistente: role,
        metodo_registro: 'QR_SCAN'
      });
    
    if (attendError) {
      if (attendError.code === '23505') {
        setStatus('success');
        setMessage(`Ya habías registrado tu asistencia para la sesión de hoy en "${session.catedras.nombre}".`);
      } else {
        setStatus('error');
        setMessage('Hubo un error al registrar tu asistencia: ' + attendError.message);
      }
    } else {
      setStatus('success');
      setMessage(`¡Asistencia registrada con éxito! Bienvenido a la sesión de "${session.catedras.nombre}".`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '2rem' }}>
      <div style={{ maxWidth: '450px', width: '100%', background: 'white', borderRadius: '24px', padding: '3rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>
          {status === 'loading' && '⌛'}
          {status === 'success' && '✅'}
          {status === 'error' && '❌'}
        </div>
        
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
          {status === 'loading' ? 'Registrando...' : status === 'success' ? '¡Listo!' : 'Atención'}
        </h1>
        
        <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '2rem' }}>
          {message}
        </p>

        {status === 'error' && !token && (
          <button onClick={() => window.location.reload()} style={{ width: '100%', padding: '0.8rem', background: '#001F3F', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>
            Intentar de nuevo
          </button>
        )}

        <a href={`/${locale}/mi-cuenta/dashboard`} style={{ display: 'block', marginTop: '1rem', color: '#001F3F', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}>
          Ir a mi Dashboard →
        </a>
      </div>
    </div>
  );
}
