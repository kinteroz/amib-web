'use client';

import { createClient } from '@/lib/supabase/client';

export async function login(email: string, password?: string) {
  const supabase = createClient();
  
  if (!password) {
    throw new Error('La contraseña es obligatoria para el acceso tradicional.');
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return true;
}

// Actualizado a sistema tradicional de Email/Password por solicitud del usuario.
// El redireccionamiento se maneja directamente en el componente de UI.
