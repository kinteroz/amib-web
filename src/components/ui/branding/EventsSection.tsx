import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { ScrollReveal } from '@/components/ui/animations/ScrollReveal';
import styles from '@/components/ui/animations/animations.module.css';
import { InstitutionalCalendar } from './InstitutionalCalendar';
import { ScrollDrivenEvents } from './ScrollDrivenEvents';

export async function EventsSection() {
  const supabase = await createClient();

  // Fetch all active events, order by start date
  const { data: eventosData } = await supabase
    .from('eventos')
    .select('*')
    .order('fecha_inicio', { ascending: true });

  const eventos = eventosData || [];

  return (
    <ScrollReveal yOffset={60}>
      <div className={styles.glassCard} style={{ 
        flexDirection: 'column', 
        alignItems: 'stretch',
        maxWidth: '1400px',
        width: '95%',
        padding: '2.5rem 3rem',
        marginBottom: '4rem'
      }}>
         <span style={{ color: 'var(--color-secondary-container)', fontWeight: 600, letterSpacing: '0.05em', fontSize: '0.75rem', textTransform: 'uppercase' }}>
          Agenda AMIB
        </span>
        <h2 style={{ fontSize: '2rem', marginTop: '0.5rem', marginBottom: '1.5rem', color: 'white', fontWeight: 800 }}>
          Calendario de Eventos
        </h2>
        
        <Suspense fallback={<div style={{color: 'rgba(255,255,255,0.5)'}}>Cargando calendario...</div>}>
          <InstitutionalCalendar eventos={eventos} />
        </Suspense>
      </div>
    </ScrollReveal>
  );
}

export async function UpcomingEventSection() {
  const supabase = await createClient();

  const { data: sliderEvents } = await supabase
    .from('eventos')
    .select('*')
    .eq('activo', true)
    .eq('es_destacado', true)
    .gte('fecha_inicio', new Date().toISOString())
    .order('fecha_inicio', { ascending: true })
    .limit(3);

  if (!sliderEvents || sliderEvents.length === 0) {
    return null;
  }

  return (
    <ScrollDrivenEvents eventos={sliderEvents} />
  );
}
