import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createEncuentroClient, detectarDispositivo, esBot, tokenValido, type EncuentroAsistente } from '@/lib/supabase/encuentro'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Encuentro AMIB 2026', robots: { index: false, follow: false } }

export default async function EncuentroCredencial({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const ua = (await headers()).get('user-agent') ?? ''
  const dispositivo = detectarDispositivo(ua)

  // En celular se entrega la vCard directo (iOS abre "Crear contacto"; Android la descarga).
  if (dispositivo !== 'escritorio' && !esBot(ua) && tokenValido(token)) redirect(`/api/encuentro/vcard/${token}`)

  const sb = createEncuentroClient()
  let asistente: EncuentroAsistente | null = null
  if (tokenValido(token)) {
    if (esBot(ua)) {
      const { data } = await sb.from('encuentro_asistentes').select('*').eq('token', token).maybeSingle()
      asistente = data
    } else {
      const { data } = await sb.rpc('encuentro_registrar_visita', { p_token: token, p_user_agent: ua, p_dispositivo: dispositivo, p_accion: 'vista' })
      asistente = data?.[0] ?? null
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '1.5rem', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ width: '100%', maxWidth: 440, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: '2.5rem 2rem', textAlign: 'center' }}>
        <img src="/images/logo-amib-blanco.png" alt="AMIB" style={{ height: 56, marginBottom: '1.5rem' }} />
        <div style={{ color: '#EAAB00', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>Encuentro AMIB 2026</div>
        {asistente ? (
          <>
            <h1 style={{ fontSize: '1.7rem', margin: '1rem 0 0.5rem' }}>
              {[asistente.nombre, asistente.apellido_p, asistente.apellido_m].filter(Boolean).join(' ')}
            </h1>
            {asistente.puesto && <p style={{ margin: '0.25rem 0', opacity: 0.85 }}>{asistente.puesto}</p>}
            {asistente.institucion && <p style={{ margin: '0.25rem 0', fontWeight: 600, color: '#EAAB00' }}>{asistente.institucion}</p>}
            <a href={`/api/encuentro/vcard/${asistente.token}`} style={{ display: 'inline-block', marginTop: '1.5rem', padding: '0.7rem 1.4rem', background: '#EAAB00', color: '#002048', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>Descargar contacto (vCard)</a>
            <p style={{ marginTop: '1rem', fontSize: '0.85rem', opacity: 0.6 }}>Registro verificado. ¡Bienvenido(a)!</p>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: '1.4rem', margin: '1rem 0 0.5rem' }}>Código no válido</h1>
            <p style={{ opacity: 0.7 }}>No encontramos este registro. Acude al módulo de registro del evento.</p>
          </>
        )}
      </section>
    </main>
  )
}
