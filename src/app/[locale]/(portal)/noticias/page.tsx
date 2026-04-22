import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { NoticiasPageClient } from './NoticiasPageClient';

export default async function NoticiasPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('noticias')
    .select('*')
    .eq('publicado', true)
    .order('fecha_publicacion', { ascending: false })
    .limit(9);

  const initialNoticias = (data || []) as any[];

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '8rem' }}>
      {/* Header */}
      <section style={{
        position: 'relative',
        paddingTop: '10rem',
        paddingBottom: '5rem',
        overflow: 'hidden',
      }}>
        {/* Decorative gradient */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '400px',
          background: 'radial-gradient(ellipse at center, rgba(234,183,0,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', position: 'relative' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
              marginBottom: '2rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            ← Portal AMIB
          </Link>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{
                color: 'var(--color-secondary-container)',
                fontWeight: 700,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>
                Prensa y Actualidad
              </span>
              <h1 style={{
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: 900,
                color: 'white',
                marginTop: '0.75rem',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}>
                Noticias AMIB
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '1rem', fontSize: '1.1rem', maxWidth: '500px' }}>
                Mantente informado sobre el mercado bursátil, certificaciones y actualidad del sector financiero.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div style={{ paddingTop: '1rem' }}>
        <NoticiasPageClient initialNoticias={initialNoticias} />
      </div>
    </main>
  );
}
