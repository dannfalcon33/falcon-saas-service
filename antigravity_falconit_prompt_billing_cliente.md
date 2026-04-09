# Falcon IT – Implementar signup con password + dashboard bloqueado hasta validación

## Objetivo

Reestructurar el flujo de acceso del sistema Falcon IT para eliminar la dependencia operativa de Magic Link e invitaciones por correo en el onboarding del cliente.

El nuevo flujo debe permitir que el cliente:

1. se registre desde el billing público con email y contraseña
2. pueda iniciar sesión de inmediato con email/password
3. vea un dashboard bloqueado o en espera mientras el admin no valide el pago
4. vea el dashboard operativo real solo cuando el admin active su suscripción

El admin debe conservar el control total de habilitación del servicio.

---

## Regla principal de arquitectura

Separar estrictamente:

### 1. Auth

Controla credenciales y sesión

- Supabase Auth
- email + password
- sign up
- sign in
- reset password

### 2. Activación comercial

Controla acceso funcional al producto

- profiles
- leads
- clients
- subscriptions
- payments

El cliente puede estar autenticado pero no activado.

NO crear una tabla propia para guardar contraseñas.
NO reemplazar Supabase Auth.
NO usar Magic Link como flujo principal.
NO usar inviteUserByEmail como flujo principal.

---

## Base de datos

Usar el schema actual de Supabase ya existente y asumir que se cargó una migración que agrega:

### En `leads`

- payment_method
- reference_code
- proof_file_path
- submitted_at
- auth_user_id

### En `clients`

- access_enabled_by

### También existe:

- view `public.v_client_access_status`
- function `public.convert_lead_to_client(p_lead_id, p_admin_profile_id, p_activate_now)`

---

## Stack obligatorio

- Next.js App Router
- TypeScript
- TailwindCSS
- Supabase directo
- Supabase Auth
- Supabase Storage
- Zod
- Server Actions o Route Handlers para escritura
- Server Components para lectura cuando convenga
- nunca exponer service role al frontend

---

## Parte 1 – Billing público con signup real

### Ruta existente

Mantener o adaptar la página de billing público.

### El formulario debe incluir:

- full_name
- company_name
- email
- phone
- plan_interest_id
- payment_method
- reference_code
- proof file
- password

### El flujo del submit debe ejecutarse en servidor y hacer:

1. Validar datos con Zod
2. Subir comprobante al bucket `payment-proofs`
3. Crear usuario auth con email/password
4. Crear o upsert en `public.profiles` con:
   - id = auth user id
   - email
   - full_name
   - phone
   - role = `client`
   - is_active = true
5. Crear registro en `public.leads` con:
   - full_name
   - company_name
   - email
   - phone
   - plan_interest_id
   - payment_method
   - reference_code
   - proof_file_path
   - submitted_at = now()
   - auth_user_id = auth user id
   - source
   - status = `new`

### Reglas:

- no crear directamente `client`
- no crear directamente `subscription`
- no activar dashboard en este paso
- manejar error si el email ya existe
- evitar crear duplicados
- si el auth user ya existe, validar si corresponde iniciar sesión o mostrar error claro

---

## Parte 2 – Login por email/password

### Login

El login debe usar:

- `signInWithPassword`

### No usar:

- Magic Link
- OTP por email como flujo principal

### Después del login:

consultar `public.profiles` por `auth.uid()`

#### Si role = `admin`

redirigir a `/admin`

#### Si role = `client`

redirigir a un evaluador de acceso:

- `/dashboard`
- o `/dashboard/pending`
  según estado comercial

---

## Parte 3 – Resolver acceso comercial del cliente

### Crear lógica centralizada para acceso del cliente

Implementar una función de servidor, helper o capa de datos que consulte:

- `public.v_client_access_status`
  filtrando por `auth.uid()`

### Reglas de resolución

#### Caso A

El usuario tiene profile client pero no tiene `client` vinculado
-> redirigir a `/dashboard/pending`

#### Caso B

Tiene `client`, pero no tiene suscripción activa
-> redirigir a `/dashboard/pending`

#### Caso C

Tiene `subscription_status = pending_payment`
-> redirigir a `/dashboard/pending`

#### Caso D

Tiene `subscription_status = active`
-> permitir `/dashboard`

#### Caso E

Tiene `subscription_status = suspended`, `cancelled` o `expired`
-> mostrar pantalla de servicio restringido

---

## Parte 4 – Crear pantalla de espera del cliente

### Ruta

- `/dashboard/pending`

### Mostrar:

- solicitud recibida
- pago en revisión
- validación pendiente por admin
- mensaje claro de que el acceso operativo será habilitado al aprobar el pago

### Opcional:

mostrar resumen ligero:

- empresa
- plan solicitado
- fecha de envío
- estado del proceso

### Esta pantalla debe ser moderna, limpia y con sensación de sistema SaaS B2B serio.

---

## Parte 5 – Admin Leads

### Ruta

- `/admin/leads`

### Construir módulo completo para leads

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

### Acciones:

- ver detalle
- abrir comprobante
- agregar nota
- marcar como revisado
- rechazar
- convertir a cliente
- convertir y activar

### Conversión

Usar la función SQL:

- `public.convert_lead_to_client(p_lead_id, p_admin_profile_id, p_activate_now)`

#### Dos flujos:

1. convertir sin activar
2. convertir y activar de inmediato

---

## Parte 6 – Admin activa el dashboard del cliente

Cuando el admin convierta y active:

Debe quedar resuelto:

- client creado
- client.owner_profile_id enlazado al profile del usuario
- subscription creada
- payment creado
- suscripción en active
- acceso operativo habilitado

No usar correo.
No usar invitación.
La activación depende solo del estado de negocio.

---

## Parte 7 – Dashboard cliente

### Si activo

El cliente debe ver:

- resumen del plan
- estado de suscripción
- visitas
- pagos
- incidencias
- reportes
  según módulos ya existentes o en construcción

### Si no activo

Nunca mostrar dashboard vacío o roto
Siempre redirigir a `/dashboard/pending`

---

## Parte 8 – Middleware y protección

### `/admin`

- requiere sesión
- requiere `profiles.role = admin`

### `/dashboard`

- requiere sesión
- requiere `profiles.role = client`
- requiere resolver estado comercial real

### Manejo robusto:

- si no hay sesión -> login
- si no hay profile -> error controlado
- si el role no coincide -> redirigir correctamente

---

## Parte 9 – UX/UI esperada

### Cliente

Interfaz seria, moderna y clara.
El estado pendiente debe transmitir control y profesionalismo.

### Admin

Interfaz operativa.
Nada decorativo.
Enfocada en revisar leads y validar pagos rápido.

### Estilo

- moderno tipo SaaS B2B
- limpio
- badges de estado
- tablas operativas
- feedback de éxito/error
- responsive

---

## Parte 10 – No romper módulos existentes

### Mantener compatibilidad con:

- dashboard admin actual
- auth actual del admin
- estructura general del proyecto
- tablas ya existentes
- RLS activa

No rehacer todo el proyecto.
Adaptar el flujo sobre la base ya construida.

---

## Resultado esperado

Al terminar:

- el billing crea lead + auth user + profile client
- el cliente puede iniciar sesión con email/password
- el cliente entra a `/dashboard/pending` mientras el pago no esté validado
- el admin revisa leads desde `/admin/leads`
- el admin puede convertir y activar al cliente
- el cliente solo ve dashboard operativo cuando la suscripción esté activa
- el onboarding ya no depende de SMTP para funcionar
