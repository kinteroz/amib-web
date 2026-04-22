import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database.types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// ── Tipos del Portal de Asociados ──────────────────────────────────────────

export type ComiteSesionEstado = 'programada' | 'realizada' | 'cancelada' | 'pospuesta'
export type ComiteSesionRol    = 'presidente' | 'vocal' | 'invitado'

export interface ComiteSesion {
  id: string
  nombre: string
  tipo: string
  fecha: string
  hora_inicio: string
  hora_fin: string | null
  estado: ComiteSesionEstado
  ubicacion: string | null
  rol_asociado: ComiteSesionRol
  asociado_id: string | null
  link_documento: string | null
  notas: string | null
  es_publica: boolean
  created_at: string
  updated_at: string
}

// ── Funciones de consulta ──────────────────────────────────────────────────

/**
 * Devuelve todas las sesiones de comités visibles para el usuario actual.
 * Si el usuario es admin, devuelve todas. Si es asociado, solo las suyas + públicas.
 */
export async function getComitesSesiones(options?: {
  estado?: ComiteSesionEstado
  limit?: number
}): Promise<ComiteSesion[]> {
  const supabase = await createClient()

  let query = supabase
    .from('comites_sesiones')
    .select('*')
    .order('fecha', { ascending: false })

  if (options?.estado) {
    query = query.eq('estado', options.estado)
  }
  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('[getComitesSesiones]', error.message)
    return []
  }

  return (data ?? []) as ComiteSesion[]
}

/**
 * Devuelve las próximas N sesiones programadas.
 */
export async function getProximasSesiones(limit = 3): Promise<ComiteSesion[]> {
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('comites_sesiones')
    .select('*')
    .eq('estado', 'programada')
    .gte('fecha', today)
    .order('fecha', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('[getProximasSesiones]', error.message)
    return []
  }

  return (data ?? []) as ComiteSesion[]
}

/**
 * Devuelve una sesión por su ID.
 */
export async function getComiteSesionById(id: string): Promise<ComiteSesion | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('comites_sesiones')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('[getComiteSesionById]', error.message)
    return null
  }

  return data as ComiteSesion
}

/**
 * Retorna el usuario de la sesión activa, o null si no está autenticado.
 */
export async function getSessionUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
