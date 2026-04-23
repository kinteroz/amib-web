import { Suspense } from 'react';
import Link from 'next/link';
import { InteractiveSpotlightBackground } from '@/components/ui/animations/InteractiveSpotlightBackground';
import { ScrollReveal } from '@/components/ui/animations/ScrollReveal';
import { createClient } from '@/lib/supabase/server';
import styles from '@/components/ui/animations/animations.module.css';
import { Database } from '@/types/database.types';
import { ProfileSelector } from '@/components/portal/certificaciones/ProfileSelector';
import { DocumentLibrary } from '@/components/portal/certificaciones/DocumentLibrary';
import { Footer } from '@/components/layout/Footer';

type Examen     = Database['public']['Tables']['examenes_certificacion']['Row'];
type Documento  = Database['public']['Tables']['documentos_cert']['Row'];
type Microsite  = Database['public']['Tables']['micrositios_cert']['Row'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ModalidadBadge({ modalidad }: { modalidad: Examen['modalidad'] }) {
  const map: Record<Examen['modalidad'], { label: string; color: string }> = {
    presencial: { label: 'Presencial', color: '#10B981' },
    distancia:  { label: 'En línea',   color: '#3B82F6' },
    ambas:      { label: 'Híbrido',    color: '#8B5CF6' },
  };
  const { label, color } = map[modalidad];
  return (
    <span style={{
      fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.05em', padding: '0.25rem 0.6rem', borderRadius: '6px',
      background: `${color}18`, color, border: `1px solid ${color}40`,
    }}>
      {label}
    </span>
  );
}

// ─── Server sections ──────────────────────────────────────────────────────────

async function ExamenesSection() {
  const supabase = await createClient();
  const hoy = new Date().toISOString().split('T')[0];

  const { data } = await supabase
    .from('examenes_certificacion')
    .select('*')
    .eq('activo', true)
    .gte('fecha', hoy)
    .order('fecha', { ascending: true })
    .limit(4);

  const examenes = (data || []) as Examen[];

  return (
    <ScrollReveal yOffset={50}>
      <div className={styles.glassCard} style={{ flexDirection: 'column', alignItems: 'stretch', marginBottom: '5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ color: 'var(--color-secondary-container)', fontWeight: 600, letterSpacing: '0.05em', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              Calendario
            </span>
            <h2 style={{ fontSize: '2.5rem', marginTop: '0.4rem', color: 'white' }}>
              Próximos Exámenes
            </h2>
          </div>
        </div>

        {examenes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.35)' }}>
            <p style={{ fontSize: '1.1rem' }}>No hay exámenes programados próximamente.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Consulta periódicamente esta sección o contáctanos.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {examenes.map((ex) => {
              const fecha = new Date(ex.fecha + 'T12:00:00');
              const dia   = fecha.toLocaleDateString('es-MX', { day: 'numeric' });
              const mes   = fecha.toLocaleDateString('es-MX', { month: 'short' }).toUpperCase();
              return (
                <div key={ex.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  padding: '1.25rem 1.5rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '14px',
                  flexWrap: 'wrap',
                }}>
                  {/* Fecha */}
                  <div style={{
                    flexShrink: 0, width: '56px', textAlign: 'center',
                    background: 'rgba(201,168,76,0.1)', borderRadius: '12px',
                    padding: '0.5rem', border: '1px solid rgba(201,168,76,0.2)',
                  }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-secondary-container)', lineHeight: 1 }}>{dia}</div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>{mes}</div>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <p style={{ fontWeight: 700, color: 'white', fontSize: '1rem', marginBottom: '0.25rem' }}>{ex.titulo}</p>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <ModalidadBadge modalidad={ex.modalidad} />
                      {ex.hora && (
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>
                          🕘 {ex.hora.slice(0, 5)} hrs
                        </span>
                      )}
                      {ex.sede && (
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>
                          📍 {ex.sede}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  {ex.url_registro && ex.url_registro !== '#' ? (
                    <a
                      href={ex.url_registro}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flexShrink: 0,
                        padding: '0.6rem 1.4rem',
                        background: 'var(--color-secondary-container)',
                        color: 'var(--color-primary)',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Registrarme
                    </a>
                  ) : (
                    <span style={{ flexShrink: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>
                      Próximamente
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ScrollReveal>
  );
}

async function MicrositiosSection() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('micrositios_cert')
    .select('id, slug, titulo, subtitulo, icono, color_acento, perfil_objetivo, tipo')
    .eq('activo', true)
    .order('orden', { ascending: true });

  const micrositios = (data || []) as Pick<Microsite, 'id' | 'slug' | 'titulo' | 'subtitulo' | 'icono' | 'color_acento' | 'perfil_objetivo' | 'tipo'>[];

  if (micrositios.length === 0) return null;

  return (
    <ScrollReveal yOffset={50}>
      <div className={styles.glassCard} style={{ flexDirection: 'column', alignItems: 'stretch', marginBottom: '5rem' }}>
        <span style={{ color: 'var(--color-secondary-container)', fontWeight: 600, letterSpacing: '0.05em', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
          Guías detalladas
        </span>
        <h2 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '2rem' }}>
          Rutas y Procesos
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {micrositios.map(m => {
            const acento = m.color_acento === 'gold' ? '#C9A84C'
              : m.color_acento === 'blue' ? '#3B82F6'
              : m.color_acento === 'teal' ? '#14B8A6'
              : '#C9A84C';
            return (
              <Link
                key={m.id}
                href={`/certificaciones/${m.slug}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1.75rem',
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${acento}10 0%, rgba(255,255,255,0.02) 100%)`,
                  border: `1px solid ${acento}30`,
                  textDecoration: 'none',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{m.icono || '📄'}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem', lineHeight: 1.25 }}>
                  {m.titulo}
                </h3>
                {m.subtitulo && (
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', flex: 1, lineHeight: 1.5 }}>
                    {m.subtitulo}
                  </p>
                )}
                <div style={{ marginTop: '1.25rem', color: acento, fontWeight: 700, fontSize: '0.85rem' }}>
                  Ver guía →
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </ScrollReveal>
  );
}

async function DocumentosSection() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('documentos_cert')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true });

  const documentos = (data || []) as Documento[];

  return (
    <ScrollReveal yOffset={50}>
      <div className={styles.glassCard} style={{ flexDirection: 'column', alignItems: 'stretch', marginBottom: '5rem' }}>
        <span style={{ color: 'var(--color-secondary-container)', fontWeight: 600, letterSpacing: '0.05em', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
          Recursos
        </span>
        <h2 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '2rem' }}>
          Biblioteca de Documentos
        </h2>
        <DocumentLibrary documentos={documentos} />
      </div>
    </ScrollReveal>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CertificacionesPage() {
  return (
    <InteractiveSpotlightBackground>
      <main>
        {/* ── Hero ── */}
        <section style={{
          minHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10rem 4rem 6rem',
          textAlign: 'center',
          position: 'relative',
        }}>
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(201,168,76,0.1)',
            border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: '100px',
            padding: '0.35rem 1rem',
            marginBottom: '2rem',
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              AMIB Certifica
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
            La certificación que respalda el mercado bursátil mexicano
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'rgba(255,255,255,0.6)',
            maxWidth: '650px',
            lineHeight: 1.7,
            marginBottom: '4rem',
          }}>
            Acredita tu competencia profesional con el organismo certificador de referencia en el sector bursátil de México.
          </p>

          {/* Stats */}
          <div style={{
            display: 'flex',
            gap: '3rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: '5rem',
            padding: '2rem 3rem',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(16px)',
          }}>
            {[
              { valor: '3',   etiqueta: 'Figuras de certificación' },
              { valor: '30+', etiqueta: 'Años de trayectoria' },
              { valor: '2',   etiqueta: 'Modalidades de examen' },
            ].map(s => (
              <div key={s.etiqueta} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-secondary-container)' }}>{s.valor}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>{s.etiqueta}</div>
              </div>
            ))}
          </div>

          {/* Selector de perfil */}
          <div style={{ width: '100%', maxWidth: '1100px' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>
              ¿Qué estás buscando?
            </p>
            <ProfileSelector />
          </div>
        </section>

        {/* Separador */}
        <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent)', margin: '0 4rem 6rem' }} />

        {/* ── Secciones ── */}
        <Suspense fallback={<div style={{ height: '300px' }} />}>
          <ExamenesSection />
        </Suspense>

        <Suspense fallback={<div style={{ height: '300px' }} />}>
          <MicrositiosSection />
        </Suspense>

        <Suspense fallback={<div style={{ height: '400px' }} />}>
          <DocumentosSection />
        </Suspense>

        {/* ── Sistemas ── */}
        <ScrollReveal yOffset={50}>
          <div className={styles.glassCard} style={{ flexDirection: 'column', alignItems: 'stretch', marginBottom: '5rem' }}>
            <span style={{ color: 'var(--color-secondary-container)', fontWeight: 600, letterSpacing: '0.05em', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
              Plataformas
            </span>
            <h2 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '2rem' }}>
              Acceso a Sistemas
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {[
                {
                  icono: '⚙️',
                  titulo: 'Sistema de Gestión Online (SGO)',
                  descripcion: 'Plataforma institucional para gestionar solicitudes, candidatos y trámites de certificación y autorización.',
                  href: '#',
                  acento: '#3B82F6',
                  etiqueta: 'Para instituciones',
                },
                {
                  icono: '🎓',
                  titulo: 'Institutos y Cursos',
                  descripcion: 'Accede al catálogo de institutos capacitadores autorizados por AMIB para prepararte para el examen.',
                  href: '#',
                  acento: '#C9A84C',
                  etiqueta: 'Para candidatos',
                },
                {
                  icono: '🖥️',
                  titulo: 'Simulador de Examen',
                  descripcion: 'Practica con exámenes de muestra en el mismo entorno que usarás el día de tu evaluación.',
                  href: '#',
                  acento: '#10B981',
                  etiqueta: 'Gratuito',
                },
              ].map(s => (
                <a key={s.titulo} href={s.href} style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: '2rem',
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${s.acento}10 0%, rgba(255,255,255,0.02) 100%)`,
                    border: `1px solid ${s.acento}30`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    transition: 'transform 0.25s ease',
                  }}>
                    <div style={{ fontSize: '2rem' }}>{s.icono}</div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: s.acento }}>{s.etiqueta}</span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', lineHeight: 1.2 }}>{s.titulo}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, flex: 1 }}>{s.descripcion}</p>
                    <div style={{ color: s.acento, fontWeight: 700, fontSize: '0.85rem' }}>Acceder →</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ── Contacto ── */}
        <ScrollReveal yOffset={50}>
          <div style={{ padding: '0 4rem', marginBottom: '8rem', maxWidth: '1600px', margin: '0 auto 8rem' }}>
            <div style={{
              padding: '3.5rem 4rem',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(201,168,76,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '2rem',
              flexWrap: 'wrap',
            }}>
              <div>
                <h3 style={{ fontSize: '1.8rem', color: 'white', fontWeight: 700, marginBottom: '0.5rem' }}>
                  ¿Tienes dudas sobre el proceso?
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem' }}>
                  El equipo de AMIB Certifica está disponible para orientarte.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <a href="mailto:certifica@amib.com.mx" style={{
                  padding: '0.85rem 1.75rem',
                  background: 'var(--color-secondary-container)',
                  color: 'var(--color-primary)',
                  borderRadius: '12px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                }}>
                  ✉ Escribir
                </a>
                <a href="tel:+525555962100" style={{
                  padding: '0.85rem 1.75rem',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'white',
                  borderRadius: '12px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  📞 Llamar
                </a>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </main>
      <Footer />
    </InteractiveSpotlightBackground>
  );
}
