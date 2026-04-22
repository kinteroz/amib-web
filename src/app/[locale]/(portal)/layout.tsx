'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { usePathname } from 'next/navigation';

export default function PortalGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Si estamos dentro del portal privado, omitir el Header del sitio público.
  // El PortalLayout (sidebar + topbar) gestiona su propia navegación.
  const isPrivatePortal = pathname.includes('/asociados/portal');

  if (isPrivatePortal) {
    return <>{children}</>;
  }

  return (
    <div style={{ background: 'var(--color-primary-container)', minHeight: '100vh' }}>
      <Header />
      <main>
        {children}
      </main>
    </div>
  );
}
