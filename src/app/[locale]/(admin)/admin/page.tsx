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
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0f172a' }}>Banners e Imagen</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '2rem' }}>
            Actualiza los títulos y mensajes de la sección principal del portal (Hero) según las prioridades del día.
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
            Editar Banners
          </a>
        </div>
      </div>
    </div>
  );
}
