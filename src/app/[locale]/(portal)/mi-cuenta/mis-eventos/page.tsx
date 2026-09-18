import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { MisEventosList, RegistroEvento } from './MisEventosList';

export default async function MisEventosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎟️</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '0.75rem' }}>Inicia sesión para ver tus eventos</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem' }}>Aquí encontrarás tus boletos QR y constancias de asistencia.</p>
        <Link href={`/${locale}/login`} style={{ background: '#EAAB00', color: '#060e1c', padding: '0.8rem 2rem', borderRadius: '10px', fontWeight: 700, textDecoration: 'none' }}>
          Iniciar sesión
        </Link>
      </div>
    );
  }

  // RLS permite leer registros propios (por usuario_id o por email de la sesión)
  const { data } = await supabase
    .from('evento_asistentes')
    .select('id, nombre_completo, email, qr_code, asistio, fecha_checkin, fecha_registro, evento:eventos(id, titulo, slug, fecha_inicio, ubicacion, modalidad, tipo_acceso)')
    .or(`usuario_id.eq.${user.id},email.ilike.${user.email}`)
    .order('fecha_registro', { ascending: false });

  const filas = (data ?? []) as unknown as RegistroEvento[];
  const registros = filas.filter((r) => r.evento);

  return <MisEventosList registros={registros} locale={locale} />;
}
