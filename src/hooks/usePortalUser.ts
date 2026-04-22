'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';

export interface PortalUser {
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  initials: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('');
}

function buildPortalUser(user: User): PortalUser {
  const meta = user.user_metadata ?? {};

  // Estrategias para obtener el nombre completo
  const name: string =
    meta.full_name ||
    meta.name ||
    `${meta.first_name ?? ''} ${meta.last_name ?? ''}`.trim() ||
    user.email?.split('@')[0] ||
    'Asociado';

  const role: string = meta.role ?? meta.cargo ?? 'Asociado Gremial';
  const avatarUrl: string | null = meta.avatar_url ?? meta.picture ?? null;

  return {
    name,
    email: user.email ?? '',
    role,
    avatarUrl,
    initials: getInitials(name),
  };
}

export function usePortalUser(): PortalUser | null {
  const [portalUser, setPortalUser] = useState<PortalUser | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Obtener sesión actual
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setPortalUser(buildPortalUser(data.user));
      }
    });

    // Escuchar cambios de sesión (logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setPortalUser(buildPortalUser(session.user));
      } else {
        setPortalUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return portalUser;
}
