'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createBrowserClient } from '@supabase/ssr';
import { logoutUser } from '@/app/actions/auth';
import { usePortalUser } from '@/hooks/usePortalUser';
import styles from './portal.module.css';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

export function PortalSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { locale } = useParams();
  const user = usePortalUser();
  
  const basePortalPath = `/${locale}/mi-cuenta`;
  
  const navItemsAsociado: NavItem[] = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      path: `${basePortalPath}/dashboard`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        </svg>
      )
    },
    { 
      id: 'comites', 
      label: 'Comités', 
      path: `${basePortalPath}/comites`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      badge: 1
    },
    { 
      id: 'normatividad', 
      label: 'Normatividad', 
      path: `${basePortalPath}/normatividad`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
        </svg>
      )
    },
    { 
      id: 'informes', 
      label: 'Informes', 
      path: `${basePortalPath}/informes`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
        </svg>
      )
    },
  ];

  const navItemsCertificado: NavItem[] = [
    { 
      id: 'dashboard', 
      label: 'Mi Dashboard', 
      path: `${basePortalPath}/dashboard`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        </svg>
      )
    },
    { 
      id: 'figura', 
      label: 'Mi Figura', 
      path: `${basePortalPath}/figura`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
      )
    },
    { 
      id: 'examenes', 
      label: 'Exámenes', 
      path: `${basePortalPath}/examenes`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
        </svg>
      )
    },
    { 
      id: 'eventos', 
      label: 'Mis Eventos', 
      path: `${basePortalPath}/mis-eventos`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    },
    { 
      id: 'credencial', 
      label: 'Credencial Digital', 
      path: `${basePortalPath}/credencial`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="5" width="20" height="14" rx="2" ry="2" /><line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      )
    },
  ];

  const navItemsContralor: NavItem[] = [
    {
      id: 'oficios-cnbv',
      label: 'Oficios CNBV',
      path: `${basePortalPath}/oficios`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M9 13h6M9 17h4" />
        </svg>
      )
    },
  ];

  const navItemsResponsableComite: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: `${basePortalPath}/dashboard`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        </svg>
      )
    },
    {
      id: 'mis-comites',
      label: 'Mis Comités',
      path: `${basePortalPath}/mis-comites`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      id: 'sesiones',
      label: 'Sesiones',
      path: `${basePortalPath}/mis-comites/sesiones`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    },
    {
      id: 'minutas',
      label: 'Minutas',
      path: `${basePortalPath}/mis-comites/minutas`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      )
    },
    {
      id: 'acuerdos',
      label: 'Acuerdos',
      path: `${basePortalPath}/mis-comites/acuerdos`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      )
    },
    {
      id: 'informes',
      label: 'Informes',
      path: `${basePortalPath}/informes`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
        </svg>
      )
    },
    {
      id: 'oficios-cnbv',
      label: 'Oficios CNBV',
      path: `${basePortalPath}/oficios`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M9 13h6M9 17h4" />
        </svg>
      )
    },
  ];

  // Logic to switch between navs based on role (default to asociado if undefined for backward compatibility)
  const role = user?.role?.toLowerCase();
  const isCertificado = role === 'certificado';
  const isResponsableComite = role === 'responsable_comite';
  const isContralor = role === 'contralor';
  const navItems = isContralor ? navItemsContralor : isResponsableComite ? navItemsResponsableComite : isCertificado ? navItemsCertificado : navItemsAsociado;

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={styles.overlay} 
          />
        )}
      </AnimatePresence>

      <div className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoSquare}>A</div>
          <div className={styles.sidebarBrand}>
            <span className={styles.brandName}>Portal AMIB</span>
            <span className={styles.brandSub}>Jerarquía de Comité</span>
          </div>
          <button className={styles.closeSidebar} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div style={{ padding: '0 1.5rem', marginBottom: '1rem' }}>
          <button style={{
            width: '100%',
            background: 'rgba(234,171,0,0.1)',
            color: 'var(--color-secondary-container, #EAAB00)',
            border: '1px solid rgba(234,171,0,0.2)',
            padding: '0.75rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            cursor: 'pointer'
          }}>
            <span>+ Nuevo Reporte</span>
          </button>
        </div>

        <nav className={styles.navSection}>
          {navItems.map(item => (
            <Link 
              key={item.id} 
              href={item.path} 
              onClick={onClose}
              className={`${styles.navItem} ${pathname === item.path ? styles.navItemActive : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span style={{ 
                  background: '#b91c1c', color: 'white', fontSize: '0.65rem', 
                  fontWeight: 800, padding: '0.15rem 0.4rem', borderRadius: '100px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '20px'
                }}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href={`/${locale}/soporte`} onClick={onClose} className={styles.navItem}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>Soporte</span>
          </Link>
          <form action={logoutUser} style={{ width: '100%' }}>
            <button type="submit" className={styles.navItem} style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Cerrar Sesión</span>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export function PortalTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const user = usePortalUser();

  return (
    <div className={styles.topbar}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className={styles.menuToggle} onClick={onMenuClick}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
        </button>
        <div className={styles.searchWrapper}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="text" placeholder="Buscar sesión, documento..." className={styles.searchInput} />
        </div>
      </div>

      <div className={styles.topbarActions}>
        <button className={styles.iconButton} style={{ position: 'relative' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span style={{ position: 'absolute', top: '2px', right: '4px', width: '8px', height: '8px', background: '#b91c1c', borderRadius: '50%', border: '2px solid var(--color-surface-container-high, #0f172a)' }} />
        </button>
        <button className={`${styles.iconButton} ${styles.hideOnMobile}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        {/* ── Usuario Autenticado ── */}
        <div className={styles.userProfile}>
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className={styles.avatar} />
          ) : (
            <div className={styles.avatar} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(234,171,0,0.15)',
              border: '2px solid rgba(234,171,0,0.35)',
              borderRadius: '8px',
              color: 'var(--color-secondary-container, #EAAB00)',
              fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.02em',
            }}>
              {user?.initials ?? '—'}
            </div>
          )}
          <div className={styles.hideOnMobile} style={{ display: 'flex', flexDirection: 'column' }}>
            <span className={styles.userName}>
              {user?.name ?? 'Cargando...'}
            </span>
            <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {user?.role ?? ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showToast, setShowToast] = useState(true); // Toast de notificación al entrar

  // Auto-ocultar toast después de 5s
  React.useEffect(() => {
    const timer = setTimeout(() => setShowToast(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.portalWrapper}>
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={{
              position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
              background: '#0f172a', color: 'white', padding: '1rem 1.25rem', borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', gap: '1rem', maxWidth: '350px'
            }}
          >
            <div style={{ background: 'rgba(234,171,0,0.2)', color: 'var(--color-secondary-container, #EAAB00)', padding: '0.5rem', borderRadius: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Sesión Próxima</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.1rem' }}>Comité de Análisis de Mercados el 24 de Oct.</div>
            </div>
            <button onClick={() => setShowToast(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '0.25rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <PortalSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={styles.mainContainer}>
        <PortalTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className={styles.contentView}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {children}
          </motion.div>
          
          <footer className={styles.portalFooter}>
            <div>© 2026 AMIB</div>
          </footer>
        </main>
      </div>
    </div>
  );
}
