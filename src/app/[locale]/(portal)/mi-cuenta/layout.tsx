'use client';

import PortalLayout from '@/components/portal/PortalLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PortalLayout>{children}</PortalLayout>;
}
