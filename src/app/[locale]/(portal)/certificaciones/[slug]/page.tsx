import { notFound } from 'next/navigation';
import Link from 'next/link';
import { InteractiveSpotlightBackground } from '@/components/ui/animations/InteractiveSpotlightBackground';
import { ScrollReveal } from '@/components/ui/animations/ScrollReveal';
import { createClient } from '@/lib/supabase/server';
import styles from '@/components/ui/animations/animations.module.css';
import { Database } from '@/types/database.types';
import { Footer } from '@/components/layout/Footer';

type Microsite = Database['public']['Tables']['micrositios_cert']['Row'];
type Documento = Database['public']['Tables']['documentos_cert']['Row'];

// ─── Types para contenido_json ────────────────────────────────────────────────

interface SeccionIntro  { tipo: 'intro'; titulo: string; contenido: string }
interface Paso          { numero: number; titulo: string; descripcion: string; icono?: string }
interface SeccionPasos  { tipo: 'pasos'; titulo: string; pasos: Paso[] }
interface SeccionReqs   { tipo: 'requisitos'; titulo: string; items: string[] }
interface PregResp      { pregunta: string; respuesta: string }
interface SeccionFaq    { tipo: 'faq'; titulo: string; preguntas: PregResp[] }
interface SeccionDocs   { tipo: 'documentos'; titulo: string; descripcion?: string }

type Seccion = SeccionIntro | SeccionPasos | SeccionReqs | SeccionFaq | SeccionDocs;

// ─── Renderers de sección ─────────────────────────────────────────────────────

function RendererIntro({ s, acento }: { s: SeccionIntro; acento: string }) {
  return (
    <div style={{
      padding: '2.5rem',
      background: `linear-gradient(135deg, ${acento}08 0%, rgba(255,255,255,0.02) 100%)`,
      borderRadius: '20px',
      border: `1px solid ${acento}20`,
      marginBottom: '2rem',
    }}>
      <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>{s.titulo}</h2>
      <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, fontSize: '1.05rem' }}>{s.contenido}</p>
    </div>
  );
}

