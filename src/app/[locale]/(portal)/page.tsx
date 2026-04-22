import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import Link from 'next/link';
import { InteractiveSpotlightBackground } from '@/components/ui/animations/InteractiveSpotlightBackground';
import { ScrollReveal } from '@/components/ui/animations/ScrollReveal';
import { CardSkeleton, Skeleton, BannerSkeleton, NewsGridSkeleton, CalendarSkeleton } from '@/components/ui/animations/Skeleton';
import { createClient } from '@/lib/supabase/server';
import styles from '@/components/ui/animations/animations.module.css';
import { Database } from '@/types/database.types';
import { AnimatedCounter } from '@/components/ui/branding/AnimatedCounter';
import { MarketPulse } from '@/components/ui/branding/MarketPulse';
import { MarketBar } from '@/components/ui/branding/MarketBar';
import { MarketMatrix } from '@/components/ui/branding/MarketMatrix';
import { EventsSection, UpcomingEventSection } from '@/components/ui/branding/EventsSection';

import { Footer } from '@/components/layout/Footer';

type Banner = Database['public']['Tables']['banners']['Row'];
type Noticia = Database['public']['Tables']['noticias']['Row'];
type Certificacion = Database['public']['Tables']['certificaciones']['Row'];

interface HomeProps {
  searchParams: Promise<{ q?: string }>;
}

async function NewsTicker() {
  const supabase = await createClient();
  const { data: notices } = await supabase
    .from('noticias')
    .select('titulo')
    .eq('publicado', true)
    .order('fecha_publicacion', { ascending: false })
    .limit(5);

  const items = (notices || []).map(n => (n as any).titulo as string) || ["AMIB: Fortaleciendo el Mercado Bursátil", "Certificaciones 2024 Disponibles", "Nueva Normativa de Autorregulación"];

  return (
    <div className={styles.newsTickerContainer}>
      <div className={styles.tickerLabel}>Actualidad</div>
      <div className={styles.tickerContent}>
        {items.map((item, i) => (
          <span key={i} className={styles.tickerItem}>{item}</span>
        ))}
        {/* Mirror items to avoid gaps in animation if content is short */}
        {items.map((item, i) => (
          <span key={`mirror-${i}`} className={styles.tickerItem}>{item}</span>
        ))}
      </div>
    </div>
  );
}

import { HeroCarousel } from '@/components/ui/branding/hero/HeroCarousel';

async function BannerSection({ query }: { query?: string }) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('banners')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true });

  const banners = (data || []) as Banner[];

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflow: 'hidden' }}>
      <HeroCarousel banners={banners} />
      
      {/* Static MarketBar overlay at the bottom of the Hero area */}
      <div style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 20,
        background: 'linear-gradient(to top, var(--color-primary), transparent)'
      }}>
        <MarketBar />
      </div>
    </div>
  );
}

