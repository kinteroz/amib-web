import { createClient } from '@supabase/supabase-js'

// Cliente service_role sin tipos: las tablas del Encuentro no están en database.types.ts.
export function createEncuentroClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export type EncuentroAsistente = {
  id: string
  token: string
  email: string
  nombre: string
  apellido_p: string
  apellido_m: string | null
  puesto: string | null
  institucion: string | null
  telefono: string | null
  celular: string | null
  visitas: number
  primera_visita: string | null
  ultima_visita: string | null
}

export type Dispositivo = 'ios' | 'android' | 'escritorio'

// Los previsualizadores de enlaces (WhatsApp, correo, etc.) no cuentan como visita.
export const esBot = (ua: string) => /bot|crawl|spider|preview|facebookexternalhit|whatsapp|slack|telegram|curl/i.test(ua)

export function detectarDispositivo(ua: string): Dispositivo {
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  return 'escritorio'
}

export const tokenValido = (t: string) => /^[\w-]{8,32}$/.test(t)

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,')

export function construirVCard(a: EncuentroAsistente): string {
  const lineas = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${esc([a.apellido_p, a.apellido_m].filter(Boolean).join(' '))};${esc(a.nombre)};;;`,
    `FN:${esc([a.nombre, a.apellido_p, a.apellido_m].filter(Boolean).join(' '))}`,
    a.institucion && `ORG:${esc(a.institucion)}`,
    a.puesto && `TITLE:${esc(a.puesto)}`,
    `EMAIL;TYPE=WORK:${esc(a.email)}`,
    a.celular && `TEL;TYPE=CELL:${esc(a.celular)}`,
    a.telefono && a.telefono !== a.celular && `TEL;TYPE=WORK:${esc(a.telefono)}`,
    'NOTE:Encuentro AMIB 2026',
    'END:VCARD',
  ]
  return lineas.filter(Boolean).join('\r\n') + '\r\n'
}
