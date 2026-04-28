import React, { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { InteractiveSpotlightBackground } from '@/components/ui/animations/InteractiveSpotlightBackground';
import { ScrollReveal } from '@/components/ui/animations/ScrollReveal';
import { Footer } from '@/components/layout/Footer';
import styles from '@/components/ui/animations/animations.module.css';

async function CatedrasSection() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('catedras')
    .select('*, instituciones_educativas(nombre), materias(count)')
    .eq('estatus', 'ACTIVA')
    .order('fecha_inicio', { ascending: true })
    .limit(1);

  const catedra = data?.[0];

  if (!catedra) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem', color: 'rgba(255,255,255,0.4)' }}>
        No hay cátedras activas en este momento.
      </div>
    );
  }

  // Calcular tiempo faltante
  const now = new Date();
  const fInicio = new Date(catedra.fecha_inicio);
  const diff = fInicio.getTime() - now.getTime();
  
  let days = 0, hours = 0, mins = 0;
  if (diff > 0) {
    days = Math.floor(diff / (1000 * 60 * 60 * 24));
    hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    mins = Math.floor((diff / 1000 / 60) % 60);
  }

  // Materias count
  const numMaterias = catedra.materias?.[0]?.count || 0;

  return (
    <ScrollReveal yOffset={60}>
      <div style={{
        position: 'relative',
        width: '100%',
        minHeight: '600px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        marginBottom: '6rem'
      }}>
        {/* Background Image & Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'url("https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop") center/cover no-repeat',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(0,20,45,1) 0%, rgba(0,20,45,0.8) 50%, rgba(0,20,45,0) 100%)',
          zIndex: 1
        }} />

        {/* Content Container */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          padding: '4rem 8%',
          maxWidth: '1400px',
          width: '100%',
          margin: '0 auto'
        }}>
          {/* Eyebrow Tag */}
          <span style={{ 
            display: 'inline-block',
            background: '#D4AF37', 
            color: '#001F3F', 
            fontWeight: 800, 
            letterSpacing: '0.05em', 
            fontSize: '0.75rem', 
            textTransform: 'uppercase',
            padding: '0.3rem 0.8rem',
            borderRadius: '4px',
            marginBottom: '1.5rem'
          }}>
            CÁTEDRA DESTACADA
          </span>
          
          <h2 style={{ 
            fontSize: 'clamp(2.5rem, 4vw, 4rem)', 
            lineHeight: 1.1, 
            color: 'white', 
            fontWeight: 900,
            maxWidth: '700px',
            marginBottom: '1.5rem',
            letterSpacing: '-0.02em'
          }}>
            {catedra.nombre}
          </h2>
          
          <p style={{ 
            fontSize: '1rem', 
            color: 'rgba(255,255,255,0.7)', 
            maxWidth: '550px',
            lineHeight: 1.6,
            marginBottom: '2.5rem'
          }}>
            {catedra.descripcion || 'Programa especializado avalado por la AMIB para profesionales y estudiantes del sector financiero.'}
          </p>

          {/* Countdown Stats */}
          {diff > 0 && (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
              {[
                { label: 'días', value: days },
                { label: 'horas', value: hours },
                { label: 'mins', value: mins }
              ].map(stat => (
                <div key={stat.label} style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '1rem',
                  minWidth: '80px',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#D4AF37', lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginTop: '0.4rem', fontWeight: 700 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* CTA Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Link href="/login" style={{
              background: '#FACC15', // Amarillo brillante (Tailwind Yellow 400)
              color: '#000000',      // Negro puro para máximo contraste
              padding: '0.8rem 2.5rem',
              borderRadius: '8px',
              fontWeight: 900,
              fontSize: '0.95rem',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(250, 204, 21, 0.3)'
            }}>
              Registrarse [Gratis]
            </Link>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
              📍 {catedra.instituciones_educativas?.nombre} · {numMaterias > 0 ? `${numMaterias} Materias` : 'Programa Completo'}
            </span>
          </div>

        </div>
      </div>
    </ScrollReveal>
  );
}

export default function EducacionPage() {
  return (
    <InteractiveSpotlightBackground>
      <main>
        {/* ── Hero ── */}
        <section style={{
          minHeight: '75vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10rem 4rem 4rem',
          textAlign: 'center',
          position: 'relative',
        }}>
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: '100px',
            padding: '0.35rem 1rem',
            marginBottom: '2rem',
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Centro Educativo
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.8rem, 6vw, 5rem)',
            fontWeight: 800,
            lineHeight: 1.05,
            color: 'white',
            maxWidth: '900px',
            marginBottom: '1.5rem',
          }}>
            Formación Superior en Finanzas y Mercados
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'rgba(255,255,255,0.6)',
            maxWidth: '700px',
            lineHeight: 1.7,
            marginBottom: '4rem',
          }}>
            Vinculamos el talento de las principales universidades de México con el sector bursátil a través de programas especializados y certificaciones de alto nivel.
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
             <button style={{ 
               background: '#3B82F6', 
               color: 'white', 
               padding: '1rem 2rem', 
               borderRadius: '12px', 
               fontWeight: 700,
               border: 'none',
               fontSize: '1rem',
               cursor: 'pointer',
               boxShadow: '0 4px 15px rgba(59,130,246,0.3)'
             }}>
               Explorar Cátedras
             </button>
             <button style={{ 
               background: 'rgba(255,255,255,0.05)', 
               color: 'white', 
               padding: '1rem 2rem', 
               borderRadius: '12px', 
               fontWeight: 700,
               border: '1px solid rgba(255,255,255,0.2)',
               fontSize: '1rem',
               cursor: 'pointer',
               backdropFilter: 'blur(10px)'
             }}>
               Acceder al Simulacro
             </button>
          </div>
        </section>

        {/* Separador */}
        <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent)', margin: '0 4rem 4rem' }} />

        {/* ── Cátedras Section ── */}
        <Suspense fallback={<div style={{ height: '400px' }} />}>
          <CatedrasSection />
        </Suspense>

      </main>
      <Footer />
    </InteractiveSpotlightBackground>
  );
}
