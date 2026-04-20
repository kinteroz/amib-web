import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
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

async function BannerSection({ query }: { query?: string }) {
  const t = await getTranslations('HomePage');
  const supabase = await createClient();

  const { data } = await supabase
    .from('banners')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true });

  const activeBanner = (data?.[0] as unknown as Banner) || null;

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className={styles.fullBleedHero} style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0 }}>
        <MarketMatrix />
        <div className={styles.grainOverlay} />
        <MarketPulse />

        {/* Contenido centrado */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '1400px', margin: '0 auto', justifyContent: 'center', zIndex: 10, padding: '130px 5% 0 5%' }}>
          <ScrollReveal yOffset={30} delay={0.1}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '2.5rem' }}>
              <span style={{ color: 'var(--color-secondary-container)', fontWeight: 600, letterSpacing: '0.3em', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                {activeBanner?.subtitulo || "Autoridad Bursátil de México"}
              </span>
              <h1 style={{ 
                fontSize: 'clamp(2.5rem, 6.5vw, 4.8rem)', 
                lineHeight: 1.1, 
                fontWeight: 800,
                letterSpacing: '-0.04em',
                marginBottom: '2rem'
              }}>
                {activeBanner?.titulo || t('title')}
              </h1>
            </div>
          </ScrollReveal>
  
          {/* Pilares Institucionales */}
          <ScrollReveal yOffset={60} delay={0.3}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', width: '100%', paddingBottom: '2rem' }}>
              <div className={styles.premiumCard} style={{ padding: '1.5rem', borderRadius: '16px' }}>
                <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.4rem', fontWeight: 800 }}>Autorregulación</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: 1.4 }}>Garantizamos integridad y competencia con normativas robustas y supervisión proactiva.</p>
              </div>
              <div className={styles.premiumCard} style={{ padding: '1.5rem', borderRadius: '16px' }}>
                <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.4rem', fontWeight: 800 }}>Educación Financiera</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: 1.4 }}>Programas especializados para elevar el conocimiento técnico y cultivar profesionales.</p>
              </div>
              <div className={styles.premiumCard} style={{ padding: '1.5rem', borderRadius: '16px' }}>
                <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.4rem', fontWeight: 800 }}>Confianza y Ética</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: 1.4 }}>Fomentamos las mejores prácticas globales alineadas con BMV, BIVA y autoridades.</p>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Barra de Indicadores */}
        <div style={{ width: '100%', zIndex: 20 }}>
          <MarketBar />
        </div>

        {/* Difuminado inferior */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '20vh', background: 'linear-gradient(to top, var(--color-primary-container), transparent)', zIndex: 11, pointerEvents: 'none' }} />
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
    .limit(4);

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
            <a href="#" style={{ color: 'var(--color-primary-container)', fontWeight: 600, borderBottom: '2px solid var(--color-secondary-container)' }}>
              Ver todas
            </a>
          )}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {noticias.length > 0 ? (
            noticias.map((noticia) => (
              <div key={noticia.id} className={styles.premiumCard} style={{ 
                padding: '2rem', 
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary-container)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  {noticia.categoria || 'General'}
                </span>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', lineHeight: 1.3, color: 'white' }}>{noticia.titulo}</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', flex: 1 }}>{noticia.resumen}</p>
                <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>📅</span>
                  {noticia.fecha_publicacion ? new Date(noticia.fecha_publicacion).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                </div>
              </div>
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
        <div style={{ paddingTop: '6rem' }}> {/* Spacer to separate event from hero */}
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
