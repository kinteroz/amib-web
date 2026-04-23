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
type Examen = Database['public']['Tables']['examenes_certificacion']['Row'];

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
  const hoy = new Date().toISOString().split('T')[0];

  const [{ data: certData }, { data: examenData }] = await Promise.all([
    supabase.from('certificaciones').select('*').eq('activo', true).neq('codigo', 'FC').order('orden', { ascending: true }).limit(4),
    supabase.from('examenes_certificacion').select('*').eq('activo', true).gte('fecha', hoy).order('fecha', { ascending: true }).limit(1),
  ]);

  const certificaciones = (certData || []) as Certificacion[];
  const proximoExamen   = (examenData?.[0] ?? null) as Examen | null;

  const RUTAS = [
    { icono: '👤', titulo: 'Soy candidato independiente', href: '/certificaciones/independientes', acento: '#C9A84C' },
    { icono: '🏛️', titulo: 'Mi institución necesita certificar', href: '/certificaciones/instituciones', acento: '#3B82F6' },
    { icono: '🔍', titulo: 'Consultar padrón certificado', href: '/certificaciones/padron', acento: '#10B981' },
  ];

  return (
    <ScrollReveal yOffset={60}>
      <div className={styles.glassCard} style={{ flexDirection: 'column', alignItems: 'stretch', marginBottom: '6rem', gap: '3.5rem' }}>

        {/* ── Bloque 1: Split propuesta de valor + rutas ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>

          {/* Izquierda: propuesta */}
          <div>
            <span style={{ color: 'var(--color-secondary-container)', fontWeight: 600, letterSpacing: '0.05em', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              AMIB Certifica
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', marginTop: '0.75rem', color: 'white', lineHeight: 1.1, fontWeight: 800 }}>
              Tu credencial en el mercado bursátil mexicano
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, fontSize: '1rem', marginTop: '1.25rem', maxWidth: '480px' }}>
              La certificación de referencia para profesionales del sector bursátil, avalada por más de 30 años de experiencia.
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '2.5rem', marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.07)', flexWrap: 'wrap' }}>
              {[
                { valor: `${certificaciones.length}`, etiqueta: 'Figuras de certificación' },
                { valor: '30+', etiqueta: 'Años de trayectoria' },
                { valor: '2',  etiqueta: 'Modalidades de examen' },
              ].map(s => (
                <div key={s.etiqueta}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-secondary-container)', lineHeight: 1 }}>{s.valor}</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.3rem' }}>{s.etiqueta}</div>
                </div>
              ))}
            </div>

            <Link href="/certificaciones" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              marginTop: '2rem', color: 'var(--color-secondary-container)',
              fontWeight: 700, fontSize: '0.9rem',
              borderBottom: '1px solid rgba(201,168,76,0.4)', paddingBottom: '2px',
              textDecoration: 'none',
            }}>
              Ver proceso completo →
            </Link>
          </div>

          {/* Derecha: selector de ruta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {RUTAS.map(r => (
              <Link key={r.href} href={r.href} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1.1rem 1.5rem',
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${r.acento}25`,
                borderRadius: '14px',
                textDecoration: 'none',
                transition: 'background 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
              }}>
                <span style={{
                  fontSize: '1.4rem', flexShrink: 0,
                  width: '44px', height: '44px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${r.acento}15`, borderRadius: '10px',
                }}>
                  {r.icono}
                </span>
                <span style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem', flex: 1 }}>
                  {r.titulo}
                </span>
                <span style={{ color: r.acento, fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Separador ── */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

        {/* ── Bloque 2: Figuras + próximo examen ── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Figuras de certificación
            </p>
            <Link href="/certificaciones" style={{ color: 'var(--color-secondary-container)', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', borderBottom: '1px solid rgba(201,168,76,0.4)' }}>
              Ver todas
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {certificaciones.map((cert) => (
              <Link key={cert.id} href="/certificaciones" style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '1.75rem',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  display: 'flex', flexDirection: 'column',
                  height: '100%',
                  transition: 'background 0.2s ease, border-color 0.2s ease, transform 0.25s ease',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <div style={{ width: '36px', height: '3px', background: 'var(--color-secondary-container)', borderRadius: '4px' }} />
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em',
                      textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
                      background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem',
                      borderRadius: '6px',
                    }}>
                      {cert.codigo}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', lineHeight: 1.25, marginBottom: '0.75rem', flex: 1 }}>
                    {cert.nombre}
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
                    {cert.descripcion}
                  </p>
                  <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {cert.vigencia_meses && (
                      <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                        Vigencia {cert.vigencia_meses} meses
                      </span>
                    )}
                    <span style={{ color: 'var(--color-secondary-container)', fontWeight: 700, fontSize: '0.82rem', marginLeft: 'auto' }}>
                      Más información →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Próximo examen (si existe) ── */}
        {proximoExamen && (() => {
          const fecha  = new Date(proximoExamen.fecha + 'T12:00:00');
          const fechaStr = fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });
          const modalidadMap: Record<string, string> = { presencial: 'Presencial', distancia: 'En línea', ambas: 'Híbrido' };
          return (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: '1.5rem', flexWrap: 'wrap',
              padding: '1.5rem 2rem',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(201,168,76,0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <span style={{ fontSize: '1.5rem' }}>📅</span>
                <div>
                  <p style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                    Próximo examen — {fechaStr}
                  </p>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)' }}>
                    {modalidadMap[proximoExamen.modalidad]}
                    {proximoExamen.sede ? ` · ${proximoExamen.sede}` : ''}
                  </p>
                </div>
              </div>
              {proximoExamen.url_registro && proximoExamen.url_registro !== '#' ? (
                <a href={proximoExamen.url_registro} target="_blank" rel="noopener noreferrer" style={{
                  padding: '0.65rem 1.5rem',
                  background: 'var(--color-secondary-container)',
                  color: 'var(--color-primary)',
                  borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem',
                  textDecoration: 'none', whiteSpace: 'nowrap',
                }}>
                  Registrarme
                </a>
              ) : (
                <Link href="/certificaciones" style={{
                  padding: '0.65rem 1.5rem',
                  background: 'rgba(201,168,76,0.12)',
                  color: 'var(--color-secondary-container)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem',
                  textDecoration: 'none', whiteSpace: 'nowrap',
                }}>
                  Ver calendario
                </Link>
              )}
            </div>
          );
        })()}

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

        {/* Separador visual Hero → contenido */}
        <div style={{
          height: '2px',
          background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent)',
          margin: '0 4rem',
        }} />

        <div style={{ paddingTop: '6rem' }}>
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
        </div>

        <div style={{ paddingTop: '2rem' }}>
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
      </main>
      <Footer />
    </InteractiveSpotlightBackground>
  );
}
