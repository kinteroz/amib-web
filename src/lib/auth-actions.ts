'use client';

import { createClient } from '@/lib/supabase/client';

export async function login(email: string) {
  const supabase = createClient();
  
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return true;
}

// Nota: Para Email/Password usaríamos signInWithPassword. 
// Para simplificar y aumentar la seguridad, empezamos con Magic Link.
// Si el usuario prefiere contraseña, lo ajustaremos.
