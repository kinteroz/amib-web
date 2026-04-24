'use server';

import { createClient } from '@/lib/supabase/server';

import { redirect } from 'next/navigation';

export async function registerCertificado(formData: {
  email: string;
  password: string;
  nombre: string;
  institucion: string;
  telefono: string;
  matricula: string;
}) {
  const supabase = await createClient();

  // Registro del usuario con metadatos de rol forzados a 'certificado'
  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        role: 'certificado',
        nombre: formData.nombre,
        institucion: formData.institucion,
        telefono: formData.telefono,
        matricula: formData.matricula,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, user: data.user };
}

export async function logoutUser() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/es/login');
}
