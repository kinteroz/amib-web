'use client';

import { createClient } from '@/lib/supabase/client';

export async function login(email: string, password?: string) {
  const supabase = createClient();

  if (!password) {
    throw new Error('La contraseña es obligatoria para el acceso tradicional.');
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role as string | undefined;
  return { role };
}
