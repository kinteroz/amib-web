# AMIB Web — Handover & Roadmap

Este documento centraliza el estado actual del proyecto, la arquitectura definida y los siguientes pasos para el equipo de desarrollo.

---

## 🚀 Estado Actual del Proyecto

El proyecto ha completado la **Fase 5: Integración de Datos Privados**. El middleware de autenticación protege todas las rutas del portal y del admin. Los datos reales de comités provienen de Supabase vía RSC.

### Hitos Completados
- [x] **Market Dashboard v2**: Navegación por pestañas, integración de Alpha Vantage (Sentimiento de Noticias y Plata XAG).
- [x] **Portal Asociados (UI)**: Arquitectura de Sidebar/Topbar, Dashboard de bienvenida y Centro de Gestión de Comités (Frontend).
- [x] **Institutional Login**: Rediseño a formato Split-Screen con branding "Bursátil Precision".
- [x] **Optimización Mobile-First**: Menú Hamburguesa (Drawer), tabs con scroll horizontal, grillas y paddings adaptables.

---

## 🛠 Arquitectura Técnica

1. **Estilos**: Vanilla CSS con **CSS Modules** (`.module.css`). **NO usar Tailwind CSS**.
2. **Animaciones**: **Framer Motion** para transiciones de portal y micro-interacciones. `AnimatePresence` para el overlay del Drawer.
3. **Portal Privado**: Estructurado en `src/app/[locale]/(portal)/asociados/portal/`. Utiliza `PortalLayout` compartido con `PortalSidebar` y `PortalTopbar`.
4. **Supabase**:
   - Consultas de Servidor: `src/lib/supabase/server.ts` (Usar en RSC para velocidad).
   - Consultas de Cliente: `src/lib/supabase/client.ts`.
   - Admin/Service Role: `src/lib/supabase/admin.ts` (Solo para procesos internos, **nunca** en el cliente).
5. **Responsive**: Breakpoints en `768px` (móvil) y `1024px` (tablet). El Sidebar se convierte en Drawer colapsable en `≤1024px`.

---

## 🗺 Hoja de Ruta Actualizada (Roadmap)

### Fase 5: Integración de Datos Privados ✅ COMPLETADA
- [x] **Persistencia en Comités**: Migración y tabla `comites_sesiones` conectada. RSC consume datos reales.
- [x] **Repositorio de Normatividad**: Vista `/normatividad` implementada.
- [x] **Middleware de Seguridad**: `src/middleware.ts` — protege `/{locale}/asociados/portal/*` y `/{locale}/admin/*`. Redirige a `/login?redirectTo=` si no hay sesión. El LoginPage respeta el `redirectTo` al autenticar.

### Fase 6: Funcionalidades Administrativas
- [ ] **Vista de Informes del Portal**: Diseñar e implementar la sección `/informes` con widgets de reportes.
- [ ] **Gestor de Minutas**: Flujo para subir y consultar minutas de comités desde el portal.
- [ ] **Notificaciones**: Sistema de alertas para próximas sesiones críticas.

### Fase 7: Optimización & Despliegue
- [ ] **SEO Técnico**: Meta-tags dinámicos por noticia/página.
- [ ] **Performance**: Optimización de imágenes (Next/Image) y cargas diferidas.
- [ ] **CI/CD**: Configuración final para despliegue automático en Hostinger.

---

## 📋 Tareas para la Próxima Sesión (Fase 6)

> [!IMPORTANT]
> El portal está protegido y con datos reales. Siguiente fase: funcionalidades administrativas.

1. **[UI]** Gestor de Minutas — flujo para subir y consultar minutas de comités desde el portal.
2. **[DB]** Crear tabla `minutas` en Supabase (migración versionada) ligada a `comites_sesiones`.
3. **[UI]** Sistema de Notificaciones — alertas para próximas sesiones (badge en Sidebar / toast al entrar).
4. **[UI]** Sección `/informes` — actualmente con datos estáticos; conectar a tabla Supabase para gestión real de PDFs.

---

## 📁 Estructura de Archivos Clave

```
src/
├── app/[locale]/
│   ├── login/
│   │   ├── page.tsx          ← Login Split-Screen
│   │   └── login.module.css
│   └── (portal)/asociados/portal/
│       ├── layout.tsx        ← Envuelve con PortalLayout
│       ├── dashboard/page.tsx
│       └── comites/page.tsx
├── components/
│   ├── portal/
│   │   ├── PortalLayout.tsx  ← Sidebar + Topbar + Drawer lógica
│   │   └── portal.module.css ← Sistema de diseño del portal
│   └── ui/market/
│       └── market.module.css ← Estilos del dashboard de mercado
└── lib/
    └── supabase/             ← server.ts / client.ts / admin.ts
```

---

## 🤝 Contacto
- **Manager**: Armando Quintero
- **Stack**: Next.js (Turbo) + Supabase + Framer Motion.
