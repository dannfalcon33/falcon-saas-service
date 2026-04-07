
Falcon IT – estructura definitiva de la base de datos en Supabase

Modelo del producto:
Portal de gestión de servicio IT híbrido B2B.

El sistema no es un SaaS puro de autoservicio.
Es un dashboard para administrar la relación operativa entre Falcon IT y sus clientes empresariales.

Tablas núcleo:
1. profiles
2. plans
3. leads
4. clients
5. subscriptions
6. payments
7. visits
8. incidents
9. service_reports

Relación lógica:
- auth.users -> profiles
- profiles -> clients (owner_profile_id)
- clients -> subscriptions
- plans -> subscriptions
- subscriptions -> payments
- subscriptions -> visits
- subscriptions -> incidents
- visits/incidents -> service_reports

Decisión central:
La entidad principal del negocio es subscriptions, no clients.
Porque el servicio se vende por ciclos mensuales con estados, pagos, visitas, vencimientos y renovaciones.

Qué resuelve este modelo:
- activación manual por validación de pago
- control de plan activo
- historial de suscripciones
- agenda de visitas
- incidencias reportadas por cliente
- reportes técnicos
- separación clara entre operación comercial y operación técnica

MVP funcional:
- cliente ve su suscripción activa
- cliente sube comprobante
- admin valida pago
- admin agenda visitas
- cliente reporta incidencias
- técnico/admin crean reportes
