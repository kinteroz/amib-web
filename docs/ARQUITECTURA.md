# AMIB Web · Arquitectura

> Cómo está construido el sistema. Léelo junto con [PRODUCTO.md](PRODUCTO.md) (el
> qué/por qué) y [HANDOVER.md](../HANDOVER.md) (estado actual).
> Última actualización: 2026-07-19.

## Vista general

```
┌───────────────────────────── Next.js 16 (App Router) ─────────────────────────────┐
│  Público (/{locale})        Portal (/mi-cuenta)         Admin (/admin)            │
│  home · noticias · eventos  dashboard · mis-comites     eventos · comites ·       │
│  certificaciones · market   mis-eventos · oficios       noticias · usuarios ·     │
│  educacion · chat IA        docencia · asistencia QR    catedras · certificación  │
└──────────────┬────────────────────────┬───────────────────────┬───────────────────┘
               │ anon key (RLS)         │ anon key (RLS)        │ service_role (API routes)
               ▼                        ▼                       ▼
        ┌──────────────────────── Supabase (bqwcfjxtmbgjynoscxjx) ────────────────┐
        │  Postgres + RLS · Auth (roles en user_metadata) · Storage (PDFs)        │
        └─────────────────────────────────────────────────────────────────────────┘
               ▲                        ▲                       ▲
        Alpha Vantage (market)   Anthropic Claude (oficios, chat)   Groq / Google GenAI
```

## Stack y por qué

| Capa | Tecnología | Razón |
| ---- | ---------- | ----- |
| Frontend | Next.js **16.2.4** (App Router) + React 19 | SSR para SEO institucional |
| i18n | next-intl (`/{locale}/…`, es default) | Preparado para inglés fase 2 |
| Estilos | **CSS Modules + estilos inline** — **NO Tailwind** | Decisión del repo; no introducir sistemas alternos |
| Animaciones | Framer Motion | Transiciones de portal y micro-interacciones |
| Estado cliente | Zustand (solo UI efímero) | Server state viene de RSC/queries |
| Backend/BD | Supabase (Postgres, Auth, Storage) | CMS headless + auth + RLS |
| IA | `@anthropic-ai/sdk` (oficios, chat) · Groq · Google GenAI | ⚠️ ver deuda: 3 proveedores |
| PDF | pdf-parse | Extracción de texto de oficios CNBV |
| Paquetes | npm | Nunca yarn/pnpm |

> ⚠️ **Next.js 16**: `params`, `searchParams` y `cookies()` son **async**. Revisar
> `node_modules/next/dist/docs/` antes de tocar `app/` (ver AGENTS.md).

## Estructura del repo

```
src/
├── proxy.ts                        # middleware: next-intl + refresh de sesión Supabase
├── app/
│   ├── [locale]/
│   │   ├── (portal)/               # sitio público + portal autenticado
│   │   │   ├── eventos/[slug]/     # landing evento + registro (wizard con tickets)
│   │   │   ├── mi-cuenta/          # dashboard, mis-comites, mis-eventos, oficios, docencia
│   │   │   ├── certificaciones/ · educacion/ · noticias/ · market/ · asistencia/
│   │   ├── (admin)/admin/          # CMS: eventos, comites, noticias, usuarios, catedras
│   │   ├── (profesor)/profesor/    # vistas de docencia
│   │   └── login/ · registro/
│   ├── actions/                    # Server Actions (registerEvent, CSV import, …)
│   ├── api/                        # route handlers: oficios (IA), chat, market, admin
│   └── auth/                       # callback / signout
├── components/
│   ├── ui/                         # branding, navigation, events, market, ai, animations
│   ├── portal/                     # PortalLayout (sidebar por rol), oficios, certificaciones
│   └── admin/
├── lib/supabase/                   # server.ts · client.ts · admin.ts (service_role)
└── types/database.types.ts         # tipos generados del esquema
supabase/migrations/                # 40+ migraciones SQL versionadas (2026-04 →)
messages/                           # diccionarios next-intl
```

## Modelo de datos (dominios)

