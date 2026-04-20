import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { InteractiveSpotlightBackground } from '@/components/ui/animations/InteractiveSpotlightBackground';
import { StackedSection } from '@/components/ui/animations/StackedSection';
import { CardSkeleton, Skeleton } from '@/components/ui/animations/Skeleton';
import { createClient } from '@/lib/supabase/server';
import styles from '@/components/ui/animations/animations.module.css';
import { Database } from '@/types/database.types';
import { AnimatedCounter } from '@/components/ui/branding/AnimatedCounter';
import { MarketPulse } from '@/components/ui/branding/MarketPulse';
import { MarketBar } from '@/components/ui/branding/MarketBar';
import { MarketMatrix } from '@/components/ui/branding/MarketMatrix';

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
    <StackedSection index={0} totalSections={6}>
      <div className={styles.fullBleedHero}>
        <MarketMatrix />
        <div className={styles.grainOverlay} />
        <MarketPulse />
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
          <span style={{ color: 'var(--color-secondary-container)', fontWeight: 600, letterSpacing: '0.3em', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '2.5rem' }}>
            {activeBanner?.subtitulo || "Autoridad Bursátil de México"}
          </span>
          <h1 style={{ 
            fontSize: 'clamp(3rem, 9vw, 7rem)', 
            lineHeight: 0.9, 
            maxWidth: '1300px',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            marginBottom: '4rem'
          }}>
            {activeBanner?.titulo || t('title')}
          </h1>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6rem', marginTop: '2rem' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: 'var(--color-secondary-container)', fontSize: '3rem', fontWeight: 800 }}>
                <AnimatedCounter value={30} suffix="+" />
              </div>
              <div style={{ opacity: 0.5, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Años de Trayectoria</div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: 'var(--color-secondary-container)', fontSize: '3rem', fontWeight: 800 }}>
                <AnimatedCounter value={15} suffix="k+" />
              </div>
              <div style={{ opacity: 0.5, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Certificados</div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: 'var(--color-secondary-container)', fontSize: '3rem', fontWeight: 800 }}>
                <AnimatedCounter value={200} suffix="+" />
              </div>
              <div style={{ opacity: 0.5, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Instituciones</div>
            </div>
          </div>
        </div>

        <div style={{ width: '100%', zIndex: 20, background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)' }}>
          <MarketBar />
        </div>
      </div>
    </StackedSection>
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
    <StackedSection index={1} totalSections={6}>
      <div className={`${styles.glassCard} ${styles.lightMode}`} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
          <div>
            <span style={{ color: 'var(--color-secondary)', fontWeight: 600, letterSpacing: '0.05em', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              Prensa y Actualidad
            </span>
            <h2 style={{ fontSize: '3rem', marginTop: '0.5rem', color: 'var(--color-primary-container)' }}>
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
              <div key={noticia.id} style={{ 
                padding: '2rem', 
                background: 'var(--surface-container-highest)', 
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  {noticia.categoria || 'General'}
                </span>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', lineHeight: 1.3 }}>{noticia.titulo}</h3>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem', flex: 1 }}>{noticia.resumen}</p>
                <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--on-surface)', opacity: 0.6 }}>
                  {noticia.fecha_publicacion ? new Date(noticia.fecha_publicacion).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                </div>
              </div>
            ))
          ) : (
            <p>No se encontraron noticias con los criterios de búsqueda.</p>
          )}
        </div>
      </div>
    </StackedSection>
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
    <StackedSection index={2} totalSections={6}>
      <div className={`${styles.glassCard} ${styles.lightMode}`} style={{ background: 'var(--surface-container-low)', flexDirection: 'column', alignItems: 'stretch' }}>
         <span style={{ color: 'var(--color-secondary)', fontWeight: 600, letterSpacing: '0.05em', fontSize: '0.85rem', textTransform: 'uppercase' }}>
          Desarrollo Profesional
        </span>
        <h2 style={{ fontSize: '3rem', marginTop: '1rem', marginBottom: '2.5rem', color: 'var(--color-primary-container)' }}>
          Certificaciones AMIB
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          {certificaciones.map((cert) => (
            <div key={cert.id} style={{ 
              background: 'white', 
              padding: '2.5rem', 
              borderRadius: '12px', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
              border: '1px solid var(--glass-border)'
            }}>
              <div style={{ width: '40px', height: '4px', background: 'var(--color-secondary-container)', marginBottom: '1.5rem' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>{cert.codigo}</span>
              <h3 style={{ fontSize: '1.6rem', marginTop: '0.5rem', marginBottom: '1rem' }}>{cert.nombre}</h3>
              <p style={{ color: 'var(--on-surface-variant)', lineHeight: 1.5, fontSize: '1rem' }}>{cert.descripcion}</p>
            </div>
          ))}
        </div>
      </div>
    </StackedSection>
  );
}

function SelfRegSection() {
    return (
        <StackedSection index={3} totalSections={6}>
            <div className={styles.glassCard} style={{ background: 'var(--color-primary-container)', color: 'white', border: 'none', gap: '6rem' }}>
                <div style={{ flex: 1, textAlign: 'left' }}>
                    <span style={{ color: 'var(--color-secondary-container)', fontWeight: 600, letterSpacing: '0.2em', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                        Autorregulación
                    </span>
                    <h2 style={{ fontSize: '4.5rem', marginTop: '1.5rem', lineHeight: 1, fontWeight: 700 }}>
                        Estándares que <br/> <span style={{ opacity: 0.5 }}>Transforman.</span>
                    </h2>
                    <p style={{ fontSize: '1.1rem', marginTop: '2rem', opacity: 0.8, maxWidth: '500px', lineHeight: 1.6 }}>
                        Garantizamos una sana competencia y la integridad del mercado mediante normativas robustas y supervisión proactiva.
                    </p>
                </div>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Estandarización</h4>
                        <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>Prácticas justas.</p>
                    </div>
                    <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Ética</h4>
                        <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>Conducta ejemplar.</p>
                    </div>
                    <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', gridColumn: 'span 2' }}>
                        <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Supervisión Ambiental</h4>
                        <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>Compromiso con la sostenibilidad financiera.</p>
                    </div>
                </div>
            </div>
        </StackedSection>
    );
}

function EducationSection() {
    return (
        <StackedSection index={4} totalSections={6}>
            <div className={`${styles.glassCard} ${styles.lightMode}`} style={{ background: 'white', flexDirection: 'row-reverse', gap: '8rem' }}>
                <div style={{ flex: 1, textAlign: 'left' }}>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 600, letterSpacing: '0.1em', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                        Educación Financiera
                    </span>
                    <h2 style={{ fontSize: '3.5rem', marginTop: '1.5rem', lineHeight: 1.1, color: 'var(--color-primary-container)' }}>
                        Fortaleciendo la Cultura Bursátil.
                    </h2>
                    <p style={{ fontSize: '1.1rem', marginTop: '2rem', color: 'var(--on-surface-variant)', maxWidth: '500px', lineHeight: 1.6 }}>
                        Programas diseñados para elevar el conocimiento técnico y estratégico de los profesionales del mercado.
                    </p>
                    <button style={{ 
                        marginTop: '3rem', 
                        padding: '1rem 2.5rem', 
                        background: 'var(--color-primary-container)', 
                        color: 'white', 
                        borderRadius: '100px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer'
                    }}>
                        Explorar Cursos
                    </button>
                </div>
                <div style={{ flex: 1, position: 'relative' }}>
                    <div style={{ width: '100%', height: '400px', background: '#f1f5f9', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {/* Placeholder for educational abstract art or image */}
                         <div style={{ fontSize: '5rem', opacity: 0.1 }}>📘</div>
                    </div>
                </div>
            </div>
        </StackedSection>
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
        <Suspense fallback={<div style={{ height: '100vh' }} />}>
          <BannerSection query={q} />
        </Suspense>

        <Suspense fallback={<div style={{ height: '100vh' }} />}>
          <NewsSection query={q} />
        </Suspense>

        <Suspense fallback={<div style={{ height: '100vh' }} />}>
          <CertSection />
        </Suspense>

        <SelfRegSection />
        
        <EducationSection />

         <StackedSection index={5} totalSections={6}>
          <div className={styles.glassCard} style={{ textAlign: 'center', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Confianza e Integridad en el Mercado</h2>
            <p style={{ opacity: 0.8, maxWidth: '700px', margin: '0 auto', lineHeight: 1.7 }}>
              Como organismo autorregulatorio, la AMIB trabaja para fortalecer la cultura financiera y garantizar que los servicios bursátiles se presten bajo los más estrictos criterios de profesionalismo.
            </p>
            <div style={{ marginTop: '4rem', display: 'flex', gap: '4rem', opacity: 0.4, justifyContent: 'center' }}>
                <span style={{ fontWeight: 800 }}>BMV GROUP</span>
                <span style={{ fontWeight: 800 }}>BIVA</span>
                <span style={{ fontWeight: 800 }}>CNBV</span>
                <span style={{ fontWeight: 800 }}>BANXICO</span>
            </div>
          </div>
        </StackedSection>
      </main>
    </InteractiveSpotlightBackground>
  );
}
