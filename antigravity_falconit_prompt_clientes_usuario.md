# Falcon IT – Habilitar acceso automático al cliente tras validación

## Objetivo

Cuando el admin valide un lead y lo convierta en cliente activo, el sistema debe crear el acceso del cliente automáticamente y enviarle un correo para que defina su contraseña e ingrese al dashboard.

## Regla de negocio

El cliente NO obtiene acceso al dashboard al enviar el billing.
El acceso se habilita solo después de:

1. validación del pago
2. conversión del lead a cliente
3. activación de la suscripción

## Stack

- Next.js App Router
- Supabase directo
- Supabase Auth Admin API
- Server Actions o Route Handlers
- Nunca exponer service_role en frontend

## Flujo requerido

### Paso 1

Al validar el lead/pago, verificar si ya existe un usuario en Supabase Auth con el email del cliente.

### Paso 2

Si no existe:

- usar `supabase.auth.admin.inviteUserByEmail(email, { redirectTo })`
- ejecutar esto solo en servidor con service_role
- redirectTo debe apuntar a la ruta del proyecto donde el usuario completa el acceso

### Paso 3

Crear o actualizar `profiles`:

- id = auth user id
- email = client.main_email
- full_name = client.contact_name
- phone = client.main_phone
- role = 'client'
- is_active = true

### Paso 4

Actualizar `clients.owner_profile_id` con el auth user id.

### Paso 5

Guardar trazabilidad opcional:

- access_enabled_at
- access_enabled_by
- invitation_sent_at

### Paso 6

Si el usuario ya existe:

- no duplicarlo
- enlazarlo a `clients.owner_profile_id` si aún no está vinculado
- permitir reenviar invitación

## UI admin

Agregar acciones:

- Habilitar acceso
- Reenviar invitación
- Ver estado de acceso

## Auth / Redirect

- configurar Redirect URLs permitidas en Supabase
- crear la ruta de callback o welcome flow para que el cliente termine su acceso
- revisar templates de email si hace falta usar `{{ .RedirectTo }}`

## Resultado esperado

- admin valida pago
- cliente se convierte y activa
- se envía correo automático
- cliente crea su contraseña
- cliente entra al dashboard
