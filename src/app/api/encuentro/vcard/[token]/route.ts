import { NextResponse } from 'next/server'
import { createEncuentroClient, construirVCard, detectarDispositivo, esBot, tokenValido, type EncuentroAsistente } from '@/lib/supabase/encuentro'

export const dynamic = 'force-dynamic'

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  if (!tokenValido(token)) return new NextResponse('No encontrado', { status: 404 })

  const ua = req.headers.get('user-agent') ?? ''
  const sb = createEncuentroClient()
  let a: EncuentroAsistente | null = null
  if (esBot(ua)) {
    const { data } = await sb.from('encuentro_asistentes').select('*').eq('token', token).maybeSingle()
    a = data
  } else {
    const { data } = await sb.rpc('encuentro_registrar_visita', {
      p_token: token, p_user_agent: ua, p_dispositivo: detectarDispositivo(ua), p_accion: 'vcard',
    })
    a = data?.[0] ?? null
  }
  if (!a) return new NextResponse('No encontrado', { status: 404 })

  const nombre = `${a.nombre} ${a.apellido_p}`.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w\s-]/g, '').trim() || 'contacto'
  return new NextResponse(construirVCard(a), {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `inline; filename="${nombre}.vcf"`,
      'Cache-Control': 'no-store',
    },
  })
}
