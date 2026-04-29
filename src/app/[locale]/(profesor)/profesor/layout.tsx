import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { logoutUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';

export default async function ProfessorLayout({
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

  const role = user.user_metadata?.role;
  if (role !== 'profesor' && role !== 'admin') {
    redirect(`/${locale}/mi-cuenta/dashboard`);
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#020817', color: 'white' }}>
      {/* Professor Sidebar */}
      <aside style={{ 
        width: '280px', 
        background: '#0a1120', 
        borderRight: '1px solid rgba(255,255,255,0.06)',
        padding: '2rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 50
      }}>
        <div style={{ marginBottom: '2.5rem', padding: '0 0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', background: '#EAAB00', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#001F3F' }}>A</div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '0.02em', lineHeight: 1.1 }}>Portal AMIB</div>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.5, letterSpacing: '0.05em' }}>Cátedra Institucional</div>
            </div>
          </div>
        </div>

        <button style={{ 
          width: '100%', 
          padding: '0.8rem', 
          borderRadius: '10px', 
          background: 'rgba(255,255,255,0.03)', 
          border: '1px solid rgba(255,255,255,0.1)', 
          color: '#EAAB00', 
          fontWeight: 700, 
          fontSize: '0.8rem', 
          marginBottom: '2rem',
          cursor: 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          + Nueva Actividad
        </button>

        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
             <SidebarLink href={`/${locale}/profesor`} icon="📊" label="Mi Dashboard" active />
             <SidebarLink href={`/${locale}/profesor/catedras`} icon="📚" label="Mis Cátedras" />
             <SidebarLink href={`/${locale}/profesor/calendario`} icon="📅" label="Mis Sesiones" />
             <SidebarLink href={`/${locale}/profesor/alumnos`} icon="👥" label="Estudiantes" />
          </ul>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', padding: '0 0.5rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#EAAB00', color: '#001F3F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
              {user.user_metadata?.nombre?.[0] || 'P'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.user_metadata?.nombre || 'Docente'}</div>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.4, fontWeight: 700 }}>Profesor Titular</div>
            </div>
          </div>
          
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
             <SidebarLink href={`/${locale}/soporte`} icon="❓" label="Soporte" />
          </ul>

          <form action={logoutUser}>
            <button style={{ 
              width: '100%', 
              background: 'transparent', 
              color: 'rgba(255,255,255,0.5)', 
              border: 'none', 
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <span>🚪</span> Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        marginLeft: '280px',
        padding: '2.5rem 4rem',
        maxWidth: '1600px',
        background: 'linear-gradient(135deg, #020817 0%, #0a1120 100%)'
      }}>
        {children}
      </main>
    </div>
  );
}

function SidebarLink({ href, icon, label, active = false }: any) {
  return (
    <li style={{ marginBottom: '0.5rem' }}>
      <Link href={href} style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.8rem 1rem', 
        borderRadius: '10px', 
        color: active ? '#EAAB00' : 'rgba(255,255,255,0.6)', 
        textDecoration: 'none',
        background: active ? 'rgba(234, 171, 0, 0.08)' : 'transparent',
        fontSize: '0.85rem',
        fontWeight: active ? 700 : 500,
        transition: 'all 0.2s'
      }}>
        <span style={{ fontSize: '1.1rem', opacity: active ? 1 : 0.5 }}>{icon}</span>
        {label}
      </Link>
    </li>
  );
}
