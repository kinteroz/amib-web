import React from 'react';
import { FullBleedHero } from '@/components/ui/branding/FullBleedHero';
import { MarketBar } from '@/components/ui/branding/MarketBar';

export default function AsociadosPage() {
  return (
    <main>
      <FullBleedHero 
        title="Unidos por la Integridad del Mercado"
        subtitle="Representamos y fortalecemos al gremio de Casas de Bolsa en México, impulsando estándares de excelencia y una sana competencia."
        accent="var(--color-secondary-container)"
      >
        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button style={{ 
            background: 'var(--color-secondary-container)', 
            color: 'var(--color-primary)', 
            padding: '1rem 2rem', 
            borderRadius: '8px', 
            fontWeight: 700,
            border: 'none',
            fontSize: '1rem',
            cursor: 'pointer'
          }}>
            Beneficios de Socio
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
            Autorregulación
          </button>
        </div>
      </FullBleedHero>

      <section style={{ padding: '6rem 5%', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', color: '#001F3F', marginBottom: '1.5rem', fontWeight: 800 }}>
              El Valor de Pertenecer al Gremio
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#4a5568', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>
              Como asociación gremial, la AMIB es el punto de encuentro y la voz unificada de las instituciones financieras que operan en los mercados de valores de México.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {[
              { 
                title: 'Representación Estratégica', 
                icon: '🤝', 
                desc: 'Interlocución proactiva ante la CNBV, BANXICO y la SHCP para el desarrollo de políticas públicas.' 
              },
              { 
                title: 'Liderazgo en Normatividad', 
                icon: '📜', 
                desc: 'Participación activa en la definición de estándares y mejores prácticas de autorregulación.' 
              },
              { 
                title: 'Relaciones Globales', 
                icon: '🌎', 
                desc: 'Conexión con organismos internacionales y gremios financieros de todo el mundo.' 
              }
            ].map((card, i) => (
              <div key={i} style={{ 
                background: 'white', 
                padding: '3rem 2rem', 
                borderRadius: '24px', 
                boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.05)',
                transition: 'transform 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{ fontSize: '2.5rem' }}>{card.icon}</div>
                <h3 style={{ fontSize: '1.25rem', color: '#001F3F', fontWeight: 700 }}>{card.title}</h3>
                <p style={{ color: '#718096', fontSize: '0.95rem', lineHeight: 1.6 }}>{card.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ 
            marginTop: '4rem', 
            padding: '4rem', 
            background: 'var(--color-primary-container)', 
            borderRadius: '32px', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '4rem'
          }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Sinergia Institucional</h3>
              <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
                Fomentamos un ambiente de sana competencia y cooperación técnica que beneficia a todos los participantes del mercado bursátil.
              </p>
            </div>
            <button style={{ 
              padding: '1rem 2rem', 
              background: 'white', 
              color: 'var(--color-primary)', 
              borderRadius: '12px', 
              fontWeight: 700, 
              border: 'none',
              cursor: 'pointer'
            }}>
              Consultar Directorio
            </button>
          </div>
        </div>
      </section>

      <MarketBar />
    </main>
  );
}
