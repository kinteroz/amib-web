'use client';

import React, { useEffect } from 'react';
import { usePortalUser } from '@/hooks/usePortalUser';
import { useParams, useRouter } from 'next/navigation';
import { DashboardAsociado } from './DashboardAsociado';
import { DashboardCertificado } from './DashboardCertificado';

export default function DashboardController() {
  const user = usePortalUser();
  const { locale } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (user?.role?.toLowerCase() === 'responsable_comite') {
      router.replace(`/${locale}/mi-cuenta/mis-comites`);
    }
  }, [user, locale, router]);

  if (!user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: 'rgba(255,255,255,0.5)' }}>
        Cargando portal...
      </div>
    );
  }

  if (user.role?.toLowerCase() === 'responsable_comite') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: 'rgba(255,255,255,0.5)' }}>
        Redirigiendo...
      </div>
    );
  }

  const isCertificado = user.role?.toLowerCase() === 'certificado';

  if (isCertificado) {
    return <DashboardCertificado user={user} locale={locale as string} />;
  }

  return <DashboardAsociado user={user} />;
}
