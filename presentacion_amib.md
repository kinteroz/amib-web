---
marp: true
theme: default
class:
  - lead
style: |
  section {
    background-color: #f8f9fa;
    color: #333;
    font-family: 'Inter', sans-serif;
  }
  h1, h2, h3 {
    color: #003366;
  }
  table {
    font-size: 0.8em;
  }
  img[alt="Logo"] {
    width: 200px;
    position: absolute;
    top: 20px;
    right: 30px;
  }
---

![Logo](logo.png)

# AMIB Web — Estado del Proyecto
## Inventario de módulos y funcionalidades implementadas
### Mayo 2026

---

![Logo](logo.png)

# Índice

**Módulos del sistema:**
- Stack tecnológico
- Portal público
- Autenticación y roles
- Portal privado — Dashboard
- Sistema de Eventos
- Sistema de Cátedras y Control Escolar
- Gestión de Comités
- Sistema de Oficios CNBV (IA)
- Panel Administrativo
- Integraciones

---

![Logo](logo.png)

# Stack Tecnológico

**Frontend**
- Next.js App Router + TypeScript
- CSS Modules + Framer Motion

**Backend / CMS**
- Supabase (base de datos, auth, storage)
- Next.js API Routes (server-side)

**Inteligencia Artificial & Datos**
- Claude Sonnet 4.6 (procesamiento de oficios)
- Groq (chatbot institucional)
- Alpha Vantage API (Datos de mercado)

**Infraestructura**
- Vercel (hosting con ISR)
- next-intl (internacionalización ES/EN)

---

![Logo](logo.png)

# Portal Público

