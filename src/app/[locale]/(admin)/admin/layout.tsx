import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Admin Sidebar */}
      <aside style={{ 
        width: '280px', 
        background: '#001F3F', 
        color: 'white', 
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 50
      }}>
        <div style={{ marginBottom: '3rem', padding: '0 0.5rem' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.05em' }}>AMIB <span style={{ opacity: 0.5, fontWeight: 400 }}>Admin</span></div>
          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.5, marginTop: '0.5rem', letterSpacing: '0.1em' }}>Institutional CMS</div>
        </div>

        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link href={`/${locale}/admin`} style={{ 
                display: 'block', 
                padding: '0.8rem 1rem', 
                borderRadius: '8px', 
                color: 'white', 
                textDecoration: 'none',
                background: 'rgba(255,255,255,0.05)',
                fontSize: '0.9rem'
              }}>
                Dashboard
              </Link>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link href={`/${locale}/admin/noticias`} style={{ 
                display: 'block', 
                padding: '0.8rem 1rem', 
                borderRadius: '8px', 
                color: 'rgba(255,255,255,0.7)', 
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}>
                Actualidad
              </Link>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link href={`/${locale}/admin/indicadores`} style={{ 
                display: 'block', 
                padding: '0.8rem 1rem', 
                borderRadius: '8px', 
                color: 'rgba(255,255,255,0.7)', 
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}>
                Indicadores
              </Link>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link href={`/${locale}/admin/eventos`} style={{ 
                display: 'block', 
                padding: '0.8rem 1rem', 
                borderRadius: '8px', 
                color: 'rgba(255,255,255,0.7)', 
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}>
                Eventos
              </Link>
            </li>
          </ul>
        </nav>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
          <div style={{ marginBottom: '1.5rem', padding: '0 0.5rem' }}>
            <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '0.25rem' }}>Usuario Activo</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
          </div>
          
          <Link href={`/${locale}`} style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', textDecoration: 'none', marginBottom: '1rem' }}>
            ← Volver al Portal
          </Link>
          
          <form action="/auth/signout" method="post">
            <button type="submit" style={{ 
              width: '100%', 
              background: 'rgba(255,77,79,0.1)', 
              color: '#ff4d4f', 
              border: 'none', 
              padding: '0.75rem', 
              borderRadius: '8px', 
              fontSize: '0.85rem', 
              fontWeight: 600,
              cursor: 'pointer'
            }}>
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, marginLeft: '280px', padding: '3rem' }}>
        {children}
      </main>
    </div>
  );
}

