# Deploy Checklist - Go Live 20/04/2026

## 1) Gate de calidad (obligatorio)
- [ ] Branch protection en `master` activo.
- [ ] Opción `Require a pull request before merging` activa.
- [ ] Status check requerido: `CI Build Gate / Build Check`.
- [ ] No hay merges directos a `master`.

## 2) CI (GitHub Actions)
- [ ] Workflow `.github/workflows/ci-build.yml` presente y ejecutando.
- [ ] Secrets de Actions configurados:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] PR más reciente en verde (build OK).

## 3) Supabase (seguridad base)
- [ ] RLS crítico validado con usuarios de prueba.
- [ ] SQL de hardening aplicado:
  - [ ] `falconit_supabase_migration_rls_hardening_v1.sql`
  - [ ] `falconit_supabase_storage_hardening_v1.sql`
- [ ] Buckets privados confirmados:
  - [ ] `payment-proofs`
  - [ ] `service-reports`

## 4) Vercel (producción)
- [ ] Variables de entorno de producción completas.
- [ ] Último deploy `Production` en estado `Ready`.
- [ ] No hay errores de runtime en flujo crítico.

## 5) Prueba E2E comercial (obligatoria)
- [ ] Lead registrado desde web pública.
- [ ] Cliente activado con plan.
- [ ] Cliente sube comprobante y admin valida.
- [ ] Cliente reporta incidencia y admin la gestiona.
- [ ] Cliente solicita visita y admin agenda/cierra.
- [ ] Reporte técnico subido y visible para cliente.
- [ ] Notificaciones funcionando (cliente/admin).

## 6) Cierre de release
- [ ] Commit/tag de versión estable documentado.
- [ ] Plan de rollback identificado (último commit estable).
- [ ] Checklist firmado por responsable técnico.

## Notas operativas
- Fecha objetivo de go-live: `20/04/2026`.
- Durante freeze solo se permiten cambios `fix(prod|security|stability)`.
