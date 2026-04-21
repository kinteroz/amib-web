# AMIB Web — Handover & Roadmap

Este documento centraliza el estado actual del proyecto, la arquitectura definida y los siguientes pasos para el equipo de desarrollo.

---

## 🚀 Estado Actual del Proyecto

El proyecto ha completado la **Fase 4: Portales de Audiencia (Estructura)**. Hemos elevado la experiencia del Panel de Mercado y sentado las bases del ecosistema privado para asociados.

### Hitos Completados
- [x] **Market Dashboard v2**: Navegación por pestañas, integración de Alpa Vantage (Sentimiento de Noticias y Plata XAG).
- [x] **Portal Asociados (UI)**: Arquitectura de Sidebar/Topbar, Dashboard de bienvenida y Centro de Gestión de Comités (Frontend).
- [x] **Institutional Login**: Rediseño a formato Split-Screen con branding "Bursátil Precision".

---

## 🛠 Arquitectura Técnica

1. **Estilos**: Vanilla CSS con **CSS Modules** (`.module.css`). **NO usar Tailwind CSS**.
2. **Animaciones**: **Framer Motion** para transiciones de portal y micro-interacciones.
3. **Portal Privado**: Estructurado en `src/app/[locale]/(portal)/asociados/portal/`. Utiliza un `PortalLayout` compartido.

---

## 🗺 Hoja de Ruta Actualizada (Roadmap)

### Fase 5: Integración de Datos Privados (Siguiente Prioridad - Mañana)
- [ ] **Persistencia en Comités**: Migrar datos simulados de `ComitesPage` a tablas reales en Supabase (`comites_sesiones`).
- [ ] **Repositorio de Normatividad**: Implementar la vista de `/normatividad` con descarga de PDFs y búsqueda dinámica.
- [ ] **Middleware de Seguridad**: Implementar protección de rutas para `asociados/portal/*` mediante Supabase Auth.

### Fase 6: Funcionalidades Administrativas
- [ ] **Gestor de Minutas**: Flujo para subir y consultar minutas de comités desde el portal.
- [ ] **Notificaciones**: Sistema de alertas para próximas sesiones críticas.

---

## 📋 Tareas para Ejecutar Mañana

> [!IMPORTANT]
> Estas son las tareas críticas para la sesión de mañana:

1. **[Backend]** Crear migraciones de Supabase para la tabla `comites_sesiones` (campos: nombre, fecha, estado, rol_asociado, link_documento).
2. **[Logic]** Implementar la carga de datos (SWR o RSC) en `ComitesView` para reemplazar los objetos estáticos.
3. **[UI/UX]** Finalizar el diseño de la sección de "Informes" dentro del portal de asociados.

---

## 🤝 Contacto
- **Manager**: Armando Quintero
- **Stack**: Next.js (Turbo) + Supabase + Framer Motion.
