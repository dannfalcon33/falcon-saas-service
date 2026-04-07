# Falcon IT – Fase 2 B del dashboard

## Objetivo

---

## 5. Client Incidents `/dashboard/incidents`

Construir módulo de incidencias para cliente.

### Debe permitir:

- crear incidencia
- listar incidencias propias
- ver estado
- ver prioridad
- ver fecha
- ver notas de resolución si existen

### Formulario:

- title
- description
- priority

### Reglas:

- el cliente solo puede crear incidencias de su cuenta
- usar `channel = dashboard`

---

## 6. Admin Incidents `/admin/incidents`

Construir módulo de incidencias para admin.

### Debe permitir:

- listar todas las incidencias
- filtrar por estado
- filtrar por prioridad
- filtrar por cliente
- asignar técnico
- cambiar estado
- resolver incidencia
- cerrar incidencia
- agregar notas de resolución

### Mostrar:

- cliente
- empresa
- título
- prioridad
- estado
- fecha de creación
- asignado a

---

## 7. Admin Reports `/admin/reports`

Construir módulo de reportes técnicos.

### Debe permitir:

- crear reporte
- asociar reporte a visita o incidencia
- subir archivo al bucket `service-reports`
- listar reportes
- filtrar por cliente
- filtrar por fecha

### Formulario:

- title
- summary
- work_performed
- recommendations
- visit_id opcional
- incident_id opcional
- file upload opcional

### Reglas:

- usar Supabase Storage API
- bucket privado `service-reports`
- guardar `file_path`
- usar rutas:
  `service-reports/{client_id}/{report_id}/{filename}`

---

## 8. Client Reports `/dashboard/reports`

Construir vista de reportes para cliente.

### Mostrar:

- listado de reportes
- título
- resumen
- fecha
- recomendaciones
- opción de abrir detalle
- opción de descargar archivo si existe

---

## Reglas técnicas generales

- respetar RLS
- no usar Prisma
- no usar SQLite
- usar Supabase directo
- centralizar acceso a datos
- no duplicar lógica de negocio
- mantener consistencia visual con el dashboard admin ya construido
- usar componentes reutilizables para:
  - badges
  - tablas
  - cards
  - filtros
  - formularios modales o drawers

---

## Resultado esperado

Al terminar esta fase, Falcon IT debe tener una plataforma operativa usable para:

- gestionar clientes
- gestionar suscripciones
- agendar visitas
- mostrar visitas al cliente
- recibir incidencias
- gestionar incidencias
- generar reportes técnicos
- mostrar reportes al cliente
