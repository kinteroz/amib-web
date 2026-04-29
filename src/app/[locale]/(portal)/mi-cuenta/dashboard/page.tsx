'use client';

import React from 'react';
import { usePortalUser } from '@/hooks/usePortalUser';
import { useParams, useRouter } from 'next/navigation';
import { DashboardAsociado } from './DashboardAsociado';
import { DashboardCertificado } from './DashboardCertificado';
import { DashboardResponsable } from './DashboardResponsable';
import { DashboardEncargadoCatedra } from './DashboardEncargadoCatedra';

export default function DashboardController() {
  const user = usePortalUser();
  const { locale } = useParams();
  const router = useRouter();

  if (!user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: 'rgba(255,255,255,0.5)' }}>
        Cargando portal...
      </div>
    );
  }

  const role = user.role?.toLowerCase();

  if (role === 'responsable_comite') {
    return <DashboardResponsable user={user} locale={locale as string} />;
  }

  if (role === 'encargado_catedra') {
    return <DashboardEncargadoCatedra user={user} locale={locale as string} />;
  }

  if (role === 'certificado') {
    return <DashboardCertificado user={user} locale={locale as string} />;
  }

  return <DashboardAsociado user={user} />;
}