```
CMS público:      noticias · banners · certificaciones · micrositios_cert ·
                  documentos_cert · examenes_certificacion · market_indicators
                  ⚠️ noticias/banners/certificaciones NO tienen migración en el repo
                     (creadas ad-hoc en dashboard — ver deuda técnica)

Eventos:          eventos (slug, agenda_json, tipo_acceso, configuracion_registro)
                  ├──< evento_tickets   (niveles de acceso, precio, activo)
                  ├──< evento_asistentes(usuario_id?, nombre, email, qr_code,
                  │                      asistio, fecha_checkin)   ← registro + check-in
                  ├──< evento_ponentes · evento_galeria
                  ├──< evento_preguntas (Q&A en vivo, LiveQA.tsx)
                  └──  evento_registros ⚠️ tabla creada pero SIN uso en código

Comités:          comites_maestro (coordinador_amib_id → auth.users)
                  ├──< comites_miembros
                  ├──< comites_sesiones
                  ├──< minutas ──< comites_firmas
                  ├──< comites_acuerdos
                  └──  informes

Educación:        catedras ──< materias ──< materia_alumnos · profesores ·
                  sesiones_catedra (QR asistencia) · asistencias · tareas · entregas ·
                  alumnos · catalogo_materias · instituciones_educativas

Oficios CNBV:     oficios ──< oficio_tareas ──< oficio_tarea_pasos · festivos
                  (detalle completo en CLAUDE.md § Módulo Oficios)

Chat IA:          document_chunks · document_embeddings (FTS + vectores)
```

## Auth y roles

- Login con Supabase Auth; sesión refrescada en `src/proxy.ts` (middleware).
- **El rol vive en `auth.users.raw_user_meta_data->>'role'`** y las policies lo leen
  vía `auth.jwt() -> 'user_metadata' ->> 'role'` (migración `20260422_roles_rls.sql`).
- Roles en uso: `admin` · `asociado` · `responsable_comite` · `contralor` ·
  `profesor` · `encargado_catedra` (y usuarios sin rol = público autenticado).
- `PortalLayout.tsx` decide los items del sidebar por rol.

## Seguridad y RLS

- Cliente (browser y RSC) usa la **anon key** → todo pasa por RLS.
- `lib/supabase/admin.ts` y algunos server actions usan **service_role** (bypassa
  RLS) — solo server-side, jamás `NEXT_PUBLIC_`.
- ⚠️ `app/actions/registerEvent.ts` inserta en `evento_asistentes` con service_role
  **sin validar el payload** — endurecer antes de entrega (ver deuda).

## Despliegue

- `Dockerfile` en la raíz (build standalone). HANDOVER menciona **Hostinger**.
- Variables requeridas: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `ALPHA_VANTAGE_KEY`, `GROQ_API_KEY`.

## Registro de decisiones (ADR resumido)

| # | Decisión | Estado |
| - | -------- | ------ |
| 1 | Supabase como CMS headless + admin propio (sin CMS de terceros) | Aceptada |
| 2 | CSS Modules / inline styles; **no Tailwind** | Aceptada |
| 3 | Roles en `user_metadata` + RLS por `auth.jwt()` (sin tabla profiles) | Aceptada |
| 4 | Registro de eventos escribe en `evento_asistentes` (no `evento_registros`) | Aceptada — dropear tabla muerta |
| 5 | IA: Claude para oficios/chat; Groq/Google evaluados | Revisar — consolidar proveedor |
| 6 | Agenda de eventos como `agenda_json` en la tabla (no tabla hija) | Aceptada |

## Deuda técnica

> Actualizado 2026-07-19 tras el cierre de Eventos/Comités y la limpieza del repo.

1. **Tablas sin migración en el repo**: `noticias`, `banners`, `certificaciones` se
   usan en código pero no existen en `supabase/migrations/` — exportar su DDL a una
   migración baseline.
2. **`evento_registros`** creada y sin uso en código — dropear en una migración futura.
3. **`database.types.ts` desactualizado**: faltan tablas (cátedras, etc.) y el
   generic no satisface supabase-js 2.103 → ~100 errores de `tsc` preexistentes
   (el build los ignora vía `ignoreBuildErrors`). Regenerar con
   `supabase gen types typescript --project-id bqwcfjxtmbgjynoscxjx`.
4. Sin suite de tests automatizados (ver [TESTING.md](TESTING.md) — estado objetivo).
5. Correo transaccional (confirmación de registro con boleto) pendiente de definir
   proveedor (Resend/SMTP del cliente).
6. `guias/mercadovalores83.pdf` (14 MB) vive en el repo como fuente del corpus del
   chatbot (`scripts/ingest-pdf.cjs`) — mover a Storage si el repo debe adelgazar.

**Resuelto el 2026-07-19:** validación + `usuario_id` en `registerEvent`; "Mis
eventos" real; QR local (`qrcode`); check-in con cámara; RLS de asistentes y
minutas corregidas; ruta muerta de Gemini eliminada (el chatbot usa Groq en
`/api/chat`); SDKs de Google desinstalados; `[DEBUG]` logs, presentaciones de
venta, `scratch/`, `schema.json` y carpetas rotas eliminados.
