# ERRORES / TROUBLESHOOTING — AMIB Web

Base de conocimiento de errores comunes y soluciones. Cada error resuelto no
trivial se documenta aquí con la plantilla — así no se resuelve dos veces.

---

## Plantilla para nuevos errores

```markdown
## [Título del error]

**Síntoma:**
- [Qué ve el usuario]
- [Cuándo ocurre]

**Causa:**
- [Razón técnica]

**Solución:**
[Pasos para resolver — incluir SQL/comandos exactos]

**Prevención:**
[Cómo evitar que vuelva a ocurrir]
```

---

## Módulo Oficios: errores conocidos

**Síntoma:** "ANTHROPIC_API_KEY no configurada" / PDF no se procesa / rutas 404.

**Causa / Solución:** tabla completa de troubleshooting en
[CLAUDE.md § Troubleshooting](../CLAUDE.md) (API key en `.env.local`, migraciones
sin correr, bucket `oficios-pdfs` faltante, rol `responsable_comite` sin asignar).

---

## Redirect de next-intl se pierde tras el refresh de sesión de Supabase

**Síntoma:**
- Entrar a `/` no redirige a `/es` (o el redirect de idioma se ignora de forma intermitente).

**Causa:**
- En el middleware, Supabase recrea la respuesta (`NextResponse.next()`) al refrescar
  cookies vía `setAll`, pisando el redirect/rewrite que next-intl ya había decidido.

**Solución:**
- Ya resuelto en [src/proxy.ts](../src/proxy.ts): si la respuesta de next-intl trae
  `location` o `x-middleware-rewrite`, se devuelve tal cual antes de tocar Supabase.

**Prevención:**
- Al modificar `proxy.ts`, mantener ese guard; cualquier middleware nuevo debe
  respetar redirects previos antes de recrear la respuesta.
