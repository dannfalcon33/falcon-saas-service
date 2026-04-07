# Falcon IT – Fase 1 UI definitiva

## Objetivo

Construir la primera capa funcional del dashboard del producto Falcon IT, centrada en activación de clientes, pagos y visualización del estado del servicio.

## Stack

- Next.js App Router
- TypeScript
- TailwindCSS
- Supabase directo
- Supabase Auth
- Supabase Storage
- Server Components para lectura cuando convenga
- Server Actions o Route Handlers para escritura
- Zod para validación

## Regla principal

No construir todo el sistema de golpe.
Construir primero el núcleo operativo del producto:

1. Dashboard cliente
2. Módulo de pagos del cliente
3. Dashboard admin
4. Módulo admin de validación de pagos
5. Activación de suscripción tras validación

---

## 1. Dashboard cliente `/dashboard`

Crear una pantalla limpia y moderna tipo SaaS operativo, con tarjetas resumen.

### Mostrar:

- saludo con nombre del usuario
- estado actual de la suscripción
- nombre del plan
- precio del plan
- fecha de inicio
- fecha de vencimiento
- días restantes
- visitas usadas
- visitas disponibles
- próxima visita si existe
- estado del último pago

### Reglas:

- si no hay suscripción activa pero existe una `pending_payment`, mostrar un bloque de alerta indicando que el plan está esperando validación de pago
- si no hay comprobante subido, mostrar CTA para ir a `/dashboard/payments`
- si el pago fue rechazado, mostrar nota del administrador y CTA para reenviar comprobante

---

## 2. Payments cliente `/dashboard/payments`

Construir módulo completo de pagos.

### Funcionalidad:

- listar pagos del cliente ordenados por fecha
- mostrar:
  - monto
  - método de pago
  - referencia
  - estado
  - fecha de envío
  - fecha de verificación
  - notas del admin
- formulario para subir comprobante
- subida a bucket privado `payment-proofs`
- guardar `proof_file_path` en la tabla `payments`
- usar rutas:
  `payment-proofs/{user_id}/{subscription_id}/{filename}`

### Reglas:

- permitir pdf, jpg, jpeg, png
- validar tamaño antes de subir
- usar Supabase Storage API
- no usar URLs públicas
- usar signed URLs si se necesita vista previa segura

---

## 3. Dashboard admin `/admin`

Crear panel general con KPIs y accesos rápidos.

### Mostrar:

- total de clientes activos
- total de suscripciones activas
- pagos pendientes de validación
- suscripciones por vencer
- incidencias abiertas
- próximas visitas

### También incluir:

- accesos rápidos a:
  - clientes
  - suscripciones
  - pagos
  - visitas
  - incidencias
  - reportes

---

## 4. Payments admin `/admin/payments`

Este es el módulo más importante de la fase 1.

### Funcionalidad:

- listar todos los pagos
- filtros por:
  - pending
  - submitted
  - verified
  - rejected
- tabla con:
  - cliente
  - empresa
  - plan
  - monto
  - método
  - referencia
  - fecha de envío
  - estado
- vista detalle de pago
- abrir comprobante de pago de forma segura
- aprobar pago
- rechazar pago
- agregar nota de admin

### Reglas:

- al aprobar pago:
  - actualizar `payments.status = verified`
  - registrar `verified_at`
  - registrar `verified_by`
  - activar la suscripción relacionada
  - actualizar `subscriptions.status = active`
  - actualizar fechas si aplica
- al rechazar:
  - actualizar status a `rejected`
  - guardar `admin_notes`

---

## 5. UX/UI esperado

### Cliente

Interfaz moderna, profesional y clara.
Debe sentirse como un portal de servicio administrado.
Priorizar lectura rápida de estado.

### Admin

Interfaz sobria, operativa y eficiente.
Pensada para gestionar rápido pagos y clientes.

### Estilo visual

- diseño moderno tipo SaaS B2B
- cards limpias
- badges de estado
- tablas claras
- navegación lateral
- responsive
- sin exceso de efectos

---

## 6. Estructura de rutas a construir en esta fase

### Cliente

- `/dashboard`
- `/dashboard/payments`

### Admin

- `/admin`
- `/admin/payments`

---

## 7. Reglas técnicas

- respetar RLS
- no usar Prisma
- no usar SQLite
- usar Supabase directo
- no duplicar lógica entre cliente y admin
- centralizar acceso a datos
- mantener tipos alineados con la DB
- crear componentes reutilizables para status badges, cards y tablas

---

## 8. Resultado esperado

Entregar una primera versión funcional del sistema donde:

- el cliente pueda entrar y ver su estado
- el cliente pueda subir comprobantes
- el admin pueda validar pagos
- la suscripción pueda activarse correctamente
- la plataforma ya tenga valor operativo real
