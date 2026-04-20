# AMIB Web — Handover & Roadmap

Este documento centraliza el estado actual del proyecto, la arquitectura definida y los siguientes pasos para el equipo de desarrollo (humanos y agentes).

---

## 🚀 Estado Actual del Proyecto

El proyecto se encuentra en la **Fase 3: Integración Dinámica**. Hemos pasado de una estructura estática a un portal funcional conectado al backend real de AMIB.

### Hitos Completados
- [x] **Fase 1: Setup Base**: Next.js (App Router), TypeScript, i18n (`next-intl`) y `output: standalone` para Hostinger.
- [x] **Fase 2: UI Premium**: Implementación de animaciones tridimensionales (*Stacked Cards*) y Luz Ambiental interactiva (*Cursor Spotlight*).
- [x] **Fase 3: Supabase Core**: Conexión segura con el esquema real. Los componentes de la Home ya consumen datos dinámicos de `banners`, `noticias` y `certificaciones`.

---

## 🛠 Arquitectura Técnica

Para mantener la coherencia del proyecto, todo el equipo debe respetar estas directrices:

1. **Estilos**: **NO usar Tailwind CSS**. Se utiliza Vanilla CSS con **CSS Modules** (`.module.css`) para mantener el control total sobre la estética institucional.
2. **Animaciones**: Usar **Framer Motion** para cualquier interacción premium.
3. **Internacionalización**: Todas las rutas y textos deben pasar por `next-intl` (`src/app/[locale]`). Los diccionarios están en `/messages`.
4. **Supabase**: 
   - Consultas de Servidor: `src/lib/supabase/server.ts` (Usar en RSC para velocidad).
   - Consultas de Cliente: `src/lib/supabase/client.ts`.
   - Admin/Service Role: `src/lib/supabase/admin.ts` (Solo para procesos internos, **nunca** exponer en el cliente).

---

## 🗺 Hoja de Ruta (Roadmap)

### Fase 4: Portales de Audiencia (Siguiente Prioridad)
- [ ] **Portal de Certificación**: Página detallada `/certificaciones` con filtros por tipo y buscador de calendarios de examen.
- [ ] **Sección de Inversionistas**: Implementación de dashboards estadísticos consumiendo datos financieros de Supabase.
- [ ] **Sala de Prensa**: Repositorio completo de comunicados y búsqueda por fechas.

### Fase 5: Interactividad & Auth
- [ ] **Acceso Asociados**: Flujo de Login usando Supabase Auth.
- [ ] **Dashboard Privado**: Contenido exclusivo para casas de bolsa y operadoras.

### Fase 6: Optimización & Despliegue
- [ ] **SEO Técnico**: Meta-tags dinámicos por noticia/página.
- [ ] **Performance**: Optimización de imágenes (Next/Image) y cargas diferidas.
- [ ] **CI/CD**: Configuración final para despliegue automático en Hostinger.

---

## 📋 Tareas Pendientes Inmediatas

> [!IMPORTANT]
> Estas son las tareas críticas para la siguiente iteración:

1. **[UI/UX]** Crear placeholders de "Skeleton" para las tarjetas dinámicas mientras cargan los datos de Supabase (evitar Layout Shift).
2. **[DATA]** Modelar la tabla de `idiomas` o campos `locale` en Supabase para soportar el contenido multi-idioma de forma real.
3. **[FEAT]** Desarrollar el componente de búsqueda global en el Header institucional.

---

## 🤝 Contacto y Colaboración
- **Manager**: Armando Quintero
- **Stack**: Next.js (Turbo) + Supabase + Framer Motion.
