'use server';

import { randomUUID } from 'crypto';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

const supabaseAdmin = createAdminClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface Invitado {
  nombre: string;
  email: string;
  cargo?: string;
}

export interface RegistroConfirmado {
  nombre_completo: string;
  email: string;
  qr_code: string;
}

export async function registerForEvent(input: {
  evento_id: string;
  nombre_completo: string;
  email: string;
  institucion?: string;
  cargo?: string;
  ticket_id?: string | null;
  invitados?: Invitado[];
}): Promise<{ success: boolean; error?: string; registros?: RegistroConfirmado[] }> {
  try {
    const nombre = (input.nombre_completo || '').trim();
    const email = (input.email || '').trim().toLowerCase();

    if (nombre.length < 3 || nombre.length > 150) {
      return { success: false, error: 'Escribe tu nombre completo.' };
    }
    if (!EMAIL_RE.test(email) || email.length > 254) {
      return { success: false, error: 'El correo electrónico no es válido.' };
    }

    // El evento debe existir y estar activo
    const { data } = await supabaseAdmin
      .from('eventos')
      .select('id, titulo, tipo_acceso, configuracion_registro')
      .eq('id', input.evento_id)
      .single();
    const evento = data as {
      id: string;
      titulo: string;
      tipo_acceso: string | null;
      configuracion_registro?: { permite_invitados?: boolean; max_invitados?: number } | null;
    } | null;

    if (!evento) {
      return { success: false, error: 'El evento no existe o ya no está disponible.' };
    }

    // El boleto (si viene) debe pertenecer al evento
    let ticketId: string | null = null;
    if (input.ticket_id && input.ticket_id !== 'default-ticket') {
      const { data: ticket } = await supabaseAdmin
        .from('evento_tickets')
        .select('id')
        .eq('id', input.ticket_id)
        .eq('evento_id', evento.id)
        .eq('activo', true)
        .maybeSingle();
      if (!ticket) {
        return { success: false, error: 'El boleto seleccionado ya no está disponible.' };
      }
      ticketId = (ticket as { id: string }).id;
    }

    // Invitados: solo si el evento lo permite y dentro del máximo
    const config = evento.configuracion_registro || {};
    const maxInvitados = config.permite_invitados ? config.max_invitados || 0 : 0;
    const invitados = (input.invitados || [])
      .map((g) => ({ nombre: (g.nombre || '').trim(), email: (g.email || '').trim().toLowerCase(), cargo: (g.cargo || '').trim() }))
      .filter((g) => g.nombre.length >= 3 && EMAIL_RE.test(g.email))
      .slice(0, maxInvitados);

    // Evitar doble registro del mismo correo al mismo evento
    const { data: existente } = await supabaseAdmin
      .from('evento_asistentes')
      .select('id')
      .eq('evento_id', evento.id)
      .ilike('email', email)
      .limit(1)
      .maybeSingle();
    if (existente) {
      return { success: false, error: 'Este correo ya está registrado en el evento. Revisa "Mis eventos" en tu cuenta.' };
    }

    // Si hay sesión iniciada, ligar el registro al usuario
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const filas = [
      {
        evento_id: evento.id,
        usuario_id: user?.id ?? null,
        nombre_completo: nombre,
        email,
        institucion: (input.institucion || '').trim().slice(0, 150) || null,
        cargo: (input.cargo || '').trim().slice(0, 120) || null,
        ticket_id: ticketId,
        qr_code: `AMIB-EVT-${randomUUID()}`,
        asistio: false,
      },
      ...invitados.map((g) => ({
        evento_id: evento.id,
        usuario_id: null,
        nombre_completo: g.nombre,
        email: g.email,
        institucion: (input.institucion || '').trim().slice(0, 150) || null,
        cargo: g.cargo.slice(0, 120) || null,
        ticket_id: ticketId,
        qr_code: `AMIB-EVT-${randomUUID()}`,
        asistio: false,
      })),
    ];

    const { data: insertados, error } = await supabaseAdmin
      .from('evento_asistentes')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(filas as any)
      .select('nombre_completo, email, qr_code');

    if (error) {
      console.error('[registerForEvent] Error al insertar:', error.message);
      return { success: false, error: 'No pudimos completar tu registro. Intenta de nuevo.' };
    }

    return { success: true, registros: (insertados ?? []) as RegistroConfirmado[] };
  } catch (err) {
    console.error('[registerForEvent] Excepción:', err);
    return { success: false, error: 'Ocurrió un error inesperado. Intenta de nuevo.' };
  }
}
