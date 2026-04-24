import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { EventRegistrationWizard } from '@/components/ui/branding/EventRegistrationWizard';
import { InteractiveSpotlightBackground } from '@/components/ui/animations/InteractiveSpotlightBackground';

interface RegistrationPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventRegistrationPage({ params }: RegistrationPageProps) {
  const { slug } = await params;
  console.log('[DEBUG] Registration Page Slug:', slug);
  const supabase = await createClient();

  // Fetch Event
  const { data: evento, error } = (await supabase
    .from('eventos')
    .select('*')
    .eq('slug', slug)
    .single()) as any;

  if (error) {
    console.error('[DEBUG] Supabase Error fetching event:', error);
  }
  
  if (!evento) {
    console.warn('[DEBUG] Event not found for Slug:', slug);
    notFound();
  }
  
  const id = evento.id;

  // Fetch Tickets
  const { data: tickets } = await supabase
    .from('evento_tickets')
    .select('*')
    .eq('evento_id', id)
    .eq('activo', true)
    .order('precio', { ascending: true });

  // Fallback ticket if none exist (for backward compatibility with 'libre' events without explicit tickets)
  const finalTickets = tickets && tickets.length > 0 ? tickets : [
    {
      id: 'default-ticket',
      evento_id: id,
      nombre: evento.tipo_acceso === 'pago' ? 'Acceso General' : 'Registro General',
      descripcion: 'Acceso completo al evento institucional.',
      precio: evento.costo || 0,
      activo: true,
      created_at: new Date().toISOString()
    }
  ];

  return (
    <InteractiveSpotlightBackground>
      <div style={{ paddingTop: '100px', paddingBottom: '100px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>
          <span style={{ color: 'var(--color-secondary-container)', fontWeight: 600, letterSpacing: '0.2em', fontSize: '0.85rem', textTransform: 'uppercase' }}>
            Registro Institucional
          </span>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'white', marginTop: '1rem', letterSpacing: '-0.02em' }}>
            {evento.titulo}
          </h1>
          <p style={{ color: 'white', opacity: 0.6, marginTop: '1rem', fontSize: '1.2rem' }}>
            Completa tu registro para asegurar tu lugar.
          </p>
        </div>

        <EventRegistrationWizard evento={evento as any} tickets={finalTickets as any[]} />

        {/* Dynamic Agenda Section from CMS */}
        {evento.agenda_json && (evento.agenda_json as any[]).length > 0 && (
          <div style={{ maxWidth: '900px', margin: '4rem auto', padding: '0 2rem' }}>
             <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: '2.5rem', textAlign: 'center' }}>Agenda del Evento</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {(evento.agenda_json as any[]).map((session, idx) => (
                  <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '1.5rem 2.5rem', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '2rem', alignItems: 'center' }}>
                     <div style={{ minWidth: '120px', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-secondary-container)' }}>
                        {session.hora || '00:00'}
                     </div>
                     <div>
                        <h4 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.2rem' }}>{session.titulo}</h4>
                        <p style={{ color: 'white', opacity: 0.6, fontSize: '0.9rem' }}>{session.descripcion}</p>
                        {session.ponente && <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-secondary-container)' }}>🎙️ {session.ponente}</div>}
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </InteractiveSpotlightBackground>
  );
}
