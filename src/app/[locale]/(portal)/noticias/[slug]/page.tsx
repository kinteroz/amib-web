import { getNoticiaBySlugServer } from '@/lib/cms-actions-server';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

function normalizeContent(raw: string | null): string {
  if (!raw) return '';
  // SQL single-quoted strings store \n as two chars (backslash + n). Normalize to real newlines.
  return raw.replace(/\\n/g, '\n');
}

function readingMinutes(content: string | null): number {
  return Math.max(1, Math.ceil((content?.replace(/\\n/g, '\n').length || 0) / 1000));
}

const CATEGORIA_COLORS: Record<string, string> = {
  INSTITUCIONAL: '#3b82f6',
  MERCADOS:      '#10b981',
  EDUCACION:     '#8b5cf6',
  PRENSA:        '#f59e0b',
};

export default async function NoticiaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const noticiaData = await getNoticiaBySlugServer(slug);
  const noticia = noticiaData as any;

  if (!noticia) {
    return (
      <div style={{ padding: '10rem 2rem', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Noticia no encontrada</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>La noticia que buscas no existe o ha sido movida.</p>
        <Link href="/noticias" style={{ color: 'var(--color-secondary-container)', marginTop: '2rem', display: 'inline-block', fontWeight: 700 }}>
          ← Ver todas las noticias
        </Link>
      </div>
    );
  }

  const content = normalizeContent(noticia.contenido);
  const categoriaColor = CATEGORIA_COLORS[noticia.categoria] || 'var(--color-secondary-container)';

  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-primary)' }}>

      {/* ── HERO ── */}
      <section style={{
        position: 'relative',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        overflow: 'hidden',
      }}>
        {/* Imagen de fondo */}
        {noticia.imagen_url && (
          <>
            <img
              src={noticia.imagen_url}
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }}
            />
            {/* Gradiente de abajo hacia arriba más pronunciado */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,15,50,0.3) 0%, rgba(0,15,50,0.7) 50%, var(--color-primary) 100%)' }} />
          </>
        )}

        {/* Nav breadcrumb */}
        <div style={{ position: 'absolute', top: '6rem', left: 0, right: 0, padding: '0 2rem', zIndex: 2 }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <Link href="/noticias" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', fontWeight: 700,
              textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em',
              background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)',
              padding: '0.45rem 1rem', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)',
            }}>
              ← Noticias
            </Link>
          </div>
        </div>

        {/* Título del artículo */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 2rem 4rem' }}>
          {/* Categoría badge */}
          <span style={{
            display: 'inline-block',
            background: categoriaColor,
            color: 'white',
            fontSize: '0.7rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            padding: '0.4rem 1rem',
            borderRadius: '50px',
            marginBottom: '1.25rem',
          }}>
            {noticia.categoria}
          </span>

          <h1 style={{
            fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
            fontWeight: 900,
            color: 'white',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            marginBottom: '1.5rem',
          }}>
            {noticia.titulo}
          </h1>

          {/* Meta */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', fontWeight: 600 }}>
            <span>
              {noticia.fecha_publicacion
                ? new Date(noticia.fecha_publicacion).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
                : ''}
            </span>
            <span>{readingMinutes(noticia.contenido)} min de lectura</span>
          </div>
        </div>
      </section>

      {/* ── CONTENIDO ── */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem 8rem' }}>

        {/* Video embed */}
        {noticia.video_url && (
          <div style={{
            width: '100%', aspectRatio: '16/9',
            borderRadius: '24px', overflow: 'hidden',
            marginBottom: '4rem', background: '#000',
            boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            {(() => {
              const url = noticia.video_url;
              
              // YouTube Detection
              const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/);
              if (ytMatch) {
                const videoId = ytMatch[1].split('&')[0];
                return (
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    style={{ border: 'none' }}
                  />
                );
              }

              // Vimeo Detection
              const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(.+)/);
              if (vimeoMatch) {
                const vimeoId = vimeoMatch[1];
                return (
                  <iframe 
                    src={`https://player.vimeo.com/video/${vimeoId}?h=0&badge=0&autopause=0&player_id=0&app_id=58479`} 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    allow="autoplay; fullscreen; picture-in-picture" 
                    allowFullScreen
                    style={{ border: 'none' }}
                  />
                );
              }

              // Direct MP4 or other video files
              return (
                <video 
                  src={url} 
                  controls 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              );
            })()}
          </div>
        )}

        {/* Resumen destacado */}
        {noticia.resumen && (
          <div style={{
            borderLeft: `4px solid ${categoriaColor}`,
            paddingLeft: '1.5rem',
            marginBottom: '2.5rem',
            color: 'rgba(255,255,255,0.75)',
            fontSize: '1.15rem',
            lineHeight: 1.7,
            fontStyle: 'italic',
          }}>
            {noticia.resumen}
          </div>
        )}

        {/* Cuerpo markdown */}
        <article style={{
          fontSize: '1.05rem',
          lineHeight: 1.85,
          color: 'rgba(255,255,255,0.82)',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => (
                <h1 style={{ color: 'white', fontSize: '2.25rem', fontWeight: 900, marginTop: '3rem', marginBottom: '1.25rem', letterSpacing: '-0.02em', lineHeight: 1.2 }} {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 style={{ color: 'white', fontSize: '1.65rem', fontWeight: 800, marginTop: '3rem', marginBottom: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.07)' }} {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.75rem' }} {...props} />
              ),
              p: ({ node, ...props }) => (
                <p style={{ marginBottom: '1.5rem', color: 'rgba(255,255,255,0.82)' }} {...props} />
              ),
              strong: ({ node, ...props }) => (
                <strong style={{ color: 'white', fontWeight: 700 }} {...props} />
              ),
              em: ({ node, ...props }) => (
                <em style={{ color: 'rgba(255,255,255,0.7)' }} {...props} />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote style={{
                  borderLeft: `4px solid ${categoriaColor}`,
                  paddingLeft: '1.5rem', margin: '2rem 0',
                  color: 'rgba(255,255,255,0.65)', fontStyle: 'italic',
                  fontSize: '1.1rem', lineHeight: 1.7,
                }} {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }} {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol style={{ paddingLeft: '1.5rem', marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }} {...props} />
              ),
              li: ({ node, ...props }) => (
                <li style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }} {...props} />
              ),
              img: ({ node, ...props }) => (
                <span style={{ display: 'block', margin: '2.5rem 0' }}>
                  <img style={{ width: '100%', borderRadius: '12px', boxShadow: '0 16px 40px rgba(0,0,0,0.4)' }} {...props} />
                </span>
              ),
              a: ({ node, ...props }) => (
                <a style={{ color: categoriaColor, textDecoration: 'underline', textUnderlineOffset: '3px' }} {...props} />
              ),
              code: ({ node, ...props }) => (
                <code style={{ background: 'rgba(255,255,255,0.08)', padding: '0.15em 0.4em', borderRadius: '4px', fontSize: '0.9em', color: 'rgba(255,255,255,0.9)' }} {...props} />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </article>

        {/* Footer del artículo */}
        <div style={{
          marginTop: '4rem',
          paddingTop: '2.5rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <Link
            href="/noticias"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.85rem 2rem', background: 'white', color: '#001F3F',
              borderRadius: '50px', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem',
            }}
          >
            ← Ver todas las noticias
          </Link>
          <Link
            href="/"
            style={{
              padding: '0.85rem 2rem',
              background: 'transparent',
              color: 'rgba(255,255,255,0.6)',
              borderRadius: '50px',
              fontWeight: 600,
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.15)',
              fontSize: '0.95rem',
            }}
          >
            Inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
