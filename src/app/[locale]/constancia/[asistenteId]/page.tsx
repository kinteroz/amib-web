import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BotonImprimir } from './BotonImprimir';

interface ConstanciaPageProps {
  params: Promise<{ locale: string; asistenteId: string }>;
}

export default async function ConstanciaPage({ params }: ConstanciaPageProps) {
  const { locale, asistenteId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // RLS: el usuario solo puede leer sus propios registros (o todos si es admin)
  const { data } = await supabase
    .from('evento_asistentes')
    .select('id, nombre_completo, institucion, asistio, fecha_checkin, qr_code, evento:eventos(titulo, fecha_inicio, modalidad, ubicacion)')
    .eq('id', asistenteId)
    .maybeSingle();

  const registro = data as unknown as {
    id: string;
    nombre_completo: string | null;
    institucion: string | null;
    asistio: boolean;
    fecha_checkin: string | null;
    qr_code: string;
    evento: { titulo: string; fecha_inicio: string; modalidad: string | null; ubicacion: string | null } | null;
  } | null;

  if (!user || !registro || !registro.evento) notFound();

  if (!registro.asistio) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '3rem', maxWidth: '480px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>Constancia aún no disponible</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Tu constancia se genera cuando el personal del evento registra tu asistencia con el código QR de tu boleto.
          </p>
          <Link href={`/${locale}/mi-cuenta/mis-eventos`} style={{ display: 'inline-block', marginTop: '2rem', color: '#002048', fontWeight: 700 }}>
            ← Volver a Mis eventos
          </Link>
        </div>
      </div>
    );
  }

  const fechaEvento = new Date(registro.evento.fecha_inicio).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  const folio = registro.qr_code.replace('AMIB-EVT-', '').slice(0, 8).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: '#e9edf2', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          @page { size: letter landscape; margin: 0; }
        }
      `}</style>

      {/* Constancia */}
      <div style={{
        background: 'white', width: '100%', maxWidth: '900px', aspectRatio: '11 / 8.5',
        padding: 'clamp(1.5rem, 4vw, 3.5rem)', boxSizing: 'border-box',
        border: '3px solid #002048', outline: '1px solid #EAAB00', outlineOffset: '-12px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        boxShadow: '0 20px 60px rgba(0,32,72,0.15)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.35em', color: '#EAAB00', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            AMIB
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', letterSpacing: '0.08em' }}>
            Asociación Mexicana de Instituciones Bursátiles, A.C.
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'clamp(1.1rem, 3vw, 1.6rem)', color: '#94a3b8', fontWeight: 300, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            Constancia de Asistencia
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>Se otorga la presente a</div>
          <div style={{ fontSize: 'clamp(1.5rem, 4.5vw, 2.6rem)', fontWeight: 800, color: '#002048', marginBottom: '0.4rem', lineHeight: 1.15 }}>
            {registro.nombre_completo}
          </div>
          {registro.institucion && (
            <div style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '1.25rem' }}>{registro.institucion}</div>
          )}
          <div style={{ fontSize: '0.9rem', color: '#475569', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
            por su participación en <strong style={{ color: '#002048' }}>{registro.evento.titulo}</strong>,
            celebrado el {fechaEvento}
            {registro.evento.ubicacion ? ` en ${registro.evento.ubicacion}` : ''}.
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem' }}>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
            Folio: AMIB-{folio}<br />
            Verificación de asistencia: {registro.fecha_checkin ? new Date(registro.fecha_checkin).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
          </div>
          <div style={{ textAlign: 'center', minWidth: '200px' }}>
            <div style={{ borderTop: '1px solid #002048', paddingTop: '0.5rem', fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
              Dirección General<br />AMIB
            </div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="no-print" style={{ display: 'flex', gap: '1rem' }}>
        <BotonImprimir />
        <Link
          href={`/${locale}/mi-cuenta/mis-eventos`}
          style={{ padding: '0.8rem 1.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}
        >
          ← Mis eventos
        </Link>
      </div>
    </div>
  );
}
