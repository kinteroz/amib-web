import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createEncuentroClient, type EncuentroAsistente } from '@/lib/supabase/encuentro'

export const dynamic = 'force-dynamic'

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleString('es-MX', { timeZone: 'America/Mexico_City', dateStyle: 'short', timeStyle: 'short' }) : '—'

export default async function AdminEncuentro({ searchParams }: { searchParams: Promise<{ q?: string; f?: string }> }) {
  const { q = '', f = '' } = await searchParams
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (user?.user_metadata?.role !== 'admin') notFound()
  const { data } = await createEncuentroClient().from('encuentro_asistentes').select('*').order('apellido_p')
  const todos = (data ?? []) as EncuentroAsistente[]

  const { data: vis } = await createEncuentroClient()
    .from('encuentro_visitas')
    .select('visitado_at, dispositivo, accion, encuentro_asistentes(nombre, apellido_p, apellido_m, institucion)')
    .order('visitado_at', { ascending: false })
    .limit(30)
  const recientes = (vis ?? []) as unknown as {
    visitado_at: string; dispositivo: string | null; accion: string
    encuentro_asistentes: { nombre: string; apellido_p: string; apellido_m: string | null; institucion: string | null }
  }[]

  const visitados =todos.filter((a) => a.visitas > 0).length
  const term = q.trim().toLowerCase()
  const lista = todos.filter((a) => {
    if (f === 'si' && !a.visitas) return false
    if (f === 'no' && a.visitas) return false
    return !term || `${a.nombre} ${a.apellido_p} ${a.apellido_m ?? ''} ${a.institucion ?? ''} ${a.email}`.toLowerCase().includes(term)
  })

  const th: React.CSSProperties = { textAlign: 'left', padding: '0.6rem 0.8rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }
  const td: React.CSSProperties = { padding: '0.6rem 0.8rem', borderTop: '1px solid #e2e8f0', fontSize: '0.9rem' }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ color: '#002048', marginBottom: '0.25rem' }}>Encuentro AMIB 2026 · Uso de QR</h1>
      <p style={{ color: '#475569', marginTop: 0 }}>
        <strong>{visitados}</strong> de <strong>{todos.length}</strong> han abierto su QR · {todos.length - visitados} pendientes
      </p>

      <form style={{ display: 'flex', gap: '0.5rem', margin: '1.25rem 0' }}>
        <input name="q" defaultValue={q} placeholder="Buscar nombre, institución o correo" style={{ flex: 1, padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: 8 }} />
        <select name="f" defaultValue={f} style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: 8 }}>
          <option value="">Todos</option>
          <option value="si">Ya visitaron</option>
          <option value="no">Sin visitar</option>
        </select>
        <button style={{ padding: '0.6rem 1.2rem', background: '#002048', color: '#fff', border: 0, borderRadius: 8, cursor: 'pointer' }}>Filtrar</button>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8 }}>
        <thead>
          <tr><th style={th}>Nombre</th><th style={th}>Institución</th><th style={th}>Visitas</th><th style={th}>Primera</th><th style={th}>Última</th></tr>
        </thead>
        <tbody>
          {lista.map((a) => (
            <tr key={a.id}>
              <td style={td}>{a.nombre} {a.apellido_p} {a.apellido_m}</td>
              <td style={td}>{a.institucion ?? '—'}</td>
              <td style={{ ...td, fontWeight: 700, color: a.visitas ? '#10B981' : '#94a3b8' }}>{a.visitas || 'No'}</td>
              <td style={td}>{fmt(a.primera_visita)}</td>
              <td style={td}>{fmt(a.ultima_visita)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Mostrando {lista.length} registros.</p>

      <h2 style={{ color: '#002048', marginTop: '2.5rem' }}>Últimas 30 aperturas</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8 }}>
        <thead><tr><th style={th}>Cuándo</th><th style={th}>Persona (dueño del QR)</th><th style={th}>Institución</th><th style={th}>Dispositivo</th><th style={th}>Acción</th></tr></thead>
        <tbody>
          {recientes.map((v, i) => (
            <tr key={i}>
              <td style={td}>{fmt(v.visitado_at)}</td>
              <td style={td}>{v.encuentro_asistentes.nombre} {v.encuentro_asistentes.apellido_p} {v.encuentro_asistentes.apellido_m}</td>
              <td style={td}>{v.encuentro_asistentes.institucion ?? '—'}</td>
              <td style={td}>{v.dispositivo === 'ios' ? 'iPhone / iOS' : v.dispositivo === 'android' ? 'Android' : 'Computadora'}</td>
              <td style={td}>{v.accion === 'vcard' ? 'Descargó vCard' : 'Vio la página'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
