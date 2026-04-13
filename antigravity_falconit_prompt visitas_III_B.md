## Decisión funcional final

No usar prefijo técnico como `[VISIT_REQUEST]`.

Usar esta convención temporal de negocio:

- `title = "Solicitud de visita técnica"`

### Reglas

- solo el módulo `/dashboard/visits` puede crear registros con ese título
- el módulo `/dashboard/incidents` nunca debe crear ese título
- `/dashboard/incidents` debe excluir explícitamente registros con:
  - `title = "Solicitud de visita técnica"`

### UX

- el cliente solicita la visita solo desde `/dashboard/visits`
- la solicitud no debe verse en incidencias
- en `/dashboard/visits` agregar un bloque de:
  - `Solicitudes pendientes`

### Importante

No mostrar marcadores técnicos al usuario.
No usar strings tipo `[VISIT_REQUEST]` visibles en UI ni en datos mostrados.
