# Falcon IT – Portal cliente completo + flujo controlado de visitas (MVP)

## Contexto

El sistema ya tiene:

- autenticación funcionando
- activación por admin funcionando
- dashboard cliente mostrando plan y pagos

El schema actual ya soporta:

- clients
- subscriptions
- visits
- incidents
- service_reports

NO crear nuevas tablas.
NO modificar el schema.
Trabajar sobre lo existente.

---

## Cambio clave de producto (CRÍTICO)

El cliente NO agenda visitas directamente.

El cliente SOLO puede:

- ver visitas programadas
- ver historial de visitas
- solicitar soporte (no agendar)

El admin es quien:

- agenda visitas
- asigna técnico
- controla calendario

Esto evita:

- caos operativo
- sobrecupo
- conflictos de agenda

---

## Flujo correcto de visitas (MVP)

### Cliente

Puede:

- ver próximas visitas
- ver historial
- ver detalles
- SOLICITAR visita (no elegir fecha)

### Admin

Hace:

- recibe solicitud
- agenda visita real
- crea registro en `visits`
- define:
  - fecha/hora
  - técnico
  - tipo
  - notas

---

## Implementación sin cambiar DB

### Opción 1 (RECOMENDADA – simple y rápida)

La solicitud de visita se maneja como:

➡️ UNA INCIDENCIA

con:

- `title`: "Solicitud de visita"
- `priority`: según selección
- `description`: motivo

Esto reutiliza:

- tabla `incidents`
- lógica existente
- UI existente

NO necesitas nueva tabla.

---

## Parte 1 – Dashboard principal

Agregar:

- visitas usadas
- visitas disponibles
- próxima visita (si existe)
- CTA: "Solicitar soporte"

NO poner "Agendar visita"

---

## Parte 2 – `/dashboard/visits`

### Mostrar:

- próximas visitas
- historial
- estado
- fecha/hora
- tipo
- notas visibles

### Agregar botón:

➡️ "Solicitar visita"

### Ese botón debe:

redirigir a:

- `/dashboard/incidents`
  o abrir modal

---

## Parte 3 – `/dashboard/incidents` (CLAVE)

Este módulo ahora cumple doble función:

1. incidencias técnicas
2. solicitudes de visita

### Formulario debe permitir:

- título
- descripción
- prioridad

### Agregar opción:

tipo de solicitud:

- "Incidencia técnica"
- "Solicitud de visita"

### Lógica:

Si es "Solicitud de visita":

- title: "Solicitud de visita"
- description: motivo del cliente
- status: open
- channel: dashboard

---

## Parte 4 – Admin interpreta solicitudes

NO tocar aún backend admin.

Pero dejar claro:

Cuando admin vea:

- incident.title = "Solicitud de visita"

Debe:

- crear visita en `visits`
- enlazar con:
  - client_id
  - subscription_id
  - incident_id (si quieres trazabilidad)

---

## Parte 5 – `/dashboard/visits` lectura real

Corregir:

Actualmente aparece:

- "No hay información de cliente asociada"

Eso es un bug.

### Solución obligatoria:

Reutilizar una sola función:

`getAuthenticatedClientContext()`

Debe:

1. obtener auth.uid()
2. buscar client por owner_profile_id
3. devolver client_id

Y usarla en TODAS:

- visits
- incidents
- reports
- payments

NO duplicar lógica.

---

## Parte 6 – Contador de visitas

Usar datos de `subscriptions`:

- visit_used_count
- visit_available_count
- is_unlimited_snapshot

### Mostrar:

- "2 / 4 visitas usadas"
- o "Ilimitado"

---

## Parte 7 – Regla importante

NO bloquear solicitud de visita por límite.

El cliente SIEMPRE puede solicitar.

El límite se controla en admin:

- si está fuera del plan → se factura extra

---

## Parte 8 – UX correcta

### Cliente ve:

- control
- claridad
- servicio activo

### NO ve:

- calendario libre
- slots
- disponibilidad técnica

---

## Parte 9 – Resultado esperado

Después del cambio:

- cliente NO agenda visitas
- cliente solicita soporte
- admin controla agenda
- visitas se crean desde admin
- dashboard muestra visitas reales
- incidencias y solicitudes conviven en un solo flujo

---

## Resultado de negocio

Esto convierte el sistema en:

➡️ Servicio gestionado real  
no en una herramienta self-service

Y eso es exactamente el posicionamiento de Falcon IT.
