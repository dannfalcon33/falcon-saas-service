# Falcon IT - Deploy Checklist (Go-Live)

Fecha objetivo de salida comercial: **20/04/2026**.

## 1) Pre-deploy (obligatorio)

- [ ] `npm run build` en local sin errores.
- [ ] SQL de migraciones aplicadas en Supabase (incluye hardening RLS).
- [ ] Validación con 2 clientes de prueba:
  - [ ] Cliente Plan Empresarial.
  - [ ] Cliente Plan Corporativo.
- [ ] Validación de accesos:
  - [ ] Cliente no puede acceder a `/admin`.
  - [ ] Admin sí accede a todo el panel administrativo.
  - [ ] Cliente A no ve datos de Cliente B.
- [ ] Archivos privados:
  - [ ] Comprobantes y reportes abren con signed URL.
  - [ ] Sin acceso cruzado entre clientes.

## 2) Gate en GitHub

- [ ] Workflow `CI Build Gate` en verde.
- [ ] Merge/push a `master` solo con checks en verde.

## 3) Post-deploy (Vercel)

- [ ] Confirmar deploy exitoso en producción.
- [ ] Smoke test rápido:
  - [ ] Login admin y dashboard `/admin`.
  - [ ] Login cliente y dashboard `/dashboard`.
  - [ ] Notificaciones (cliente/admin) abren y listan eventos.
  - [ ] Flujo de pagos (cliente reporta, admin valida).
  - [ ] Flujo de visitas (cliente solicita, admin agenda/actualiza estado).
  - [ ] Reportes visibles y descargables según rol.

## 4) Rollback

- [ ] Tener identificado el último commit estable en `master`.
- [ ] Si falla un flujo crítico, revertir inmediatamente a commit estable.
