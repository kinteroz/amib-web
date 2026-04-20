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
