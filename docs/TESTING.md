# AMIB Web · Testing

> Estrategia y convenciones de pruebas. Pragmática y proporcional a un equipo
> pequeño: probar **donde está el riesgo**, no perseguir cobertura por deporte.
> Última actualización: 2026-07-19.
> ⚠️ **Estado actual: el repo NO tiene tests** (ni script `test` en package.json).
> Este doc define el objetivo mínimo para la entrega.

## Principios

1. **El riesgo vive en**: las policies **RLS por rol** (un `asociado` no debe ver
   el admin; un coordinador solo SUS comités), los server actions / API routes que
   usan **service_role**, y los flujos de entrega: **registro de evento → QR →
   check-in** y **comité → sesión → minuta → acuerdo → firma**.
2. **RLS se prueba en SQL, nunca confiando en el front.** Una policy mal escrita
   expone datos de comités o asistentes — es el test más importante del repo.
3. Nada se da por terminado sin pasar los **gates mínimos** (abajo).

## Pirámide (objetivo)

| Nivel | Herramienta | Qué cubre | Cuándo |
| ----- | ----------- | --------- | ------ |
| Estático | `npx tsc --noEmit` + `npm run lint` | Tipos y convenciones | **Gate en cada cambio** |
| Unit | Vitest | Lógica pura: semáforo de oficios, cálculo de vencimientos con festivos, validación de payloads de server actions | Con cada feature de lógica |
| RLS / datos | SQL tests (`supabase/tests/NN_nombre.sql`) | Por rol: admin vs asociado vs responsable_comite vs contralor vs profesor; coordinador solo ve sus comités; asistentes de evento no leen datos ajenos | Con cada migración que toque policies |
| E2E | Playwright | Flujos de oro: (a) registro público a evento → boleto QR; (b) admin hace check-in; (c) coordinador crea sesión → minuta → acuerdo | Antes de release |
| Manual | Checklist (abajo) | Lo que las máquinas no ven | Antes de cada release |

## Scripts npm (agregar a package.json)

```jsonc
{
  "type-check": "tsc --noEmit",
  "test": "vitest run",
  "test:e2e": "playwright test",
  "check": "npm run type-check && npm run lint && npm run test"
}
```

## Gates mínimos (definición de terminado)

1. `npm run check` en verde (mientras no exista Vitest: `type-check` + `lint`).
2. Si tocó migraciones o policies → test/verificación de RLS por cada rol afectado.
3. Si tocó registro de eventos o ciclo de comités → correr el flujo completo a mano
   (o E2E cuando exista).
4. Revisión visual en **375px** (el portal es mobile-first) y en el tema oscuro del portal.
5. [HANDOVER.md](../HANDOVER.md) actualizado.

## Usuarios de prueba (crear en Supabase Auth)

El rol se asigna en `raw_user_meta_data->>'role'` (Dashboard → Auth → editar usuario):

| Correo sugerido | role | Debe poder |
|---|---|---|
| `admin@amib.test` | `admin` | Todo `/admin`; CRUD eventos, comités, noticias |
| `coordinador@amib.test` | `responsable_comite` | `/mi-cuenta/mis-comites` (solo los suyos) + Oficios |
| `contralor@amib.test` | `contralor` | Oficios CNBV |
| `asociado@amib.test` | `asociado` | Portal asociados; 🚫 `/admin` |
| `profesor@amib.test` | `profesor` | Docencia, asistencia QR |
| `publico@amib.test` | *(sin rol)* | Registro a eventos, mis-eventos; 🚫 comités/oficios |

### Casos a verificar manualmente

| Usuario | Acción | Resultado esperado |
|---------|--------|--------------------|
| público (sin sesión) | Registro a evento libre en `/eventos/[slug]/registro` | ✅ Boleto con QR |
| publico | Ver `/mi-cuenta/mis-eventos` | ✅ SUS registros (hoy: mock — gap de entrega) |
| admin | Check-in de asistente en `/admin/eventos/[id]/asistentes` | ✅ `fecha_checkin` guardada |
| coordinador | `/mi-cuenta/mis-comites` | ✅ Solo comités donde es `coordinador_amib_id` |
| coordinador | Abrir comité de otro coordinador (URL directa) | 🚫 Sin datos |
| asociado | Entrar a `/admin` | 🚫 Redirige |

## Checklist manual de release

- [ ] Registro a evento desde un teléfono real → QR legible y escaneable.
- [ ] Ciclo comité completo: sesión → minuta → acuerdo → firma.
- [ ] Cada rol ve solo su menú en el sidebar del portal.
- [ ] Copys en español es-MX, sin texto de relleno ni `[DEBUG]` en consola.
- [ ] `npm run build` en verde.

## Qué NO testeamos (por ahora)

- Regresión visual automatizada (caro; lo cubre el checklist).
- Integraciones externas de terceros (Alpha Vantage, Anthropic) — se mockean.
- Carga/perf (hasta tener tráfico real).
