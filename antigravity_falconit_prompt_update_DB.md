# Falcon IT – Corregir dashboard cliente usando el schema actualizado de Supabase como fuente de verdad

## Contexto

Se adjunta un archivo exportado desde Supabase Schema Visualizer:

- `falconit_supabase_update.sql`

IMPORTANTE:
Ese archivo NO debe ejecutarse como migración.
Debe usarse como referencia exacta del estado actual de la base de datos.

Tómalo como source of truth para nombres de tablas, columnas y relaciones actuales.

---

## Problema actual

El flujo de activación ya funciona:

- el cliente se puede registrar
- el cliente puede autenticarse
- el admin puede validar y habilitar
- el cliente ya entra a `/dashboard`

Pero el dashboard cliente no carga correctamente los datos reales del servicio.
Se observan síntomas como:

- “Sin Plan”
- `$0.00`
- estado incorrecto
- error en `getCurrentSubscription`
- consultas que aparentemente no reflejan el schema actual

Esto indica que el problema está en la lógica de lectura del frontend/server actions, no en la activación de la DB.

---

## Fuente de verdad obligatoria

Usar el archivo adjunto:

- `falconit_supabase_update.sql`

Basarse en ese archivo para:

- nombres de columnas
- foreign keys
- relaciones
- campos existentes en `clients`, `subscriptions`, `plans`, `payments`, `profiles`

No asumir el schema viejo.
No asumir columnas antiguas.
No inferir relaciones que no estén respaldadas por el schema actualizado.

---

## Objetivo

Corregir la carga de datos del dashboard cliente para que use correctamente la estructura real actual de Supabase.

---

## Parte 1 – Auditar `getCurrentSubscription`

Revisar:

- `lib/actions/dashboard.actions.ts`

Encontrar la función:

- `getCurrentSubscription`

Verificar si:

- consulta columnas que ya no coinciden con el schema actual
- usa joins mal definidos
- usa relaciones anidadas que no están funcionando
- usa `.single()` donde no corresponde
- espera un shape distinto del que devuelve la DB actual

---

## Parte 2 – Implementar resolución robusta del dashboard

La lógica correcta debe ser:

### Paso A

Obtener `auth.uid()`

### Paso B

Consultar `clients` usando:

- `owner_profile_id = auth.uid()`

### Paso C

Con el `client.id`, consultar `subscriptions`:

- filtrar por `client_id`
- preferir `status = active`
- ordenar por `created_at desc`
- traer:
  - `id`
  - `status`
  - `start_date`
  - `end_date`
  - `days_remaining`
  - `visit_used_count`
  - `visit_available_count`
  - `price_snapshot_usd`
  - `plan_id`

### Paso D

Consultar `plans` por `plan_id`:

- `id`
- `name`
- `price_usd`
- `monthly_visit_limit`
- `is_unlimited_visits`

### Paso E

Mapear al dashboard:

- nombre del negocio desde `clients.business_name`
- nombre del plan desde `plans.name`
- precio desde `subscriptions.price_snapshot_usd` con fallback a `plans.price_usd`
- estado del servicio desde `subscriptions.status`
- fechas desde `subscriptions.start_date` y `end_date`
- días restantes desde `subscriptions.days_remaining`
- visitas desde `visit_used_count` y `visit_available_count`

---

## Parte 3 – Evitar megaquery frágil

Si los joins anidados están causando el error, dividir la carga en varias consultas simples:

1. `clients`
2. `subscriptions`
3. `plans`

Priorizar robustez sobre elegancia.

---

## Parte 4 – Corregir manejo de errores

No dejar logs vacíos como:

```ts
console.error("Error fetching subscription:", {});
```
