# Falcon IT – Fase 3 del motor del sistema

## Objetivo

Construir la siguiente fase crítica del sistema Falcon IT, enfocada en continuidad del servicio mensual, renovaciones, vencimientos, dashboard cliente mejorado, métricas reales y ficha empresarial del cliente.

La base ya está funcionando:

- billing público crea lead
- admin valida pago
- lead se convierte en cliente
- se activa la suscripción
- payments, clients y subscriptions ya están operando

Ahora el objetivo es consolidar el motor operativo del servicio.

---

## Prioridades

1. Renovaciones y vencimientos
2. Dashboard cliente refinado
3. Métricas operativas del dashboard admin
4. Perfil empresarial/fiscal del cliente

---

## 1. Renovaciones y vencimientos

### Objetivo

Controlar la continuidad mensual del servicio y la recurrencia operativa.

### Construir:

- estados visuales de suscripción:
  - active
  - expiring
  - expired
  - suspended
  - cancelled
- alertas de suscripciones que vencen en:
  - 3 días
  - 5 días
  - 7 días
- bloque o módulo para suscripciones vencidas
- flujo manual de renovación
- reactivación de plan tras nuevo pago validado

### Admin

Crear una vista o bloque operativo que muestre:

- suscripciones por vencer
- suscripciones vencidas
- renovaciones pendientes
- pagos de renovación pendientes

### Cliente

Mostrar alertas claras en `/dashboard` cuando:

- el plan está por vencer
- el plan está vencido
- el pago está pendiente de validación
- debe subir comprobante de renovación

---

## 2. Dashboard cliente refinado `/dashboard`

### Objetivo

Convertir el dashboard cliente en un panel real de servicio IT.

### Mostrar:

- estado actual del servicio
- nombre del plan
- precio
- fecha de inicio
- fecha de vencimiento
- días restantes
- visitas disponibles
- visitas usadas
- próxima visita
- incidencias abiertas
- último pago y estado
- último reporte técnico
- alertas operativas

### Acciones rápidas:

- subir comprobante
- reportar incidencia
- ver visitas
- ver reportes

### Requisito

La UI debe priorizar claridad operativa y valor percibido del servicio.

---

## 3. Métricas del dashboard admin `/admin`

### Objetivo

Construir métricas conectadas a datos reales y útiles para operar y vender.

### KPIs:

- clientes activos
- MRR estimado
- pagos pendientes
- suscripciones por vencer
- suscripciones vencidas
- incidencias abiertas
- incidencias críticas
- visitas programadas esta semana
- visitas completadas este mes
- distribución de clientes por plan
- clientes suspendidos
- tasa básica de renovación si se puede calcular

### Requisitos:

- usar queries reales a Supabase
- mantener consistencia visual con el dashboard actual
- no construir métricas decorativas

---

## 4. Perfil empresarial/fiscal del cliente

### Objetivo

Completar la ficha empresarial para operación y facturación manual.

### Extender cliente con:

- business_name
- contact_name
- main_email
- main_phone
- rif_or_id
- address
- city
- zone
- billing_email
- administrative_contact
- notes

### Admin

Permitir ver y editar esta ficha desde detalle de cliente.

---

## Reglas técnicas

- seguir usando Supabase directo
- no usar Prisma
- respetar RLS
- no romper módulos ya existentes
- mantener consistencia visual
- extender con lógica limpia
- no construir automatizaciones de correo en esta fase

## Resultado esperado

Al terminar esta fase, Falcon IT debe poder:

- controlar vencimientos y renovaciones
- alertar al cliente sobre su estado
- mostrar un dashboard cliente más sólido
- medir el negocio con KPIs reales
- tener ficha empresarial completa del cliente
