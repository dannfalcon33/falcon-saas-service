# Falcon IT – Corregir recovery de password admin y migrar a login por email/password sin Magic Link

## Objetivo

Corregir el flujo de autenticación del sistema Falcon IT para que:

1. el admin pueda recuperar su contraseña correctamente
2. el reset de password no redirija a localhost incorrectamente
3. el login funcione con email/password
4. los clientes en el futuro creen su contraseña desde billing
5. el sistema no dependa de Magic Link para acceso normal
6. la habilitación del dashboard dependa del estado comercial, no del correo de invitación

---

## Problema actual

- El usuario admin existe en Supabase Auth
- El flujo de reset lo redirige a `localhost:3000`
- No está funcionando correctamente la recuperación de contraseña
- El dashboard admin no es accesible por problema de credenciales o recovery incompleto

---

## Decisión técnica obligatoria

NO crear una tabla propia para guardar contraseñas.

Las contraseñas deben seguir gestionadas por Supabase Auth.

El sistema debe usar:

- `signInWithPassword`
- `signUp` con email/password para clientes
- `resetPasswordForEmail`
- `updateUser({ password })`

NO usar como flujo principal:

- Magic Link
- inviteUserByEmail

---

## Parte 1 – Corregir recovery del admin

### Revisar configuración Auth

Asegurar que el sistema soporte:

- `NEXT_PUBLIC_APP_URL` para desarrollo y producción
- recovery con `redirectTo`

### Implementar o corregir:

#### Forgot password

Usar:

```ts
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/update-password`,
});
```
