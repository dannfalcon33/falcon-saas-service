# Falcon IT – Corregir bug frontend: cliente activo sigue entrando a /dashboard/pending

## Contexto

La base de datos ya está correcta.

Para el usuario cliente probado ya existe correctamente:

- `profiles.role = client`
- `clients.status = active`
- `clients.access_enabled_at` poblado
- `subscriptions.status = active`
- `start_date`, `end_date` y `days_remaining` correctos

Por lo tanto, el problema ya NO está en la DB ni en el flujo de activación.
El problema está en la lógica frontend o server-side rendering que resuelve si el cliente entra a:

- `/dashboard`
  o
- `/dashboard/pending`

Actualmente el usuario sigue viendo `/dashboard/pending` aunque ya está activo.

---

## Objetivo

Corregir la lógica de acceso del dashboard cliente para que un usuario con suscripción activa entre al dashboard real y no quede atrapado en pending.

---

## Regla de acceso correcta

El cliente debe entrar a `/dashboard` si se cumple:

- existe sesión válida
- existe `profile` con `role = client`
- existe `client` vinculado
- existe `subscription_status = active`

Debe ir a `/dashboard/pending` solo si:

- no existe `client`
  o
- no existe suscripción
  o
- la suscripción está en `pending_payment`
  o
- el acceso todavía no fue habilitado

---

## Fuente de verdad obligatoria

Usar como fuente de verdad una sola consulta centralizada.
No duplicar esta lógica en varios componentes.

Si ya existe la view:

- `public.v_client_access_status`

usar esa view para resolver el acceso.

No construir la decisión con varias consultas sueltas repartidas por componentes.

---

## Parte 1 – Auditar dónde se decide el acceso

Revisar todo el proyecto y encontrar exactamente dónde se hace la redirección del cliente:

- middleware
- layout de `/dashboard`
- page de `/dashboard`
- server component de carga inicial
- hooks de auth/client
- providers de sesión

Identificar cuál de esos está mandando al usuario a `/dashboard/pending`.

---

## Parte 2 – Corregir la lógica de resolución

Crear una sola función de servidor, por ejemplo:

- `getClientAccessState()`

Esta función debe:

1. obtener `auth.uid()`
2. consultar `public.v_client_access_status`
3. devolver un estado claro, por ejemplo:

```ts
type ClientAccessState =
  | { status: "active"; clientId: string; subscriptionId: string }
  | { status: "pending" }
  | { status: "restricted"; reason: "suspended" | "cancelled" | "expired" }
  | { status: "no-profile" };
```
