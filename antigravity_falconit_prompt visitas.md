## Ajuste funcional para visitas por plan

### Regla general

Las visitas NO las agenda el cliente.
El cliente solo solicita visita.
El admin programa la visita real.

### Planes limitados

#### Básico

- 2 visitas incluidas al mes

#### Empresarial

- 4 visitas incluidas al mes

Para estos planes:

- permitir solicitud solo si `visit_available_count > 0`
- si llega a 0, bloquear solicitud y mostrar mensaje de límite alcanzado

### Plan Corporativo

- mostrar 4 visitas base programadas como referencia operativa
- PERO no bloquear solicitudes adicionales
- si `is_unlimited_snapshot = true`, el cliente siempre puede solicitar visita
- la coordinación queda sujeta a administración y uso razonable

### UX del dashboard

#### Para Básico/Empresarial

Mostrar:

- `0 / 2 visitas usadas`
- `1 / 4 visitas usadas`
- `visitas disponibles`

#### Para Corporativo

Mostrar algo como:

- `Cobertura presencial flexible`
- `Base operativa mensual: 4 visitas`
- `Solicitudes adicionales según necesidad`

### Importante

No descontar visitas al solicitar.
Las visitas solo se descuentan cuando el admin crea la visita real en `public.visits` con tipo `included`.
