# AMIB Web — Handover & Roadmap

Este documento centraliza el estado actual del proyecto, la arquitectura definida y los siguientes pasos para el equipo de desarrollo.

---

## 🚀 Estado Actual del Proyecto

El proyecto ha completado la **Fase 8: Módulo Educativo & Certificación**. Se ha establecido un sistema robusto de control escolar y se ha unificado la navegación institucional.

### Hitos Completados
- [x] **Market Dashboard v2**: Navegación por pestañas, integración de Alpha Vantage (Sentimiento de Noticias y Plata XAG).
- [x] **Portal Asociados (UI)**: Arquitectura de Sidebar/Topbar, Dashboard de bienvenida y Centro de Gestión de Comités.
- [x] **Institutional Login**: Rediseño a formato Split-Screen con branding "Bursátil Precision".
- [x] **Optimización Mobile-First**: Menú Hamburguesa (Drawer), tabs con scroll horizontal y grillas adaptables.
- [x] **Módulo de Cátedras & Control Escolar**: 
  - Refactorización a modelo relacional **Cátedra -> Materias -> Profesores**.
  - Sistema de asistencia presencial vía códigos QR dinámicos.
  - Gestión de calificaciones por materia (Kardex) y entregas de tareas.
  - Carga masiva de alumnos vía CSV con invitaciones automáticas.
- [x] **Hub de Educación (Public)**: Nueva landing page inmersiva en `/educacion` con diseño estilo "Eventos" y visualización de programas destacados.
- [x] **Navegación Global v3**: Reorganización del menú principal en 4 pilares: **Global, Certificación, Asociados y Educación**.

---

## 🛠 Arquitectura Técnica

1. **Estilos**: Vanilla CSS con **CSS Modules** (`.module.css`). **NO usar Tailwind CSS**.
2. **Animaciones**: **Framer Motion** para transiciones de portal y micro-interacciones. `AnimatePresence` para el overlay del Drawer.
3. **Portal Privado**: Estructurado en `src/app/[locale]/(portal)/asociados/portal/`. Utiliza `PortalLayout` compartido.
4. **Módulo Educativo (Estructura)**:
   - `public.catedras`: Programas de alto nivel (Diplomados/Certificaciones).
   - `public.materias`: Módulos o materias dentro de una cátedra, asignados a un profesor.
   - `public.materia_alumnos`: Registro de inscripciones y calificaciones granulares.
5. **Supabase**:
   - Consultas de Servidor: `src/lib/supabase/server.ts`.
   - Consultas de Cliente: `src/lib/supabase/client.ts`.
   - Admin/Service Role: `src/lib/supabase/admin.ts`.

---

## 🗺 Hoja de Ruta Actualizada (Roadmap)

### Fase 8: Módulo Educativo & Certificación ✅ COMPLETADA
- [x] **Refactorización de Cátedras**: Migración a esquema de materias y profesores múltiples.
- [x] **Asistencia QR**: Implementación de `sesiones_catedra` y escaneo dinámico.
- [x] **Landing Page Educación**: Rediseño inmersivo con Hero de alto impacto y tarjetas de programas.
- [x] **Navegación Unificada**: Rebranding de segmentos en Header y SegmentSwitcher.

### Fase 9: Consolidación del Administrador 🏗 EN PROGRESO
- [ ] **Gestión de Materias**: Vistas de edición para agregar módulos a programas existentes.
- [ ] **Panel de Calificaciones**: Interfaz tipo hoja de cálculo para profesores.
- [ ] **Visor de Contratos**: Studio para revisión de contratos de profesores y expedientes.

### Fase 10: Entrega — Eventos y Comités reales ✅ (2026-07-19)

**Eventos (core cerrado):**
- [x] `registerEvent` valida payload, liga `usuario_id` de la sesión, guarda ticket/institución/cargo, registra acompañantes con QR propio y evita doble registro por correo.
- [x] "Mis eventos" (`/mi-cuenta/mis-eventos`) ahora consulta registros reales (por `usuario_id` o email de sesión) — se eliminó el mock.
- [x] QR generado **localmente** (`qrcode` npm, componente `QrImage`) — se eliminó la dependencia de api.qrserver.com.
- [x] **Check-in con cámara** en `/admin/eventos/[id]/asistentes` (`QrScanner`: BarcodeDetector nativo + fallback jsQR) con feedback visual.
- [x] RLS endurecido: solo `admin` gestiona asistentes; el asistente lee lo suyo.

**Comités (ciclo completo):**
- [x] **Minuta con IA**: `/api/comites/generar-minuta` (Claude Sonnet) — pega notas → minuta formal + acuerdos detectados que se siembran en `comites_acuerdos` al guardar.
- [x] **Kanban de acuerdos** con drag & drop (vista Tablero | Lista) y alerta de vencidos.
- [x] **Firma de minutas**: botón "Firmar" (hash SHA-256 + usuario); trigger SQL pasa la minuta a `completada` cuando firman todos los miembros.
- [x] **Mesas de trabajo**: `parent_id` en `comites_maestro`; el coordinador crea mesas bajo su comité desde "Mis Comités".
- [x] Fix RLS de `minutas` (la policy vieja consultaba `auth.users` y bloqueaba todo).

**⚠️ Migraciones pendientes de ejecutar en Supabase (SQL Editor, en orden):**
1. `supabase/migrations/20260719_eventos_core.sql`
2. `supabase/migrations/20260719_comites_ciclo.sql`

**Pendientes de la entrega:** constancias de asistencia PDF, correo de confirmación con boleto, prueba manual end-to-end de ambos flujos (ver docs/TESTING.md), limpieza del repo.

---

## 🚀 Guía de Despliegue (Hostinger)

### 1. Variables de Entorno
Configurar en Panel de Hostinger o `.env.production`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ALPHA_VANTAGE_KEY`
- `GROQ_API_KEY`

### 2. Comandos de Build
```bash
npm install
npm run build
```

---

## 📁 Estructura de Archivos Clave

```
src/
├── app/[locale]/
│   ├── (portal)/educacion/   ← Nueva Landing de Educación
│   ├── (portal)/certificaciones/ ← Landing Pro de Certificación
│   ├── (admin)/admin/catedras/ ← Gestión administrativa (Materias)
│   └── actions/              ← Server Actions (CSV Import, Cátedras)
├── components/
│   ├── portal/               ← Layouts y Sidebar
│   └── ui/navigation/        ← Header y SegmentSwitcher
└── lib/
    └── supabase/             ← server.ts / client.ts / admin.ts
```

---

## 🤝 Contacto
- **Manager**: Armando Quintero
- **Stack**: Next.js (Turbo) + Supabase + Framer Motion.
