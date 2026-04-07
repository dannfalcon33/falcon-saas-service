# Falcon IT – Fase 2 A del dashboard

## Objetivo

Construir la segunda fase funcional del sistema Falcon IT, enfocada en la operación diaria del servicio híbrido B2B.

La fase 1 ya cubrió:

- auth
- dashboard admin base
- login/logout
- estructura principal

Ahora construir módulos operativos reales para:

- clientes
- suscripciones
- visitas
- incidencias
- reportes

## Stack obligatorio

- Next.js App Router
- TypeScript
- TailwindCSS
- Supabase directo
- Supabase Auth
- Supabase Storage
- Server Actions o Route Handlers para escritura
- Server Components cuando convenga
- Zod para validación
- respetar RLS

---

## Prioridad de construcción

1. `/admin/clients`
2. `/admin/subscriptions`
3. `/admin/visits`
4. `/dashboard/visits`
5. `/dashboard/incidents`
6. `/admin/incidents`
7. `/admin/reports`
8. `/dashboard/reports`

---

## 1. Admin Clients `/admin/clients`

Construir módulo de gestión de clientes.

### Debe permitir:

- listar clientes
- buscar por empresa, nombre, email o teléfono
- ver estado del cliente
- ver suscripción actual
- ver fecha de vencimiento
- crear cliente manualmente
- editar cliente
- ver detalle de cliente

### Vista detalle del cliente:

- datos empresariales
- datos del contacto
- suscripción actual
- historial de pagos
- historial de visitas
- incidencias
- reportes técnicos

### UI:

- tabla clara y operativa
- filtros simples
- badges de estado
- acciones por fila

---

## 2. Admin Subscriptions `/admin/subscriptions`

Construir módulo de gestión de suscripciones.

### Debe permitir:

- listar suscripciones
- filtrar por estado
- filtrar por plan
- ver vencimientos próximos
- crear suscripción manual
- renovar suscripción
- cambiar plan
- suspender suscripción
- cancelar suscripción
- ver detalle

### Mostrar en tabla:

- cliente
- empresa
- plan
- estado
- fecha inicio
- fecha vencimiento
- días restantes
- visitas usadas
- visitas disponibles

### Reglas:

- usar la tabla `subscriptions` como centro del estado del servicio
- no duplicar lógica del plan en la UI
- mostrar snapshots del plan cuando aplique

---

## 3. Admin Visits `/admin/visits`

Construir módulo de visitas.

### Debe permitir:

- crear visita
- editar visita
- cancelar visita
- reasignar visita
- marcar como completada
- filtrar por cliente
- filtrar por fecha
- filtrar por estado
- filtrar por técnico

### Campos:

- client_id
- subscription_id
- assigned_to
- visit_type
- status
- scheduled_start
- scheduled_end
- title
- description
- internal_notes
- client_visible_notes

### UI:

- lista operativa
- tarjetas de próximas visitas
- agenda simple opcional, sin sobrediseñar

---

## 4. Client Visits `/dashboard/visits`

Construir vista del cliente para visitas.

### Mostrar:

- próximas visitas
- historial de visitas
- tipo de visita
- estado
- fecha y hora
- notas visibles al cliente

### Restricción:

- el cliente solo consulta
- no puede editar visitas
