# AMIB Web — Portal Institucional

Rediseño del sitio institucional de la **AMIB (Asociación Mexicana de Instituciones Bursátiles)**: sitio público segmentado por audiencia + portal privado con módulos operativos (Eventos, Comités, Educación, Oficios CNBV).

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Supabase (Postgres/Auth/Storage) · next-intl · Framer Motion · CSS Modules (sin Tailwind).

## Documentación

| Doc | Qué contiene |
|---|---|
| [docs/PRODUCTO.md](docs/PRODUCTO.md) | Qué es el producto, audiencias y estado por módulo — **léelo primero** |
| [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) | Stack, estructura, modelo de datos, RLS, ADRs y deuda técnica |
| [docs/TESTING.md](docs/TESTING.md) | Estrategia de pruebas, usuarios por rol y checklist de release |
| [docs/ERRORES.md](docs/ERRORES.md) | Base de conocimiento de errores resueltos |
| [HANDOVER.md](HANDOVER.md) | Estado actual y roadmap |
| [CLAUDE.md](CLAUDE.md) | Guía para agentes + detalle del módulo Oficios CNBV |

## Setup local

1. **Dependencias**

   ```bash
   npm install
   ```

2. **Variables de entorno** — crea `.env.local` (nunca se commitea):

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...   # server-only, jamás NEXT_PUBLIC_
   ANTHROPIC_API_KEY=...           # IA: oficios CNBV y minutas de comités
   GROQ_API_KEY=...                # chatbot institucional
   ALPHA_VANTAGE_KEY=...           # market dashboard
   ```

3. **Base de datos** — ejecuta las migraciones de `supabase/migrations/*.sql` en orden (Supabase Dashboard → SQL Editor) si el proyecto es nuevo.

4. **Dev server**

   ```bash
   npm run dev
   ```

   Abre [http://localhost:3000](http://localhost:3000) (redirige a `/es`).

## Verificación antes de entregar

```bash
npx tsc --noEmit   # ⚠️ hay errores preexistentes por database.types.ts desactualizado
npm run lint
npm run build      # debe quedar en verde
```

Checklist manual y usuarios de prueba por rol: [docs/TESTING.md](docs/TESTING.md).

## Despliegue

Build standalone con Docker (`Dockerfile` en la raíz) o `npm run build && npm start`. Configura las mismas variables de entorno en el host.
