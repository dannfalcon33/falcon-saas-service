# Go-Live Freeze (20-04-2026)

## Rama oficial de estabilización
- `release/go-live-2026-04-20`

## Objetivo
- Proteger el arranque comercial del 20/04/2026.
- Evitar regresiones por cambios de alcance no crítico.

## Regla de cambios (desde hoy hasta go-live)
- Permitido:
  - Correcciones de bugs de producción.
  - Seguridad (RLS, acceso a archivos, permisos).
  - Estabilidad y performance crítica.
- No permitido:
  - Nuevas features.
  - Cambios visuales no críticos.
  - Refactors grandes sin impacto directo en go-live.

## Gate obligatorio antes de merge/deploy
1. `npm run build` debe pasar en local.
2. Flujo E2E validado con 2 clientes de prueba:
   - Cliente A: Plan Empresarial.
   - Cliente B: Plan Corporativo.
3. Verificación rápida de módulos críticos:
   - Pagos (cliente/admin)
   - Incidencias
   - Visitas
   - Reportes
   - Notificaciones

## Convención de commits (durante freeze)
- `fix(prod): ...`
- `fix(security): ...`
- `fix(stability): ...`

## Rollback
- Mantener siempre identificado el último commit estable de esta rama para reversión rápida.