function RendererPasos({ s, acento }: { s: SeccionPasos; acento: string }) {
  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'white', marginBottom: '2rem' }}>{s.titulo}</h2>
      <div style={{ position: 'relative' }}>
        {/* Línea vertical conectora */}
        <div style={{
          position: 'absolute', left: '27px', top: '48px', bottom: '48px', width: '2px',
          background: `linear-gradient(to bottom, ${acento}60, ${acento}10)`,
          zIndex: 0,
        }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
          {s.pasos.map((paso) => (
            <div key={paso.numero} style={{
              display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
              padding: '1.5rem 1.75rem',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px',
              backdropFilter: 'blur(8px)',
            }}>
              {/* Número */}
              <div style={{
                flexShrink: 0, width: '48px', height: '48px',
                borderRadius: '12px',
                background: `${acento}20`,
                border: `2px solid ${acento}50`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '1.1rem', color: acento,
              }}>
                {paso.icono || paso.numero}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, color: 'white', fontSize: '1rem', marginBottom: '0.4rem' }}>
                  {paso.titulo}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, fontSize: '0.95rem' }}>
                  {paso.descripcion}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RendererRequisitos({ s, acento }: { s: SeccionReqs; acento: string }) {
  return (
    <div style={{
      padding: '2rem 2.5rem',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '20px',
      marginBottom: '2rem',
    }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'white', marginBottom: '1.5rem' }}>{s.titulo}</h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {s.items.map((item, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: 1.5 }}>
            <span style={{ color: acento, fontWeight: 800, flexShrink: 0, marginTop: '2px' }}>✓</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RendererFaq({ s }: { s: SeccionFaq }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'white', marginBottom: '1.5rem' }}>{s.titulo}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {s.preguntas.map((pq, i) => (
          <details key={i} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px',
            overflow: 'hidden',
          }}>
            <summary style={{
              padding: '1.25rem 1.5rem',
              cursor: 'pointer',
              fontWeight: 600,
              color: 'white',
              fontSize: '0.95rem',
              listStyle: 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              userSelect: 'none',
            }}>
              {pq.pregunta}
              <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, flexShrink: 0, marginLeft: '1rem' }}>+</span>
            </summary>
            <div style={{
              padding: '0 1.5rem 1.25rem',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.95rem',
              lineHeight: 1.7,
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{ paddingTop: '1rem' }}>{pq.respuesta}</div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function RendererDocumentos({ s, documentos, acento }: { s: SeccionDocs; documentos: Documento[]; acento: string }) {
  if (documentos.length === 0) return null;
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>{s.titulo}</h2>
      {s.descripcion && <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>{s.descripcion}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {documentos.map(doc => (
          <div key={doc.id} style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '1rem 1.25rem',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '12px',
          }}>
            <span style={{ fontSize: '1.25rem' }}>📄</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>{doc.titulo}</p>
              {doc.descripcion && <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.2rem' }}>{doc.descripcion}</p>}
            </div>
            {doc.url_publica ? (
              <a href={doc.url_publica} target="_blank" rel="noopener noreferrer"
                style={{ color: acento, fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap', textDecoration: 'none' }}>
                ⬇ Descargar
              </a>
            ) : (
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.78rem', fontStyle: 'italic' }}>Próximamente</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function MicrositioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase  = await createClient();

  const { data: raw } = await supabase
    .from('micrositios_cert')
    .select('*')
    .eq('slug', slug)
    .eq('activo', true)
    .single();

  if (!raw) notFound();

  const microsite = raw as Microsite;

  const acento = microsite.color_acento === 'gold' ? '#C9A84C'
    : microsite.color_acento === 'blue'  ? '#3B82F6'
    : microsite.color_acento === 'teal'  ? '#14B8A6'
    : '#C9A84C';

  const contenido = microsite.contenido_json as { secciones: Seccion[] };
  const secciones: Seccion[] = contenido?.secciones || [];

  // Docs relacionados (si el microsite tiene sección "documentos")
  const needDocs = secciones.some(s => s.tipo === 'documentos');
  let documentos: Documento[] = [];
  if (needDocs) {
    const { data: docs } = await supabase
      .from('documentos_cert')
      .select('*')
      .eq('tipo_perfil', microsite.perfil_objetivo)
      .eq('activo', true)
      .order('orden', { ascending: true });
    documentos = (docs || []) as Documento[];
  }

  return (
    <InteractiveSpotlightBackground>
      <main>
        {/* ── Hero del microsite ── */}
        <section style={{
          padding: '9rem 4rem 5rem',
          maxWidth: '1600px',
          margin: '0 auto',
        }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>
            <Link href="/certificaciones" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontWeight: 600 }}>
              Certificaciones
            </Link>
            <span>›</span>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>{microsite.titulo}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{
              fontSize: '2.5rem',
              width: '72px', height: '72px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${acento}15`,
              border: `1px solid ${acento}30`,
              borderRadius: '20px',
              flexShrink: 0,
            }}>
              {microsite.icono || '📋'}
            </div>
            <div>
              <div style={{
                display: 'inline-block',
                background: `${acento}15`,
                border: `1px solid ${acento}30`,
                borderRadius: '100px',
                padding: '0.25rem 0.9rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: acento,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '0.75rem',
              }}>
                {microsite.perfil_objetivo === 'independiente' ? 'Candidato independiente'
                  : microsite.perfil_objetivo === 'institucion' ? 'Institucional'
                  : microsite.perfil_objetivo === 'consar'      ? 'CONSAR'
                  : 'General'}
              </div>
              <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 800, color: 'white', lineHeight: 1.1, margin: 0 }}>
                {microsite.titulo}
              </h1>
            </div>
          </div>

          {microsite.subtitulo && (
            <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: '720px', marginLeft: '88px' }}>
              {microsite.subtitulo}
            </p>
          )}
        </section>

        {/* ── Contenido ── */}
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 4rem 8rem' }}>
          <ScrollReveal yOffset={40}>
            {secciones.map((s, i) => {
              if (s.tipo === 'intro')       return <RendererIntro       key={i} s={s} acento={acento} />;
              if (s.tipo === 'pasos')       return <RendererPasos       key={i} s={s} acento={acento} />;
              if (s.tipo === 'requisitos')  return <RendererRequisitos  key={i} s={s} acento={acento} />;
              if (s.tipo === 'faq')         return <RendererFaq         key={i} s={s} />;
              if (s.tipo === 'documentos')  return <RendererDocumentos  key={i} s={s} documentos={documentos} acento={acento} />;
              return null;
            })}
          </ScrollReveal>

          {/* CTA final */}
          <div style={{
            marginTop: '3rem',
            padding: '2.5rem',
            borderRadius: '20px',
            background: `linear-gradient(135deg, ${acento}10 0%, rgba(255,255,255,0.02) 100%)`,
            border: `1px solid ${acento}25`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}>
            <div>
              <p style={{ fontWeight: 700, color: 'white', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                ¿Listo para comenzar?
              </p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                Contacta a AMIB Certifica para orientación personalizada.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a href="mailto:certifica@amib.com.mx" style={{
                padding: '0.75rem 1.5rem',
                background: acento,
                color: '#001426',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
              }}>
                Contactar
              </a>
              <Link href="/certificaciones" style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.9rem',
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                ← Volver
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </InteractiveSpotlightBackground>
  );
}

export async function generateStaticParams() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('micrositios_cert')
    .select('slug')
    .eq('activo', true);
  return (data || []).map(r => ({ slug: r.slug }));
}