**Páginas implementadas:**
| Página | Descripción |
|---|---|
| **Home /** | Segmentación por perfil, carrusel, accesos rápidos |
| **Educación /educacion** | Landing de programas educativos |
| **Certificaciones /certificaciones** | Listado y detalle por tipo de certificación |
| **Mercado /market** | Dashboard de indicadores financieros en tiempo real |
| **Noticias /noticias** | Listado y detalle de comunicados institucionales |
| **Asistencia /asistencia/registrar** | Check-in por QR dinámico para eventos |

**Componentes visuales:** Hero con video/imagen, efectos de scroll, barra de mercado, contador animado.

---

![Logo](logo.png)

# Autenticación y Roles

**Flujo de acceso:** Login → Supabase Auth → Detección de rol → Dashboard personalizado

**Roles implementados:**
- `asociado`: Normativa, informes, figura
- `certificado`: Certificaciones, documentos
- `encargado_catedra`: Cátedras, alumnos, sesiones
- `responsable_comite`: Comités, minutas, acuerdos, oficios CNBV

**Páginas de auth:** `/login` (diseño split-screen institucional), `/registro` (alta de nuevos usuarios), Callback OAuth + cierre de sesión controlado.

---

![Logo](logo.png)

# Portal Privado — Dashboard

Cada rol ve un dashboard diferente al ingresar a `/mi-cuenta`:

- **DashboardAsociado**: Acceso a normativa, circulares, informes descargables, estado de figura.
- **DashboardCertificado**: Certificaciones vigentes, documentos, próximas fechas.
- **DashboardEncargadoCatedra**: Mis cátedras activas, alumnos, sesiones próximas, calificaciones pendientes.
- **DashboardResponsable**: Comités activos, oficios CNBV con alertas, acuerdos pendientes.

**Layout compartido:** Sidebar con navegación contextual, Topbar con perfil, navegación colapsable en mobile.

---

![Logo](logo.png)

# Sistema de Eventos

**Flujo:** Creación → Publicación → Registro → Asistencia → Galería

- **Vista pública**: Detalle del evento, Wizard de registro, Countdown Card, Calendario interactivo.
- **Vista privada (asistente)**: Mis eventos registrados.
- **Panel Admin**:
  - CRUD completo de eventos
  - Listado de asistentes + exportación
  - Subida y gestión de galería de fotos
  - Alta y edición de ponentes
  - Q&A en vivo (LiveQA)

---

![Logo](logo.png)

# Sistema de Cátedras y Control Escolar

**Modelo:** Cátedra → Materias → Profesores → Alumnos → Sesiones

- **Vista del profesor**: Lista de cátedras, alumnos, sesiones, actividad, calificaciones, exámenes.
- **Panel Admin**: CRUD de cátedras/diplomados, reporte de asistencia, catálogo de materias, gestión de profesores.

**Funcionalidades destacadas:**
- Importación masiva de alumnos por CSV con invitaciones automáticas.
- Asistencia por QR dinámico por sesión.
- Kardex de calificaciones por materia.

---

![Logo](logo.png)

# Gestión de Comités

**Flujo:** Sesión convocada → Minuta generada → Acuerdos registrados → Seguimiento

- **Vista del responsable**: Dashboard de comités activos, sesiones, minutas (descargables), acuerdos, vista general.
- **Panel Admin**: CRUD de comités institucionales.

**Funcionalidades:**
- Registro de sesiones con fecha, convocatoria y participantes.
- Generación y consulta de minutas.
- Seguimiento de acuerdos (pendiente / en proceso / concluido).

---

![Logo](logo.png)

# Sistema de Oficios CNBV (IA)

Reemplaza flujo manual en Excel con extracción automática.
**Flujo:** PDF subido → Claude extrae datos → Usuario revisa → Guardado → Seguimiento

- **Pantallas**: Dashboard (alertas, timeline), Nuevo (Drag & drop PDF), Detalle (checklist tareas), Historial (búsqueda).
- **Semáforo de vencimiento**:
  - Verde: cumplido o > 5 días hábiles.
  - Amarillo: 1 a 5 días para vencer.
  - Rojo: oficio vencido.
- **Tareas por oficio**: Pendiente → En proceso → Concluido.
- **Costo por oficio procesado**: $0.033 USD ($0.58 MXN).

---

![Logo](logo.png)

# Panel Administrativo

Acceso exclusivo para administradores en `/admin`

| Sección | Funcionalidad |
|---|---|
| **Eventos** | CRUD completo, asistentes, galería, ponentes, Q&A en vivo |
| **Cátedras** | Diplomados, materias, asistencia por sesión |
| **Profesores** | Alta, edición, perfil detallado |
| **Noticias** | CRUD de comunicados institucionales |
| **Banners** | Gestión de banners para el home |
| **Instituciones** | Directorio de instituciones asociadas |
| **Comités** | Catálogo de comités institucionales |
| **Indicadores**| KPIs y métricas del sitio |
| **Usuarios** | Gestión de accesos y roles |

---

![Logo](logo.png)

# Integraciones

- **Claude Sonnet 4.6 (Anthropic)**: Extracción de datos de PDFs y plan de tareas.
- **Groq**: Chatbot institucional (AiChatBot).
- **Alpha Vantage**: Sentimiento de noticias y datos de mercado.
- **Supabase**: Base de datos (PostgreSQL), Auth con roles, Storage (PDFs de oficios), Row Level Security (RLS).
- **next-intl**: Soporte multilenguaje (ES/EN) y rutas localizadas.

---

![Logo](logo.png)

# Resumen de Módulos

| Módulo | Rutas públicas | Rutas privadas | Admin |
|---|---|---|---|
| **Portal institucional** | 6 | — | — |
| **Eventos** | 2 | 1 | 7 |
| **Cátedras y educación**| — | 9 | 5 |
| **Comités** | — | 5 | 1 |
| **Oficios CNBV** | — | 4 | — |
| **Normativa/Docs** | — | 3 | — |
| **Mercado/Datos** | 1 | — | — |
| **Usuarios y auth** | 2 | — | 3 |
| **Total** | **11** | **22** | **16** |

*49 rutas implementadas · 4 roles de usuario · 3 integraciones de IA/datos*

---

![Logo](logo.png)

# Cierre

**Estado actual:** Producción-ready

**Pendientes para puesta en marcha:**
- Configurar `ANTHROPIC_API_KEY` en variables de entorno.
- Ejecutar migraciones SQL en Supabase.
- Crear bucket `oficios-pdfs` en Supabase Storage.
- Definir hosting final (Vercel recomendado).

**Próximas mejoras propuestas:**
- Notificaciones por email para oficios próximos a vencer.
- Exportación de historial a Excel / PDF.
- Asignación de responsables a tareas de oficio.
- Gantt visual del plan de cumplimiento por oficio.
