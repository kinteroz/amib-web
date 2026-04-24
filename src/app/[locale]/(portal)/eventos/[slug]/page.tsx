import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { FullBleedHero } from '@/components/ui/branding/FullBleedHero';
import Link from 'next/link';
import { LiveQA } from '@/components/ui/events/LiveQA';
import { Metadata } from 'next';
import Image from 'next/image';

interface EventoPageProps {
  params: Promise<{ slug: string, locale: string }>;
}

export async function generateMetadata({ params }: EventoPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const supabase = await createClient();
  
  const { data: evento } = await supabase
    .from('eventos')
    .select('titulo, descripcion, imagen_url')
    .eq('slug', slug)
    .single();

  if (!evento) return { title: 'Evento no encontrado | AMIB' };

  return {
    title: `${evento.titulo} | Eventos AMIB`,
    description: evento.descripcion || `Participa en ${evento.titulo}. Organizado por la Asociación Mexicana de Instituciones Bursátiles.`,
    openGraph: {
      title: evento.titulo,
      description: evento.descripcion || '',
      images: evento.imagen_url ? [{ url: evento.imagen_url }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: evento.titulo,
      description: evento.descripcion || '',
      images: evento.imagen_url ? [evento.imagen_url] : [],
    }
  };
}

export default async function EventoDetailPage({ params }: EventoPageProps) {
  const { slug, locale } = await params;
  const supabase = await createClient();

  // Fetch Event by slug
  const { data: evento, error } = (await supabase
    .from('eventos')
    .select('*')
    .eq('slug', slug)
    .single()) as any;

  if (error || !evento) {
    notFound();
  }
  
  const id = evento.id;

  // Fetch Speakers
  const { data: ponentes } = await supabase
    .from('evento_ponentes')
    .select('*')
    .eq('evento_id', id)
    .order('orden', { ascending: true });

  // Fetch Gallery
  const { data: galeria } = await supabase
    .from('evento_galeria')
    .select('*')
    .eq('evento_id', id)
    .order('orden', { ascending: true });

  // Fetch Tickets
  const { data: tickets } = await supabase
    .from('evento_tickets')
    .select('*')
    .eq('evento_id', id)
    .order('precio', { ascending: true });

  // Fetch Attendance count
  const { count: asistentesCount } = await supabase
    .from('evento_asistentes')
    .select('*', { count: 'exact', head: true })
    .eq('evento_id', id);

  const layout = evento.layout_tipo || 'classic';
  const configReg = evento.configuracion_registro || {};
  const maxCupo = configReg.cupo_maximo || Infinity;
  const isPastEvent = new Date(evento.fecha_inicio) < new Date();
  const isSoldOut = maxCupo !== Infinity && (asistentesCount || 0) >= maxCupo;
  const isRegistrationOpen = !isPastEvent && !isSoldOut;

  return (
    <div style={{ minHeight: '100vh', background: layout === 'immersive' ? '#0f172a' : '#f8fafc' }}>
      {/* Hero Section */}
      {evento.tipo_hero === 'fullscreen-image' || evento.tipo_hero === 'fullscreen-video' ? (
         <FullBleedHero 
            title={evento.titulo}
            subtitle={evento.descripcion || ''}
            accent={evento.badge_texto || undefined}
         >
            {isRegistrationOpen ? (
                <Link href={`/${locale}/eventos/${slug}/registro`} style={{ background: '#38bdf8', color: '#001F3F', padding: '1rem 2.5rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
                    {evento.cta_texto || 'Registrarse Ahora'}
                </Link>
            ) : (
                <div style={{ background: isPastEvent ? '#64748b' : '#ef4444', color: 'white', padding: '1rem 2.5rem', borderRadius: '8px', fontWeight: 700, display: 'inline-block', opacity: 0.8 }}>
                    {isPastEvent ? 'Evento Finalizado' : 'Cupo Agotado'}
                </div>
            )}
         </FullBleedHero>
      ) : (
         <div style={{ 
            padding: '8rem 2rem 4rem', 
            background: layout === 'immersive' ? '#1e293b' : 'white', 
            borderBottom: '1px solid',
            borderColor: layout === 'immersive' ? '#334155' : '#e2e8f0',
            textAlign: 'center' 
         }}>
             {evento.badge_texto && <span style={{ background: '#001F3F', color: 'white', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem', display: 'inline-block' }}>{evento.badge_texto}</span>}
             <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: layout === 'immersive' ? 'white' : '#0f172a', marginBottom: '1rem' }}>{evento.titulo}</h1>
             <p style={{ fontSize: '1.2rem', color: layout === 'immersive' ? '#94a3b8' : '#64748b', maxWidth: '800px', margin: '0 auto 2rem' }}>{evento.descripcion}</p>
             {isRegistrationOpen ? (
                 <Link href={`/${locale}/eventos/${slug}/registro`} style={{ background: '#001F3F', color: 'white', padding: '1rem 2.5rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
                     {evento.cta_texto || 'Registrarse Ahora'}
                 </Link>
             ) : (
                 <div style={{ background: isPastEvent ? '#64748b' : '#ef4444', color: 'white', padding: '1rem 2.5rem', borderRadius: '8px', fontWeight: 700, display: 'inline-block', opacity: 0.8 }}>
                     {isPastEvent ? 'Evento Finalizado' : 'Cupo Agotado'}
                 </div>
             )}
         </div>
      )}

      {/* Main Content Area based on Layout */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', display: 'grid', gap: '4rem' }}>
        
        {/* Información General */}
        <section>
            <div style={{ 
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem',
                background: layout === 'immersive' ? 'rgba(255,255,255,0.02)' : '#ffffff',
                padding: '2rem', borderRadius: '16px',
                border: `1px solid ${layout === 'immersive' ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                boxShadow: layout === 'immersive' ? 'none' : '0 10px 30px -10px rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '2rem' }}>📅</div>
                    <div>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: layout === 'immersive' ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha</h4>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: layout === 'immersive' ? 'white' : '#0f172a', marginTop: '0.2rem' }}>
                            {new Date(evento.fecha_inicio).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        {evento.fecha_fin && (
                            <div style={{ fontSize: '0.9rem', color: layout === 'immersive' ? '#94a3b8' : '#64748b' }}>
                                al {new Date(evento.fecha_fin).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '2rem' }}>📍</div>
                    <div>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: layout === 'immersive' ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ubicación</h4>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: layout === 'immersive' ? 'white' : '#0f172a', marginTop: '0.2rem' }}>
                            {evento.ubicacion || 'Por definir'}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: layout === 'immersive' ? '#94a3b8' : '#64748b', textTransform: 'capitalize' }}>
                            Modalidad: {evento.modalidad || 'Presencial'}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '2rem' }}>🎟️</div>
                    <div>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: layout === 'immersive' ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Acceso</h4>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: layout === 'immersive' ? 'white' : '#0f172a', marginTop: '0.2rem', textTransform: 'capitalize' }}>
                            {evento.tipo_acceso === 'libre' ? 'Gratuito' : evento.tipo_acceso === 'invitacion' ? 'Por Invitación' : 'Con Costo'}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: layout === 'immersive' ? '#94a3b8' : '#64748b' }}>
                            Dirigido a: <span style={{ textTransform: 'capitalize' }}>{evento.audiencia || 'Público General'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Tickets / Costos */}
        {evento.tipo_acceso === 'pago' && tickets && tickets.length > 0 && (
            <section>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, color: layout === 'immersive' ? 'white' : '#0f172a', marginBottom: '2rem', textAlign: layout === 'classic' ? 'left' : 'center' }}>Adquiere tu Boleto</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    {tickets.map((t: any) => (
                        <div key={t.id} style={{ 
                            background: layout === 'immersive' ? 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)' : 'white', 
                            padding: '2.5rem 2rem', 
                            borderRadius: '16px',
                            border: `1px solid ${layout === 'immersive' ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                            boxShadow: layout === 'immersive' ? 'none' : '0 10px 25px -5px rgba(0,0,0,0.05)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
                        }}>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: layout === 'immersive' ? 'white' : '#001F3F', marginBottom: '0.5rem' }}>{t.nombre}</h3>
                            {t.descripcion && <p style={{ fontSize: '0.9rem', color: layout === 'immersive' ? '#94a3b8' : '#64748b', marginBottom: '1.5rem' }}>{t.descripcion}</p>}
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: layout === 'immersive' ? '#38bdf8' : '#0f172a', marginBottom: '2rem' }}>
                                ${t.precio} <span style={{ fontSize: '1rem', color: layout === 'immersive' ? '#64748b' : '#94a3b8', fontWeight: 500 }}>MXN</span>
                            </div>
                            
                            {isRegistrationOpen ? (
                                <Link href={`/${locale}/eventos/${slug}/registro?ticket=${t.id}`} style={{ width: '100%', background: '#001F3F', color: 'white', padding: '1rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none' }}>
                                    Seleccionar
                                </Link>
                            ) : (
                                <button disabled style={{ width: '100%', background: layout === 'immersive' ? 'rgba(255,255,255,0.1)' : '#e2e8f0', color: layout === 'immersive' ? '#94a3b8' : '#94a3b8', padding: '1rem', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: 'not-allowed' }}>
                                    No Disponible
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        )}
        
        {/* Agenda Section */}
        {evento.agenda_json && (evento.agenda_json as any[]).length > 0 && (
            <section>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, color: layout === 'immersive' ? 'white' : '#0f172a', marginBottom: '2rem', textAlign: layout === 'classic' ? 'left' : 'center' }}>Agenda</h2>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {(evento.agenda_json as any[]).map((item, idx) => (
                        <div key={idx} style={{ 
                            background: layout === 'immersive' ? 'rgba(255,255,255,0.05)' : 'white', 
                            padding: '1.5rem 2rem', 
                            borderRadius: layout === 'modern' ? '16px' : '8px',
                            boxShadow: layout === 'modern' ? '0 10px 25px -5px rgba(0,0,0,0.05)' : 'none',
                            border: layout === 'minimal' ? '1px solid #e2e8f0' : 'none',
                            display: 'flex', gap: '2rem', alignItems: 'center'
                        }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: layout === 'immersive' ? '#38bdf8' : '#001F3F', minWidth: '80px' }}>{item.hora}</div>
                            <div>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: layout === 'immersive' ? 'white' : '#0f172a' }}>{item.titulo}</h4>
                                {item.descripcion && <p style={{ fontSize: '0.9rem', color: layout === 'immersive' ? '#94a3b8' : '#64748b', marginTop: '0.2rem' }}>{item.descripcion}</p>}
                                {item.ponente && <div style={{ fontSize: '0.85rem', fontWeight: 600, color: layout === 'immersive' ? '#7dd3fc' : '#001F3F', marginTop: '0.5rem' }}>🎙️ {item.ponente}</div>}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* Ponentes Section */}
        {ponentes && ponentes.length > 0 && (
            <section>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, color: layout === 'immersive' ? 'white' : '#0f172a', marginBottom: '2rem', textAlign: layout === 'classic' ? 'left' : 'center' }}>Ponentes Destacados</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
                    {ponentes.map((p: any) => (
                        <div key={p.id} style={{ 
                            background: layout === 'immersive' ? 'rgba(255,255,255,0.05)' : 'white', 
                            borderRadius: layout === 'modern' ? '16px' : '8px',
                            overflow: 'hidden',
                            boxShadow: layout === 'modern' ? '0 10px 25px -5px rgba(0,0,0,0.05)' : 'none',
                            border: layout === 'minimal' ? '1px solid #e2e8f0' : 'none',
                            textAlign: layout === 'minimal' ? 'left' : 'center'
                        }}>
                            <div style={{ height: '250px', position: 'relative', background: '#e2e8f0' }}>
                                {p.imagen_url && (
                                    <Image 
                                        src={p.imagen_url} 
                                        alt={p.nombre} 
                                        fill 
                                        style={{ objectFit: 'cover' }} 
                                    />
                                )}
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: layout === 'immersive' ? 'white' : '#0f172a', marginBottom: '0.2rem' }}>{p.nombre}</h3>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: layout === 'immersive' ? '#38bdf8' : '#001F3F', marginBottom: '1rem' }}>{p.cargo}</div>
                                <p style={{ fontSize: '0.85rem', color: layout === 'immersive' ? '#94a3b8' : '#64748b', lineHeight: 1.5 }}>{p.bio}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* Galeria Section */}
        {galeria && galeria.length > 0 && (
            <section>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, color: layout === 'immersive' ? 'white' : '#0f172a', marginBottom: '2rem', textAlign: layout === 'classic' ? 'left' : 'center' }}>Galería</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {galeria.map((g: any) => (
                        <div key={g.id} style={{ 
                            borderRadius: '12px', 
                            overflow: 'hidden', 
                            position: 'relative',
                            aspectRatio: '16/9'
                        }}>
                            {g.media_tipo === 'video' ? (
                                <video src={g.media_url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <Image 
                                    src={g.media_url} 
                                    alt={g.titulo || 'Galeria'} 
                                    fill
                                    style={{ objectFit: 'cover' }} 
                                />
                            )}
                            {g.titulo && (
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: 'white', fontWeight: 600 }}>
                                    {g.titulo}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        )}
      </div>
      
      {/* Live Q&A Floating Widget */}
      {isPastEvent && <LiveQA eventoId={id} />}
    </div>
  );
}
