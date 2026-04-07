
# Instrucciones definitivas para Antigravity – Falcon IT Dashboard (Next.js + Supabase)

## Contexto de producto
Falcon IT no es un SaaS puro de autoservicio. Es un portal de gestión para un servicio B2B híbrido de soporte IT presencial por suscripción mensual.

El sistema debe gestionar:
- clientes empresariales
- planes
- suscripciones mensuales
- validación manual de pagos
- agenda de visitas
- reporte de fallos o emergencias
- reportes técnicos
- dashboard para cliente
- dashboard para administrador

## Stack obligatorio
- Next.js App Router
- Supabase directo, sin Prisma
- Supabase Auth para login
- Supabase Postgres para la base de datos
- Supabase Storage para comprobantes y archivos
- Server Actions o Route Handlers para mutaciones
- TypeScript
- TailwindCSS
- Zod para validación
- RLS activa en Supabase

## Base de datos
Usar exactamente el schema SQL entregado para Supabase.

Tablas del sistema:
- profiles
- plans
- leads
- clients
- subscriptions
- payments
- visits
- incidents
- service_reports

## Reglas del negocio
1. El cliente compra un plan, pero lo que realmente tiene es una suscripción.
2. La suscripción puede estar en:
   - pending_payment
   - active
   - expired
   - suspended
   - cancelled
3. El cliente sube el comprobante de pago.
4. El administrador valida manualmente el pago.
5. Solo después de validar el pago, la suscripción pasa a activa.
6. El dashboard del cliente debe leer la suscripción activa.
7. Las visitas nunca se guardan como columnas fijas; cada visita es una fila.
8. El cliente puede reportar fallos o emergencias desde el dashboard.
9. Después de una visita o incidente, se puede generar un reporte técnico.
10. El sistema debe mostrar días restantes, visitas usadas y visitas disponibles.

## Roles
### admin
Puede ver y gestionar todo:
- clientes
- suscripciones
- pagos
- visitas
- incidencias
- reportes

### client
Solo puede ver y gestionar sus propios datos:
- su perfil
- su empresa
- su suscripción
- sus pagos
- sus visitas
- sus incidencias
- sus reportes

### technician
Puede ver:
- visitas asignadas
- incidencias asignadas
- reportes técnicos creados por él

## Estructura funcional del dashboard

### Dashboard cliente
Debe incluir:
- resumen del plan activo
- nombre del plan
- precio
- fecha de inicio
- fecha de vencimiento
- días restantes
- visitas usadas
- visitas disponibles
- próximas visitas
- historial de visitas
- módulo de pagos y comprobantes
- formulario para reportar fallo o emergencia
- historial de incidencias
- historial de reportes técnicos

### Dashboard admin
Debe incluir:
- KPIs generales
- clientes activos
- suscripciones activas
- pagos pendientes de validación
- renovaciones próximas
- calendario general de visitas
- incidencias abiertas
- creación y edición de visitas
- validación de pagos
- activación manual de suscripción
- creación de reportes técnicos

## Flujo del producto
1. Usuario solicita plan desde landing o contacto directo.
2. Admin crea lead o cliente según el caso.
3. Se crea profile para acceso si aplica.
4. Se crea client.
5. Se crea subscription en estado pending_payment.
6. Cliente sube comprobante.
7. Admin valida pago.
8. Sistema activa la suscripción.
9. Cliente entra a su dashboard.
10. Admin agenda visitas.
11. Cliente reporta incidentes si es necesario.
12. Admin o técnico atienden y crean reportes.

## Pantallas requeridas

### Públicas
- landing page de planes ya existe
- login ya existe

### Protegidas
#### Cliente
- /dashboard
- /dashboard/payments
- /dashboard/visits
- /dashboard/incidents
- /dashboard/reports
- /dashboard/profile

#### Admin
- /admin
- /admin/clients
- /admin/subscriptions
- /admin/payments
- /admin/visits
- /admin/incidents
- /admin/reports
- /admin/leads

## Acciones obligatorias
### Cliente
- subir comprobante de pago
- crear incidencia
- ver visitas
- ver reportes

### Admin
- crear cliente
- crear suscripción
- validar pago
- activar suscripción
- agendar visita
- editar visita
- cerrar incidencia
- crear reporte técnico

## Buckets de Storage
Crear estos buckets:
- payment-proofs
- service-reports

## Consideraciones de implementación
- Usar Server Components cuando convenga para lectura
- Usar Server Actions o Route Handlers para escritura
- Separar claramente capa de datos y UI
- No duplicar lógica del negocio en muchos componentes
- Mantener los enums alineados con la base de datos
- Respetar RLS en cada consulta
- No usar Prisma
- No usar SQLite
- No modelar visitas como columnas fijas

## Resultado esperado
Entregar una base funcional y escalable del producto, lista para:
- conectar login real
- activar clientes
- validar pagos
- gestionar visitas
- permitir incidencias
- mostrar reportes técnicos
- salir a vender el servicio con una plataforma operativa usable
