# Falcon IT – CORRECCIÓN ESTRICTA: las visitas NO deben pasar por incidencias en la UX

## Problema actual

El sistema sigue resolviendo mal la solicitud de visitas.

### Comportamiento incorrecto actual

- el cliente entra a `/dashboard/visits`
- hace clic en `Solicitar visita`
- el sistema abre o reutiliza el flujo visual de `/dashboard/incidents`
- el formulario de solicitud de visita aparece dentro del módulo de incidencias
- las solicitudes terminan viéndose en el historial de incidencias

Esto es incorrecto.

---

## Regla obligatoria de producto

### Visitas

Se solicitan y gestionan desde:

- `/dashboard/visits`

### Incidencias

Se reportan y consultan desde:

- `/dashboard/incidents`

NO mezclar ambas UX.
NO abrir formulario de visita dentro de incidencias.
NO mostrar solicitudes de visita en el historial de incidencias del cliente.

---

## Objetivo

Corregir la implementación para que:

1. el botón `Solicitar visita` de `/dashboard/visits` abra un formulario PROPIO dentro del módulo de visitas
2. la solicitud se cree desde una action propia de visitas
3. el cliente permanezca dentro de `/dashboard/visits`
4. el historial de incidencias muestre SOLO incidencias reales
5. la solicitud de visita NO aparezca visualmente como ticket de incidencia

---

## Parte 1 – Corregir navegación y UI

### Revisar `/dashboard/visits`

El botón:

- `Solicitar visita`

NO debe:

- navegar a `/dashboard/incidents`
- abrir modal compartido del módulo de incidencias
- activar query params de incidencias
- reutilizar el componente visual de tickets

### Debe:

- abrir un modal o drawer EXCLUSIVO del módulo `/dashboard/visits`

Ese modal debe vivir dentro de la página de visitas.

---

## Parte 2 – Crear componente independiente

Crear un componente separado, por ejemplo:

- `VisitRequestModal`
  o
- `RequestVisitDrawer`

Este componente debe ser independiente del componente de incidencias.

### Campos sugeridos

- prioridad
- motivo de la visita
- descripción detallada

### Copy correcto

Usar lenguaje de visita técnica, no de ticket o falla:

- “Solicitar visita técnica”
- “Motivo de la visita”
- “Describe el mantenimiento o requerimiento presencial”

NO reutilizar textos de incidencias.

---

## Parte 3 – Acción de submit independiente

Crear una acción propia, por ejemplo:

- `requestVisitAction`

NO reutilizar:

- `createIncidentAction`
- `submitIncidentAction`
- cualquier handler del módulo de incidencias en frontend

### La acción de visitas debe:

1. validar sesión
2. resolver cliente autenticado
3. resolver suscripción activa
4. validar límite del plan
5. registrar la solicitud con el mecanismo actual disponible
6. devolver éxito/error
7. refrescar solo el módulo de visitas

---

## Parte 4 – Separación visual obligatoria

### `/dashboard/incidents`

Debe mostrar solo:

- fallas técnicas
- incidencias reales
- emergencias
- tickets de soporte

### `/dashboard/visits`

Debe mostrar solo:

- próximas visitas programadas
- historial de visitas reales
- estado de cobertura
- solicitud de visita

### Prohibido

No mostrar en incidencias:

- “Solicitud de visita”
- “Visita técnica”
- “Requerimiento presencial”

Eso no debe aparecer en el historial de incidencias del cliente.

---

## Parte 5 – Persistencia interna sin contaminar la UX

Si por limitación del MVP la solicitud de visita se persiste temporalmente usando el backend actual, esa implementación debe quedar encapsulada.

### Regla

Aunque internamente se reutilice infraestructura existente:

- la UX debe ser 100% del módulo de visitas
- el historial del cliente en incidencias no debe listar solicitudes de visita
- el cliente no debe ver ni sentir que pedir visita es crear una incidencia

Si hace falta, filtrar explícitamente en `/dashboard/incidents` para excluir solicitudes de visita.

---

## Parte 6 – Filtro obligatorio en incidencias

Auditar la consulta que alimenta `/dashboard/incidents`.

### Debe excluir cualquier registro que represente:

- solicitud de visita
- visita técnica
- mantenimiento presencial

Si actualmente existe una convención temporal en backend, por ejemplo:

- `title = "Solicitud de visita técnica"`

entonces filtrar esos registros fuera de la vista del cliente en incidencias.

---

## Parte 7 – Lógica por plan

Resolver la suscripción activa y usar:

- `visit_used_count`
- `visit_available_count`
- `is_unlimited_snapshot`

### Reglas

#### Planes limitados

- permitir solicitud solo si `visit_available_count > 0`

#### Plan corporativo / ilimitado

- permitir solicitud siempre si `is_unlimited_snapshot = true`

### Importante

No descontar visitas al solicitar.
Las visitas se descuentan solo cuando el admin crea la visita real en `public.visits` con tipo `included`.

---

## Parte 8 – Resultado esperado

Después del fix:

- el cliente entra a `/dashboard/visits`
- hace clic en `Solicitar visita`
- se abre un modal propio dentro de visitas
- completa la solicitud sin salir del módulo
- recibe confirmación dentro de visitas
- `/dashboard/incidents` sigue mostrando solo incidencias reales
- las solicitudes de visita dejan de aparecer como incidencias
- la UX queda correctamente separada
