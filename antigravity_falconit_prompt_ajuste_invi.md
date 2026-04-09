# Falcon IT – Implementar flujo de validación de leads y conversión a cliente

## Contexto actual

El billing público de la landing actualmente inserta registros en la tabla `leads`.
Eso es correcto para el flujo comercial del producto.

El problema actual es:

1. el comprobante de pago no se está cargando correctamente
2. los leads no están visibles ni gestionables desde el dashboard admin
3. no existe todavía el flujo de conversión de lead a cliente activo

## Objetivo

Convertir `leads` en la bandeja de entrada comercial oficial del sistema.

El flujo correcto debe ser:

- prospecto llena billing
- se crea lead
- admin revisa lead
- admin valida pago
- admin convierte lead en client + subscription + payment
- luego asigna o prepara acceso del usuario

---

## Parte 1 – Arreglar billing público con upload real de comprobante

### Requerimiento

El billing público debe seguir insertando en `leads`, no en `clients` directamente.

### Debe guardar en lead:

- full_name
- company_name
- email
- phone
- plan_interest_id
- source
- status
- notes si aplica

### Además:

capturar método de pago y referencia/comprobante sin romper el modelo actual.

### Si la tabla `leads` no tiene estos campos, extenderla con:

- payment_method
- reference_code
- proof_file_path
- submitted_at

### Upload de comprobante

No usar upload directo desde visitante anónimo al bucket privado con políticas de usuario autenticado.

Implementar upload desde un Route Handler o Server Action seguro del lado servidor.

Bucket:

- `payment-proofs`

Ruta sugerida:
`payment-proofs/public-intake/{lead_id}/{timestamp-filename}`

Validar:

- pdf, png, jpg, jpeg
- tamaño máximo razonable

Guardar en `leads.proof_file_path`

---

## Parte 2 – Admin Leads `/admin/leads`

Construir un módulo completo para gestionar leads.

### Tabla/listado:

- nombre
- empresa
- email
- teléfono
- plan de interés
- método de pago
- estado
- fecha de envío
- comprobante
- acciones

### Filtros:

- new
- pending_review
- won
- lost

### Acciones por lead:

- ver detalle
- abrir comprobante
- agregar nota
- marcar como revisado
- rechazar
- convertir a cliente

---

## Parte 3 – Vista detalle de lead

En el detalle mostrar:

- datos del prospecto
- empresa
- email
- teléfono
- plan solicitado
- método de pago
- referencia
- comprobante
- notas
- fecha de envío

### Acciones:

- aprobar lead
- rechazar lead
- convertir a cliente

---

## Parte 4 – Conversión de lead a cliente

### Al convertir un lead aprobado:

crear:

1. `client`
2. `subscription`
3. `payment`

### Reglas exactas

#### client

Mapear:

- `business_name` = company_name
- `contact_name` = full_name
- `main_email` = email
- `main_phone` = phone
- `status` = `active` o `pending_payment` según la decisión de validación
- `owner_profile_id` = null temporalmente si todavía no se asignó usuario

#### subscription

Crear:

- `client_id`
- `plan_id` = `lead.plan_interest_id`
- `status` = `active` si ya validaste pago al convertir
- `price_snapshot_usd` = precio del plan
- `visit_limit_snapshot` = límite del plan
- `is_unlimited_snapshot` = según plan
- `visit_used_count` = 0
- `visit_available_count` = según plan
- `start_date` = current_date si activas de inmediato
- `end_date` = current_date + 30 días
- `renewal_due_date` = current_date + 30 días

#### payment

Crear:

- `client_id`
- `subscription_id`
- `amount_usd` = precio del plan
- `payment_method` = desde lead
- `reference_code` = desde lead
- `proof_file_path` = desde lead
- `status` = `verified` si ya fue validado por admin
- `paid_at` = submitted_at o now()
- `submitted_at` = submitted_at o now()
- `verified_at` = now()
- `verified_by` = admin actual

#### lead

Actualizar:

- `status` = `won`
- `converted_client_id` = nuevo client.id

No duplicar clientes si ya existe uno con el mismo email y business_name.
Manejar validación básica de duplicados.

---

## Parte 5 – Estado intermedio recomendado

Agregar o usar un estado más claro en leads:

- `pending_review`

De forma que el flujo sea:

- new
- pending_review
- won
- lost

Si el esquema actual no lo tiene, adaptarlo.

---

## Parte 6 – UI/UX

Mantener consistencia con el dashboard admin ya construido.
Diseño operativo, limpio y rápido.

No construir solo tablas.
Construir también:

- badges de estado
- detalle lateral o página de detalle
- botones de acción claros
- feedback de éxito/error

---

## Resultado esperado

Después de implementar esto debe ser posible:

1. llenar billing público
2. crear lead con comprobante
3. ver lead en `/admin/leads`
4. revisar lead
5. convertirlo en cliente real
6. crear suscripción real
7. crear pago real
8. dejarlo listo para asignación de acceso
