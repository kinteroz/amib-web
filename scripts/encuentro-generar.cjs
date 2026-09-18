// Carga asistentes del Encuentro 2026 en Supabase y genera un PNG de QR por persona.
// Uso: node scripts/encuentro-generar.cjs <asistentes.json> [carpeta-salida]
// El JSON es un arreglo con: nombre, apellidoP, apellidoM, puesto, institucion, email, telefono, celular.
// Es idempotente: quien ya existe (por email) conserva su token.
require('dotenv').config({ path: '.env.local' })
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const QRCode = require('qrcode')
const { createClient } = require('@supabase/supabase-js')

const BASE_URL = (process.env.ENCUENTRO_BASE_URL || 'https://encuentro2026.amib.com.mx').replace(/\/$/, '')
const [jsonPath, outDir = 'encuentro-qr'] = process.argv.slice(2)
if (!jsonPath) { console.error('Falta la ruta del JSON'); process.exit(1) }

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})
const limpio = (v) => (v == null ? null : String(v).trim() || null)
const archivo = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, ' ').trim()

async function main() {
  const filas = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
  const registros = filas.map((f) => ({
    email: limpio(f.email)?.toLowerCase(),
    nombre: limpio(f.nombre),
    apellido_p: limpio(f.apellidoP),
    apellido_m: limpio(f.apellidoM),
    puesto: limpio(f.puesto),
    institucion: limpio(f.institucion),
    telefono: limpio(f.telefono),
    celular: limpio(f.celular),
  })).filter((r) => r.email && r.nombre && r.apellido_p)

  const { data: existentes, error: e1 } = await sb.from('encuentro_asistentes').select('email')
  if (e1) throw e1
  const ya = new Set(existentes.map((x) => x.email))
  const nuevos = registros.filter((r) => !ya.has(r.email)).map((r) => ({ ...r, token: crypto.randomBytes(8).toString('base64url') }))
  if (nuevos.length) {
    const { error } = await sb.from('encuentro_asistentes').insert(nuevos)
    if (error) throw error
  }
  console.log(`Insertados: ${nuevos.length} · Ya existían: ${registros.length - nuevos.length}`)

  const { data: todos, error: e2 } = await sb.from('encuentro_asistentes').select('*').order('apellido_p')
  if (e2) throw e2
  fs.mkdirSync(outDir, { recursive: true })
  for (const a of todos) {
    const nombre = archivo(`${a.apellido_p} ${a.apellido_m ?? ''} ${a.nombre}`)
    const inst = archivo(a.institucion ?? '')
    const file = path.join(outDir, `${nombre}${inst ? ' - ' + inst : ''} [${a.token.slice(0, 4)}].png`)
    await QRCode.toFile(file, `${BASE_URL}/es/encuentro/${a.token}`, {
      width: 800, margin: 2, errorCorrectionLevel: 'M', color: { dark: '#002048', light: '#FFFFFF' },
    })
  }
  console.log(`QR generados: ${todos.length} en ${path.resolve(outDir)}`)
}
main().catch((e) => { console.error(e); process.exit(1) })
