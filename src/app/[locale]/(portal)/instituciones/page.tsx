import React from 'react';
import { FullBleedHero } from '@/components/ui/branding/FullBleedHero';
import { MarketBar } from '@/components/ui/branding/MarketBar';

export default function InstitucionesPage() {
  return (
    <main>
      <FullBleedHero 
        title="Hub de Servicios y Capacitación"
        subtitle="Impulsamos el desarrollo técnico del sector financiero a través de certificación de vanguardia y programas educativos de alto impacto."
        accent="#D4AF37"
      >
        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button style={{ 
            background: '#D4AF37', 
            color: '#001F3F', 
            padding: '1rem 2rem', 
            borderRadius: '8px', 
            fontWeight: 700,
            border: 'none',
            fontSize: '1rem',
            cursor: 'pointer'
          }}>
            Certificación
          </button>
          <button style={{ 
            background: 'rgba(255,255,255,0.1)', 
            color: 'white', 
            padding: '1rem 2rem', 
            borderRadius: '8px', 
            fontWeight: 700,
            border: '1px solid rgba(255,255,255,0.2)',
            fontSize: '1rem',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)'
          }}>
            Centro Educativo
          </button>
        </div>
      </FullBleedHero>

      {/* AMIB Certificación Section */}
      <section style={{ padding: '6rem 5%', background: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '4rem', alignItems: 'center', marginBottom: '6rem' }}>
            <div style={{ flex: 1 }}>
              <span style={{ color: '#001F3F', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem' }}>Submarca Especializada</span>
              <h2 style={{ fontSize: '3rem', color: '#001F3F', marginTop: '1rem', marginBottom: '2rem', fontWeight: 800 }}>
                AMIB Certificación
              </h2>
              <p style={{ fontSize: '1.1rem', color: '#4a5568', lineHeight: 1.8, marginBottom: '2rem' }}>
                Garantizamos la competencia técnica y ética de los profesionales del mercado mediante un riguroso proceso de validación reconocido por las autoridades financieras.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {[
                  { title: 'Consulta de Guías', desc: 'Material de estudio oficial.' },
                  { title: 'Modalidades', desc: 'Examen inicial y actualización.' },
                  { title: 'Personal Certificado', desc: 'Padrón oficial vigente.' },
                  { title: 'Calendario', desc: 'Fechas y sedes nacionales.' }
                ].map((item, i) => (
                  <div key={i} style={{ padding: '1.5rem', borderLeft: '3px solid #D4AF37', background: '#f8fafc' }}>
                    <h4 style={{ fontWeight: 700, color: '#001F3F' }}>{item.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#718096' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 0.8, background: '#001F3F', height: '450px', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ fontSize: '6rem' }}>📜</div>
            </div>
          </div>
        </div>
      </section>

      {/* Centro Educativo Section */}
      <section style={{ padding: '6rem 5%', background: '#001a33', color: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
             <span style={{ color: '#D4AF37', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem' }}>Formación y Talento</span>
             <h2 style={{ fontSize: '3rem', marginTop: '1rem', fontWeight: 800 }}>Centro Educativo AMIB</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.02)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '24px', 
              padding: '3rem',
              backdropFilter: 'blur(20px)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>📊</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 700 }}>Simulacro Bursátil</h3>
              <p style={{ opacity: 0.7, lineHeight: 1.6, marginBottom: '2rem' }}>
                Plataforma interactiva de práctica financiera diseñada para prospectos de certificación y profesionales que buscan perfeccionar sus estrategias de mercado.
              </p>
              <button style={{ background: '#D4AF37', color: '#001F3F', padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                Acceder al Simulacro
              </button>
            </div>

            <div style={{ 
              background: 'rgba(255,255,255,0.02)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '24px', 
              padding: '3rem',
              backdropFilter: 'blur(20px)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🎓</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 700 }}>Cátedras AMIB</h3>
              <p style={{ opacity: 0.7, lineHeight: 1.6, marginBottom: '2rem' }}>
                Programas de especialización impartidos por expertos de la AMIB para alumnos de Instituciones Educativas que buscan vincularse con el sector bursátil.
              </p>
              <button style={{ border: '1px solid #D4AF37', color: '#D4AF37', background: 'transparent', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                Cátedras Disponibles
              </button>
            </div>
          </div>
        </div>
      </section>

      <MarketBar />
    </main>
  );
}
