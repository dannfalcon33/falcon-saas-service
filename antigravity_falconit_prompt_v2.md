# Falcon IT – Separar definitivamente visitas e incidencias con nueva tabla visit_requests

## Decisión cerrada

A partir de ahora:

- `incidents` = solo fallas, emergencias y problemas técnicos
- `visit_requests` = solicitudes de visita técnica/presencial del cliente
- `visits` = visitas reales ya programadas por admin

No reutilizar `incidents` para solicitudes de visita.
No mezclar ambos módulos en UX ni en backend.

## Contexto del schema actual

El sistema ya tiene:

- `incidents` para emergencias/fallas
- `visits` para visitas programadas
- `subscriptions` con:
  - `visit_limit_snapshot`
  - `is_unlimited_snapshot`
  - `visit_used_count`
  - `visit_available_count`

Ahora también existe:

- `visit_requests`

## Objetivo

Modificar el sistema para que:

1. el cliente solicite visitas desde `/dashboard/visits`
2. esas solicitudes se guarden en `visit_requests`
3. `/dashboard/incidents` muestre solo incidencias reales
4. el admin vea solicitudes de visita por separado
5. el admin convierta una solicitud en una visita real programada en `visits`

## Parte 1 – Cliente `/dashboard/visits`

### Debe mostrar:

- visitas usadas
- visitas disponibles
- próximas visitas
- historial de visitas
- solicitudes pendientes de visita
- botón `Solicitar visita`

### El botón `Solicitar visita`

Debe abrir un modal propio del módulo de visitas.

### Submit

Debe llamar una action propia, por ejemplo:

- `requestVisitAction`

Esa action debe usar la función SQL:

- `public.create_visit_request(...)`

### Reglas por plan

#### Si `is_unlimited_snapshot = true`

- permitir solicitud siempre

#### Si `is_unlimited_snapshot = false`

- permitir solicitud solo si `visit_available_count > 0`

No descontar visitas al solicitar.
Las visitas solo se descuentan cuando admin programa una visita real `included`.

## Parte 2 – Cliente `/dashboard/incidents`

Este módulo debe mostrar solo:

- incidencias reales
- fallas técnicas
- emergencias

Eliminar cualquier mezcla con visitas.

## Parte 3 – Cliente `/dashboard/visits`

Agregar bloque:

- `Solicitudes pendientes`

Consultar:

- `visit_requests`
  filtradas por el cliente autenticado
  ordenadas por `requested_at desc`

Mostrar:

- fecha
- prioridad
- estado
- descripción breve

## Parte 4 – Admin

Crear o extender un módulo para revisar `visit_requests`.

Puede ser:

- dentro de `/admin/visits`
  o
- un bloque secundario dentro del calendario técnico

Debe permitir:

- ver solicitudes pendientes
- aprobar
- rechazar
- programar visita

Cuando programe, usar:

- `public.schedule_visit_from_request(...)`

Eso debe:

- crear la fila real en `visits`
- marcar la solicitud como `scheduled`
- enlazar `linked_visit_id`

## Parte 5 – UI/UX

### Cliente

Debe sentir que:

- incidencias y visitas son cosas distintas
- las visitas se coordinan y programan
- puede ver su cobertura del plan claramente

### Admin

Debe poder:

- revisar solicitudes
- convertirlas en visitas reales
- mantener control total de agenda

## Resultado esperado

Después del cambio:

- incidencias y visitas quedan separadas definitivamente
- el cliente pide visitas desde `/dashboard/visits`
- el cliente reporta fallas desde `/dashboard/incidents`
- el admin programa visitas reales desde solicitudes
- el sistema respeta el límite del plan
