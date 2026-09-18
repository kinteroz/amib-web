# AMIB Web · Documento de Producto

> Para qué existe esto y para quién. Si eres agente o consultor nuevo, **lee esto primero**.
> Última actualización: 2026-07-19.

## Problema

El sitio institucional de la **AMIB (Asociación Mexicana de Instituciones Bursátiles)** — [amib.com.mx](https://amib.com.mx/) — está desactualizado: información difícil de encontrar por perfil de usuario, administración de contenidos manual y procesos internos (comités, eventos, oficios CNBV) que viven en Excel y correo. El rediseño moderniza la cara pública **y** digitaliza la operación interna en un solo portal.

**Estado comercial:** el proyecto fue **vendido al cliente (2026-07-19)**. La entrega comprometida es el código actual con los módulos de **Eventos** y **Comités** funcionando end-to-end.

## A quién sirve

- **Cliente directo**: AMIB — ente autorregulador y certificador del mercado bursátil mexicano.
- **Usuarios** (segmentación por perfil; toda decisión de IA/UI parte de "¿qué perfil entra por aquí?"):

| Audiencia | Necesidad principal |
|---|---|
| **Asociados y Afiliados** | Casas de Bolsa y Operadoras de Fondos — circulares, normativa, herramientas internas (comités, oficios) |
| **Certificación** | Personas físicas y morales — procesos, calendarios, registro, FAQ |
| **Educación** | Estudiantes, universidades — cátedras, control escolar, talento bursátil |
| **Empresas** | Emisoras potenciales — financiamiento en el mercado de valores |
| **Inversionistas** | Individuales e institucionales — estadísticas, análisis, market dashboard |
| **Prensa** | Medios especializados — comunicados, informes, noticias |

- **Mercado**: México, **español es-MX** (i18n con next-intl preparado para inglés).

## Pilares de diseño (Creative North Star)

Toda decisión visual o de UX debe ser defendible contra estos tres pilares:

1. **Confianza e Integridad** — la AMIB es ente autorregulador y certificador. Nada "startup-y" o frívolo.
2. **Accesibilidad y Claridad** — navegación intuitiva para perfiles muy distintos (de un estudiante a un director de casa de bolsa).
3. **Modernidad Institucional** — estética contemporánea (dark + dorado, glassmorphism) sin sacrificar seriedad.

## Núcleo del producto

Un sitio público segmentado por audiencia + un **portal privado** (`/mi-cuenta`) con módulos operativos por rol:

| Módulo | Público / Privado | Estado |
|---|---|---|
| Home + navegación por pilares (Global, Certificación, Asociados, Educación) | Público | ✅ |
| Noticias / Sala de prensa | Público + Admin CMS | ✅ |
| Market Dashboard (Alpha Vantage) | Público | ✅ |
| Certificaciones (micrositios CMS) | Público + Admin | ✅ |
| **Eventos** (landing, registro con tickets, QR, ponentes, galería, Q&A en vivo) | Público + Portal + Admin | 🏗 Entrega — falta cerrar "Mis eventos" y check-in real |
| **Comités** (maestro, miembros, sesiones, minutas, acuerdos, firmas) | Portal + Admin | 🏗 Entrega — falta cerrar flujos de miembros/firmas |
| Educación (cátedras, materias, asistencia QR, kardex) | Portal profesor/alumno + Admin | ✅ |
| Oficios CNBV (upload PDF → IA extrae → tareas → semáforo) | Portal `responsable_comite`/`contralor` | ✅ |
| Asistente IA (chat con FTS/vectores sobre contenido) | Público | ✅ |

> Detalle técnico y estado fino por módulo en [ARQUITECTURA.md](ARQUITECTURA.md) y [HANDOVER.md](../HANDOVER.md).

## Decisiones de producto ya tomadas

| Decisión | Elección | Implicación |
| -------- | -------- | ----------- |
| CMS | **Supabase como CMS headless** (tablas + Storage), admin propio en `/admin` | Sin CMS de terceros; el admin es parte del producto |
| Segmentación | Navegación por 4 pilares + portal por rol | El rol (en `user_metadata.role`) decide qué módulos se ven |
| Eventos | Registro público con tickets (libre/pago) + boleto QR + check-in | El QR es la llave de asistencia presencial |
| Comités | Ciclo completo: sesiones → minutas → acuerdos → firmas | Reemplaza el flujo de correo/Word de los coordinadores |
| IA | Claude para extracción de oficios y chat institucional | Costo negligible (~$0.03 USD por oficio) |
| Idioma | es-MX primero; estructura i18n lista | Copys sin anglicismos innecesarios |

## Fuera de alcance (por ahora)

- Pasarela de pago real para eventos de pago (el registro captura la intención; cobro fuera del sitio).
- App móvil nativa.
- Migración automática del contenido histórico de amib.com.mx.

## Preguntas abiertas de producto

- ¿Inglés para inversionistas extranjeros en la fase 2?
- ¿Notificaciones por email (eventos próximos, oficios por vencer)?
- Hosting definitivo (hay Dockerfile; HANDOVER menciona Hostinger) — confirmar con el cliente.