async function NewsSection({ query }: { query?: string }) {
  const supabase = await createClient();

  let newsQuery = supabase
    .from('noticias')
    .select('*')
    .eq('publicado', true);

  if (query) {
    newsQuery = newsQuery.ilike('titulo', `%${query}%`);
  }

  const { data } = await newsQuery
    .order('fecha_publicacion', { ascending: false })
    .limit(6);

  const noticias = (data || []) as Noticia[];

  return (
    <ScrollReveal yOffset={60}>
      <div className={styles.glassCard} style={{ flexDirection: 'column', alignItems: 'stretch', marginBottom: '6rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
          <div>
            <span style={{ color: 'var(--color-secondary-container)', fontWeight: 600, letterSpacing: '0.05em', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              Prensa y Actualidad
            </span>
            <h2 style={{ fontSize: '3rem', marginTop: '0.5rem', color: 'white' }}>
              {query ? 'Resultados de Búsqueda' : 'Últimas Noticias'}
            </h2>
          </div>
          {!query && (
            <Link href="/noticias" style={{ color: 'var(--color-secondary-container)', fontWeight: 600, borderBottom: '2px solid var(--color-secondary-container)' }}>
              Ver todas
            </Link>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {noticias.length > 0 ? (
            (noticias as any[]).map((noticia) => (
              <Link
                key={noticia.id}
                href={`/noticias/${noticia.slug}`}
                className={styles.premiumCard}
                style={{
                  borderRadius: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  overflow: 'hidden',
                  textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.05)',
                  transition: 'transform 0.3s ease, border-color 0.3s ease',
                }}
              >
                {/* Media Header */}
                <div style={{ 
                  position: 'relative', 
                  width: '100%', 
                  aspectRatio: '16/10', 
                  background: 'linear-gradient(135deg, #001F3F 0%, #001226 100%)', 
                  overflow: 'hidden' 
                }}>
                  {noticia.video_url ? (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ position: 'absolute', zIndex: 2, background: 'rgba(0,0,0,0.5)', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                        <span style={{ color: 'white', marginLeft: '4px' }}>▶️</span>
                      </div>
                      {noticia.imagen_url && (
                        <img 
                          src={noticia.imagen_url} 
                          alt="" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} 
                        />
                      )}
                    </div>
                  ) : noticia.imagen_url ? (
                    <img 
                      src={noticia.imagen_url} 
                      alt="" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        transition: 'transform 0.5s ease',
                      }} 
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)' }}>
                      <span style={{ color: 'rgba(255,255,255,0.1)', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.2em' }}>AMIB PRESS</span>
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.7rem', color: 'white', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {noticia.categoria || 'General'}
                  </div>
                </div>

                <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', lineHeight: 1.3, color: 'white', fontWeight: 800 }}>{noticia.titulo}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {noticia.resumen}
                  </p>
                  <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                        {noticia.fecha_publicacion ? new Date(noticia.fecha_publicacion).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' }) : ''}
                      </div>
                      <span style={{ color: 'var(--color-secondary-container)', fontWeight: 700, fontSize: '0.85rem' }}>Leer más →</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p>No se encontraron noticias con los criterios de búsqueda.</p>
          )}
        </div>
      </div>
    </ScrollReveal>
  );
}

async function CertSection() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('certificaciones')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true })
    .limit(3);

  const certificaciones = (data || []) as Certificacion[];

  return (
    <ScrollReveal yOffset={60}>
      <div className={styles.glassCard} style={{ flexDirection: 'column', alignItems: 'stretch', marginBottom: '6rem' }}>
         <span style={{ color: 'var(--color-secondary-container)', fontWeight: 600, letterSpacing: '0.05em', fontSize: '0.85rem', textTransform: 'uppercase' }}>
          Desarrollo Profesional
        </span>
        <h2 style={{ fontSize: '3rem', marginTop: '1rem', marginBottom: '2.5rem', color: 'white' }}>
          Certificaciones AMIB
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          {certificaciones.map((cert) => (
            <div key={cert.id} className={styles.premiumCard} style={{ 
              padding: '2.5rem', 
              borderRadius: '16px', 
            }}>
              <div style={{ width: '40px', height: '4px', background: 'var(--color-secondary-container)', marginBottom: '1.5rem', borderRadius: '4px' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-secondary-container)' }}>{cert.codigo}</span>
              <h3 style={{ fontSize: '1.6rem', marginTop: '0.5rem', marginBottom: '1rem', color: 'white' }}>{cert.nombre}</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontSize: '1rem' }}>{cert.descripcion}</p>
            </div>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}



export default async function HomePage({ searchParams }: HomeProps) {
  const { q } = await searchParams;

  return (
    <InteractiveSpotlightBackground>
      <Suspense fallback={null}>
        <NewsTicker />
      </Suspense>
      <main>
        <Suspense fallback={<BannerSkeleton />}>
          <BannerSection query={q} />
        </Suspense>

        {/* Suspenses & Components Reordered */}
        <div style={{ paddingTop: '0' }}> {/* Full-bleed: event section flows directly from hero */}
          <Suspense fallback={<div style={{ height: '300px' }} />}>
            <UpcomingEventSection />
          </Suspense>
        </div>

        <Suspense fallback={
          <ScrollReveal yOffset={60}>
            <div className={styles.glassCard} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <Skeleton width="200px" height="14px" style={{ marginBottom: '1rem' }} />
              <Skeleton width="400px" height="40px" style={{ marginBottom: '2.5rem' }} />
              <NewsGridSkeleton />
            </div>
          </ScrollReveal>
        }>
          <NewsSection query={q} />
        </Suspense>


        <Suspense fallback={
          <ScrollReveal yOffset={60}>
            <div className={styles.glassCard} style={{ flexDirection: 'column', alignItems: 'stretch', maxWidth: '1600px', width: '98%', padding: '2rem 4rem' }}>
              <Skeleton width="150px" height="14px" style={{ marginBottom: '1rem' }} />
              <Skeleton width="350px" height="40px" style={{ marginBottom: '2.5rem' }} />
              <CalendarSkeleton />
            </div>
          </ScrollReveal>
        }>
          <EventsSection />
        </Suspense>

        <Suspense fallback={
          <ScrollReveal yOffset={60}>
            <div className={styles.glassCard} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
               <Skeleton width="180px" height="14px" style={{ marginBottom: '1rem' }} />
               <Skeleton width="300px" height="40px" style={{ marginBottom: '2.5rem' }} />
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                  {[1, 2, 3].map(i => <div key={i} className={styles.premiumCard} style={{ height: '250px', borderRadius: '16px' }}><Skeleton width="100%" height="100%" /></div>)}
               </div>
            </div>
          </ScrollReveal>
        }>
          <CertSection />
        </Suspense>
      </main>
      <Footer />
    </InteractiveSpotlightBackground>
  );
}
