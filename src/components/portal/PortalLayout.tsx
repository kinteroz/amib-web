'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import styles from './portal.module.css';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

export function PortalSidebar() {
  const pathname = usePathname();
  const { locale } = useParams();
  
  const navItems: NavItem[] = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      path: `/${locale}/asociados/portal/dashboard`,
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
      path: `/${locale}/asociados/portal/comites`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    { 
      id: 'normatividad', 
      label: 'Normatividad', 
      path: `/${locale}/asociados/portal/normatividad`,
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
      path: `/${locale}/asociados/portal/informes`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
        </svg>
      )
    },
  ];

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logoSquare}>A</div>
        <div className={styles.sidebarBrand}>
          <span className={styles.brandName}>Portal AMIB</span>
          <span className={styles.brandSub}>Jerarquía de Comité</span>
        </div>
      </div>

      <div style={{ padding: '0 1.5rem', marginBottom: '1rem' }}>
        <button style={{
          width: '100%',
          background: '#1e293b',
          color: 'white',
          border: 'none',
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
            className={`${styles.navItem} ${pathname === item.path ? styles.navItemActive : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <Link href={`/${locale}/soporte`} className={styles.navItem}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>Soporte</span>
        </Link>
        <button onClick={() => window.location.href = `/${locale}/login`} className={styles.navItem} style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}

export function PortalTopbar() {
  return (
    <div className={styles.topbar}>
      <div className={styles.searchWrapper}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input type="text" placeholder="Buscar sesión, documento..." className={styles.searchInput} />
      </div>

      <div className={styles.topbarActions}>
        <button className={styles.iconButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
        <button className={styles.iconButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
        <div className={styles.userProfile}>
          <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Profile" className={styles.avatar} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className={styles.userName}>Dr. Ricardo Salinas</span>
            <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Asociado Gremial</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.portalWrapper}>
      <PortalSidebar />
      <div className={styles.mainContainer}>
        <PortalTopbar />
        <main className={styles.contentView}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {children}
          </motion.div>
          
          <footer className={styles.portalFooter}>
            <div>© 2024 AMIB-Institución Financiera. Todos los derechos reservados.</div>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <span>Privacidad</span>
              <span>Términos de Uso</span>
              <span>Contacto Regulatorio</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
