# AMIB Web — Handover & Roadmap

Este documento centraliza el estado actual del proyecto, la arquitectura definida y los siguientes pasos para el equipo de desarrollo.

---

## 🚀 Estado Actual del Proyecto

El proyecto ha completado la **Fase 4: Portales de Audiencia + Optimización Responsiva**. La plataforma es ahora apta para dispositivos móviles y la infraestructura del portal privado está lista para recibir datos reales.

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

### Fase 5: Integración de Datos Privados ← PRÓXIMA SESIÓN
- [ ] **Persistencia en Comités**: Crear migración y conectar tabla `comites_sesiones` en Supabase.
- [ ] **Repositorio de Normatividad**: Implementar vista `/normatividad` con descarga de PDFs y búsqueda dinámica.
- [ ] **Middleware de Seguridad**: Proteger rutas `asociados/portal/*` con Supabase Auth + `middleware.ts`.

### Fase 6: Funcionalidades Administrativas
- [ ] **Vista de Informes del Portal**: Diseñar e implementar la sección `/informes` con widgets de reportes.
- [ ] **Gestor de Minutas**: Flujo para subir y consultar minutas de comités desde el portal.
- [ ] **Notificaciones**: Sistema de alertas para próximas sesiones críticas.

### Fase 7: Optimización & Despliegue
- [ ] **SEO Técnico**: Meta-tags dinámicos por noticia/página.
- [ ] **Performance**: Optimización de imágenes (Next/Image) y cargas diferidas.
- [ ] **CI/CD**: Configuración final para despliegue automático en Hostinger.

---

## 📋 Tareas para la Próxima Sesión

> [!IMPORTANT]
> Ejecutar en este orden para asegurar que el backend esté listo antes de conectar la UI:

1. **[DB]** Crear migración Supabase: tabla `comites_sesiones`
   ```sql
   -- campos: id, nombre, fecha, hora_inicio, hora_fin, estado, rol_asociado, ubicacion, link_documento
   ```
2. **[Backend]** Implementar función en `src/lib/supabase/server.ts` para consultar sesiones por asociado.
3. **[UI]** Conectar `ComitesPage` para reemplazar datos estáticos con la consulta real (RSC o SWR).
4. **[Auth]** Agregar `middleware.ts` para bloquear acceso a `/(portal)/*` si no hay sesión activa.
5. **[UI]** Iniciar diseño de la sección `/informes` en el portal.

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
