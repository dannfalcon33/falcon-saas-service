# Falcon IT – Corregir reportes técnicos: recomendaciones y descarga del archivo por cliente

## Contexto actual

El flujo principal ya funciona:

- admin puede crear reportes técnicos
- el reporte se guarda
- el cliente ve el reporte listado en `/dashboard/reports`

Problemas actuales:

1. El campo `recommendations` existe en DB pero queda vacío siempre
2. En admin y cliente aparece una columna/bloque de recomendaciones sin valor real
3. El cliente ve el reporte, pero al intentar abrir o descargar el archivo aparece error
4. La UX del módulo de reportes todavía no está cerrada

Usar como referencia del schema actual:

- `falconit_supabase_update.sql`

## Fuente de verdad del schema

La tabla `service_reports` incluye:

- `title`
- `summary`
- `work_performed`
- `recommendations`
- `file_url`
- `file_path`
- `client_id`
- `subscription_id`
- `visit_id`
- `incident_id`
- `created_at`

No asumir campos viejos.
Usar `file_path` como referencia principal para archivos en bucket privado.

---

## Objetivo

Corregir el módulo de reportes técnicos para que:

1. el admin pueda guardar recomendaciones reales
2. el cliente vea recomendaciones útiles cuando existan
3. el cliente pueda abrir o descargar el archivo sin error
4. no se muestren campos vacíos o decorativos sin valor

---

## Parte 1 – Formulario admin de reportes

Revisar el modal o formulario de `/admin/reports`.

### Actualmente

- parece capturar título
- resumen
- archivo
- vínculo a visita
- cliente

### Ajuste obligatorio

Agregar y guardar estos campos reales:

- `work_performed`
- `recommendations`

### Reglas

- `summary` = resumen ejecutivo corto
- `work_performed` = trabajo realizado en detalle
- `recommendations` = acciones sugeridas posteriores

### UX

No dejar `recommendations` fuera del submit.
Asegurar que llegue a la inserción/actualización de `service_reports`.

---

## Parte 2 – Guardado real en DB

Revisar la acción server-side que crea reportes.

### Verificar que inserte:

- `title`
- `summary`
- `work_performed`
- `recommendations`
- `file_path`
- `client_id`
- `subscription_id`
- `visit_id`
- `incident_id`
- `created_by`

No dejar `recommendations` fuera del payload.

---

## Parte 3 – UI admin de reportes

Corregir la tabla/listado de `/admin/reports`.

### Problema actual

Hay una columna de recomendaciones que queda vacía o con relleno sin valor.

### Solución

Mostrar:

- una versión resumida de `recommendations` solo si existe
- si no existe, mostrar algo sobrio como:
  - `—`
    o
  - ocultar esa columna si prefieres una UI más limpia

No usar textos decorativos repetitivos sin utilidad.

---

## Parte 4 – UI cliente de reportes

Corregir `/dashboard/reports`.

### Mostrar por reporte:

- título
- fecha
- resumen
- recomendaciones solo si existen
- acción ver/descargar

### Reglas visuales

Si `recommendations` está vacío:

- no mostrar un bloque muerto
- no mostrar texto relleno genérico innecesario

---

## Parte 5 – Corregir descarga/visualización del archivo

### Problema actual

El cliente ve el reporte listado pero al abrir/descargar el archivo da error.

### Posibles causas

- uso incorrecto de `file_url`
- uso incorrecto de `file_path`
- intento de acceso directo a bucket privado
- falta de signed URL
- falta de validación server-side del cliente autenticado
- policy o flujo de descarga inconsistente

### Implementación obligatoria

Crear una ruta segura o server action para descarga, por ejemplo:

- `/api/client/reports/[reportId]/download`

### Esa ruta debe:

1. validar sesión del cliente
2. resolver `auth.uid()`
3. buscar el `client_id` asociado a ese usuario
4. buscar el `service_report` por `reportId`
5. verificar que `service_reports.client_id` coincida con el cliente autenticado
6. obtener `file_path`
7. descargar el archivo desde Supabase Storage o generar signed URL
8. devolver el archivo correctamente

### Regla

No exponer acceso libre al bucket.
No confiar solo en el `reportId` desde frontend.

---

## Parte 6 – Usar `file_path` como fuente principal

Si hoy el código mezcla `file_url` y `file_path`, unificar.

### Regla recomendada

- guardar el archivo en bucket privado
- persistir `file_path`
- generar acceso temporal al descargar
- no depender de URLs públicas persistentes

---

## Parte 7 – Logging y manejo de errores

### Mejorar logs

Registrar:

- reportId
- auth uid
- client_id resuelto
- file_path
- paso exacto que falla
- message
- code
- details
- hint

### UX

Si la descarga falla:

- mostrar mensaje controlado
- no usar alert genérica sin contexto
- ejemplo:
  - “No se pudo acceder al archivo del reporte. Intente nuevamente o contacte soporte.”

---

## Parte 8 – Resultado esperado

Después del fix:

- admin puede guardar recomendaciones reales
- admin ve recomendaciones útiles en su tabla
- cliente ve recomendaciones si existen
- el frontend no muestra bloques vacíos sin sentido
- cliente puede abrir o descargar el reporte sin error
- el acceso al archivo queda seguro y alineado con el cliente autenticado
