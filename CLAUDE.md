# AMIB — Rediseño del Sitio Web Institucional

## Contexto del proyecto

Rediseño completo del sitio institucional de la **AMIB (Asociación Mexicana de Instituciones Bursátiles)** — actualmente en [amib.com.mx](https://amib.com.mx/). El objetivo es rediseñar, reorganizar y optimizar el sitio para mejorar la experiencia del usuario, facilitar el acceso a la información por tipo de audiencia y modernizar la administración de contenidos, manteniendo la identidad institucional y los estándares de seguridad requeridos.

Este es un proyecto **greenfield** (carpeta vacía al momento de inicializar). El stack aún no está instalado — está pendiente decisión técnica conjunta antes de generar código.

## Públicos objetivo

El sitio debe segmentar la experiencia por perfil. Cualquier decisión de IA (information architecture) o UI debe partir de "¿qué perfil entra por aquí?":

| Audiencia | Necesidad principal |
|---|---|
| **Asociados y Afiliados** | Casas de Bolsa y Operadoras de Fondos de Inversión — acceso a circulares, normativa, herramientas internas |
| **Certificación** | Personas físicas y morales — procesos, calendarios, registro, FAQ |
| **Educación** | Estudiantes, universidades, centros educativos — cursos, boletín, talento bursátil |
| **Empresas** | Emisoras potenciales — información de financiamiento en el mercado de valores |
| **Inversionistas** | Individuales e institucionales, nacionales y extranjeros — estadísticas, análisis, Indexity |
| **Prensa** | Medios especializados — comunicados, informes, kit de prensa |

## Pilares de diseño (Creative North Star)

Toda decisión visual o de UX debe ser defendible contra estos tres pilares:

1. **Confianza e Integridad** — la AMIB es ente autorregulador y certificador. Nada en el sitio debe verse "startup-y" o frívolo.
2. **Accesibilidad y Claridad** — navegación intuitiva para perfiles muy distintos (desde un estudiante hasta un director de casa de bolsa).
3. **Modernidad Institucional** — estética contemporánea que proyecte eficiencia y competitividad, sin sacrificar la seriedad institucional.

## Estructura de pantallas propuesta

1. **Home** — segmentación por perfil (accesos rápidos), carrusel de noticias/comunicados, secciones directas a Certificación y Fondos, buscador avanzado.
2. **Portal de Certificación** — tipos de certificación, calendario de exámenes, registro, FAQ específicas.
3. **Análisis y Estrategia (Inversionistas)** — dashboard estadístico, documentos de consulta, Indexity, investigación de mercado.
4. **Educación Bursátil** — catálogo de cursos, boletín bursátil, recursos de Talento Bursátil.
5. **Sala de Prensa** — repositorio de comunicados, informes anuales, noticias institucionales.
6. **Nosotros (Institucional)** — misión, visión, comités, normas de autorregulación.

## Stack técnico

### CMS / Backend
- **Supabase** (ya aprovisionado por el cliente) — actúa como CMS headless y backend para autenticación, storage y queries.
- Project ref: `bqwcfjxtmbgjynoscxjx` (se deriva del endpoint `https://bqwcfjxtmbgjynoscxjx.supabase.co`).
- El esquema de tablas **aún no está mapeado** — antes de modelar contenido, inspeccionar las tablas existentes.

### Frontend
- Aún no definido. Candidato fuerte: **Next.js (App Router) + TypeScript + Tailwind** por compatibilidad con Supabase, SEO institucional y buen DX para equipos mixtos.
- Confirmar con el cliente antes de scaffoldear.

## Secretos y variables de entorno

**NUNCA commitear secretos al repo.** Esto incluye especialmente:
- `SUPABASE_SERVICE_ROLE_KEY` — salta Row Level Security, acceso total. Solo uso server-side. Vive en `.env.local` (gitignored) y en variables de entorno del host de producción.
- `SUPABASE_ANON_KEY` — puede exponerse al cliente, pero aun así va en `.env.local` por disciplina.

Convención esperada al inicializar el proyecto:

```
# .env.local  (gitignored)
NEXT_PUBLIC_SUPABASE_URL=https://bqwcfjxtmbgjynoscxjx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...        # cliente
SUPABASE_SERVICE_ROLE_KEY=...            # server-only, jamás prefijar NEXT_PUBLIC_
```

El `service_role` no debe aparecer en ningún archivo versionado, comentario, log de agente, issue, ni PR. Si en algún momento se filtró en una conversación o historial, **rotarlo inmediatamente** desde Supabase Dashboard → Settings → API → Reset service_role.

## Colaboración con múltiples agentes / desarrolladores

Este repo va a ser trabajado por varios desarrolladores humanos y agentes en paralelo. Reglas para mantener coherencia:

- **Antes de scaffoldear o instalar dependencias**, confirmar con el usuario el stack elegido. No asumir Next.js/Vite/etc. sin confirmación.
- **Antes de crear tablas o modificar el esquema de Supabase**, revisar estado actual (otros agentes pueden haber hecho cambios).
- Preferir **migraciones versionadas** (`supabase/migrations/*.sql`) sobre cambios ad-hoc en el dashboard.
- No introducir frameworks adicionales (state management, CSS-in-JS alterno, ORMs) sin discutirlo — mantener la superficie técnica chica.
- Commits en español o inglés consistente dentro del repo (definir en el primer commit).
- Todo contenido institucional (copys, títulos de sección, labels) debe estar en **español de México**. Evitar anglicismos innecesarios.

## Pendientes antes de escribir código

1. Confirmar stack frontend con el cliente.
2. Inspeccionar esquema actual de Supabase para entender qué contenido ya está modelado.
3. Solicitar guía de marca (logos, paleta, tipografías oficiales de AMIB) — si no existe, definirla en conjunto antes de cualquier UI.
4. Definir estrategia de i18n (¿solo español? ¿inglés para inversionistas extranjeros?).
5. Definir hosting objetivo (Vercel, infra del cliente, etc.) — afecta decisiones de SSR/ISR.

---

# MÓDULO: Sistema de Seguimiento de Oficios CNBV

## 📋 Descripción

Sistema completo para gestionar los oficios regulatorios que la CNBV envía a la AMIB. Reemplaza el flujo manual (Excel) con una herramienta web con capacidades de IA.

**Flujo:** PDF oficio → Upload → Claude extrae datos → Usuario edita → Dashboard + Detalle → Historial

**Etapas completadas:** 5/5 (Foundation, PDF+IA, Detalle, Dashboard, Historial)

**Estado:** Listo para producción. Requiere: `ANTHROPIC_API_KEY` + migraciones SQL + bucket Supabase Storage.

---

## 🏗️ Arquitectura

### Rutas en el portal (`/mi-cuenta/oficios/`)

| Ruta | Función |
|---|---|
| `/mi-cuenta/oficios` | **Dashboard ejecutivo** — stats, alertas críticas (vencidos/urgentes), timeline 21 días, lista filtrable |
| `/mi-cuenta/oficios/nuevo` | **Registrar oficio** — drag & drop PDF → IA extrae → formulario editable → guardar |
| `/mi-cuenta/oficios/[id]` | **Detalle del oficio** — header con semáforo, lista de tareas (ciclo: pendiente→en_proceso→concluido), sidebar con datos, botón "Marcar cumplido" |
| `/mi-cuenta/oficios/historial` | **Historial** — búsqueda, filtro por año/estatus, tasa cumplimiento animada |

### Tablas Supabase

```sql
oficios (maestro de oficios)
├─ numero_oficio, titulo, fecha_recepcion
├─ plazo_dias_habiles, prorroga_dias, fecha_vencimiento
├─ estatus (pendiente|en_proceso|cumplido)
├─ resumen_ia, datos_extraidos_ia (JSON)
├─ pdf_url, pdf_nombre (referencia a Storage)
└─ created_by, created_at, updated_at

oficio_tareas (tareas por oficio)
├─ numero, descripcion, area_responsable
├─ responsable_id (FK → auth.users)
├─ fecha_planeada, fecha_completada
├─ estatus (pendiente|en_proceso|concluido)
└─ orden (para ordenar)

festivos (catálogo 2026 — precargado)
└─ fecha, descripcion, anio
```

### Migraciones SQL

| Archivo | Contenido |
|---|---|
| `supabase/migrations/20260430_oficios_cnbv.sql` | Schema: tablas + RLS + triggers + función calcular_vencimiento() |
| `supabase/migrations/20260430_seed_oficios_2026.sql` | Seed: 7 oficios históricos del Excel 2026 |

### API Route

```
POST /api/oficios/procesar
├─ Input: FormData con PDF file
├─ Proceso: pdf-parse → texto → Claude Sonnet 4.6 → JSON
└─ Output: { numero_oficio, titulo, fecha_recepcion, plazo_dias_habiles, criticidad, resumen, tareas_sugeridas[] }
```

---

## 🔧 Setup para retomar

### 1. Variables de entorno (`.env.local`)

```bash
# Ya existen:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# AGREGAR:
ANTHROPIC_API_KEY=sk-ant-...  # https://console.anthropic.com
```

### 2. Migraciones SQL

En **Supabase Dashboard → SQL Editor**, ejecuta ambos archivos en orden:
1. `supabase/migrations/20260430_oficios_cnbv.sql`
2. `supabase/migrations/20260430_seed_oficios_2026.sql`

### 3. Supabase Storage

- Dashboard → Storage → New bucket
- Nombre: `oficios-pdfs` (privado)
- Agregar RLS policies:

```sql
-- Insert: usuarios pueden subir a su carpeta
CREATE POLICY "oficios_pdfs_insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'oficios-pdfs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Select: usuarios pueden leer del bucket
CREATE POLICY "oficios_pdfs_select"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'oficios-pdfs');
```

### 4. Dev server

```bash
npm run dev
```

Accede a: `http://localhost:3000/es/mi-cuenta/oficios` (requiere login con rol `responsable_comite`)

---

## 📊 Lógica del semáforo

```typescript
// Verde (✓): cumplido O días_restantes > 5
// Amarillo (⚠️): 1–5 días para vencer
// Rojo (🔴): vencido (días < 0)

function getSemaforo(oficio: Oficio): Semaforo {
  if (oficio.estatus === 'cumplido') return 'verde';
  const dias = Math.ceil((fecha_vencimiento - now) / 86400000);
  if (dias < 0) return 'rojo';
  if (dias <= 5) return 'amarillo';
  return 'verde';
}
```

---

## 💰 Costo API Anthropic

**Por oficio procesado (~7K tokens entrada + 800 output):**
- Input: $0.021 USD
- Output: $0.012 USD
- **Total: ~$0.033 USD ≈ $0.58 MXN**

**Estimado anual (20 oficios/año):**
- ~$0.80–$3.00 USD
- ~$14–$53 MXN

→ **Negligible. No es preocupación.**

---

## 🎨 Paleta del portal

```
Fondo oscuro:    #060e1c (sidebar), #002048 (primary)
Acento dorado:   #EAAB00
Glassmorphism:   rgba(255,255,255,0.03) bg + blur(8px)
Cumplido (✓):    #10B981 (verde)
Urgente (⚠️):    #F59E0B (amarillo)
Vencido (🔴):    #EF4444 (rojo)
```

---

## 📝 Notas de desarrollo

- **Rol:** Nav item "Oficios CNBV" solo para `responsable_comite` en PortalLayout.tsx
- **Festivos:** 2026 precargados en DB; usar función `calcular_vencimiento()` para WORKDAY
- **PDF Storage:** Ruta es `oficios-pdfs/{user_id}/{timestamp}.{ext}` — RLS asegura privacidad
- **Claude fallback:** Si JSON no válido → error message → user reintenta
- **Auto-sync estatus:** Si todas las tareas son "concluido" → oficio automáticamente "cumplido"

---

## 🚀 Próximas mejoras posibles

1. Notificaciones por email para oficios próximos a vencer
2. Asignar responsable_id a tareas (UI dropdown de usuarios)
3. Comentarios/activity log (tabla `oficio_comentarios` ya existe)
4. Exportar historial a Excel/PDF
5. Rol dedicado `oficial_cumplimiento` en Auth
6. Caché resultados IA (si mismo oficio se sube 2x)
7. Validación número oficio con regex: `155-1/XXXXXX/YYYY`

---

## 🔍 Troubleshooting

| Problema | Causa | Fix |
|---|---|---|
| "ANTHROPIC_API_KEY no configurada" | .env.local incompleto | Agregar `ANTHROPIC_API_KEY=sk-ant-...` |
| PDF no se procesa | Archivo protegido/corrupto | Pedir nuevo PDF a la CNBV |
| JSON de Claude inválido | Respuesta inesperada | Reintentar (hay fallback) |
| Bucket no existe | Setup incompleto | Crear `oficios-pdfs` en Dashboard |
| Rutas no existen | Migraciones no corridas | Ejecutar .sql en Supabase |
| Sin nav item | Usuario no tiene rol correcto | Asignar `role='responsable_comite'` |
