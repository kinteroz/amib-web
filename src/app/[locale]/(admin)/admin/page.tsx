import React from 'react';

export default function AdminDashboard() {
  return (
    <div>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 700 }}>Panel de Control AMIB</h1>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Bienvenido al centro de gestión institucional.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* News Card */}
        <div style={{ 
          background: 'white', 
          padding: '2rem', 
          borderRadius: '16px', 
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0f172a' }}>Gestión de Actualidad</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '2rem' }}>
            Publica, edita y organiza las noticias institucionales y comunicados de prensa que aparecen en el portal.
          </p>
          <a href="/admin/noticias" style={{ 
            display: 'inline-block', 
            padding: '0.75rem 1.5rem', 
            background: '#001F3F', 
            color: 'white', 
            borderRadius: '8px', 
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            Administrar Noticias
          </a>
        </div>

        {/* Indicators Card */}
        <div style={{ 
          background: 'white', 
          padding: '2rem', 
          borderRadius: '16px', 
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0f172a' }}>Indicadores de Mercado</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '2rem' }}>
            Controla los valores y tendencias del IPC, BIVA, CETES y Tipo de Cambio que se muestran en el Hero.
          </p>
          <a href="/admin/indicadores" style={{ 
            display: 'inline-block', 
            padding: '0.75rem 1.5rem', 
            background: '#001F3F', 
            color: 'white', 
            borderRadius: '8px', 
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            Configurar Indicadores
          </a>
        </div>

        {/* Banners Card */}
        <div style={{ 
          background: 'white', 
          padding: '2rem', 
          borderRadius: '16px', 
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0f172a' }}>Hero Carousel</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '2rem' }}>
            Gestiona los slides de la página principal, define layouts (split, video, imagen) y activa efectos premium (Matrix, Pulse).
          </p>
          <a href="/admin/banners" style={{ 
            display: 'inline-block', 
            padding: '0.75rem 1.5rem', 
            background: '#001F3F', 
            color: 'white', 
            borderRadius: '8px', 
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            Administrar Hero
          </a>
        </div>

        {/* Events CMS Card */}
        <div style={{ 
          background: 'white', 
          padding: '2rem', 
          borderRadius: '16px', 
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
          border: '1px solid #e2e8f0',
          gridColumn: '1 / -1' // Span full width for emphasis
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
             <h2 style={{ fontSize: '1.25rem', color: '#0f172a' }}>Gestión de Eventos y Calendario</h2>
             <span style={{ fontSize: '0.75rem', fontWeight: 600, background: '#dcfce7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>NUEVO</span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '2rem', maxWidth: '800px' }}>
            Crea nuevos eventos, configura sus fechas, gestiona los accesos (Libre, Pago, Invitación), crea la agenda dinámica de sesiones y administra los boletos y acompañantes que se registrarán en la plataforma.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
              <a href="/admin/eventos" style={{ 
                display: 'inline-block', 
                padding: '0.75rem 1.5rem', 
                background: '#001F3F', 
                color: 'white', 
                borderRadius: '8px', 
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 600
              }}>
                Ir al Administrador de Eventos
              </a>
              <a href="/admin/eventos/nuevo" style={{ 
                display: 'inline-block', 
                padding: '0.75rem 1.5rem', 
                background: 'white', 
                color: '#001F3F', 
                borderRadius: '8px', 
                border: '1px solid #001F3F',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 600
              }}>
                Crear Nuevo Evento
              </a>
          </div>
        </div>
      </div>
    </div>
  );
}
