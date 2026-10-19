# Revisión semanal de ICEX

Automatización local de Codex: `revisi-n-semanal-del-campus-icex`. Lunes a las 09:00 Europe/Madrid, primera revisión programada el 26 de octubre de 2026. Es una tarea recurrente de este chat que utiliza el navegador autenticado; no es un cron de Vercel ni funciona independientemente del ordenador. No se han creado credenciales persistentes para el LMS.

## Fuentes y estado

- Curso: https://lms.icex.es/course/view.php?id=862
- GitHub: BISTY-max/Icex, rama main; comprobar HEAD antes de editar/publicar.
- Vercel: proyecto icex, `prj_kHu4Zwe78xZCbP1VA7AMPUSpjEyw`, equipo `team_25vqrEXqIU21KVoEEtluXNV1`.
- Supabase: edthixwsmhtaavumazcc, bucket privado icex-documents. Esquema y acceso en supabase/README.md y schema.sql. Mantener RLS y propietario existentes.
- Instantáneas web: app/campus/data.json, document-index.json, calendar-events.json; calendario exportado public/calendario-icex.ics.
- Inventario y archivos locales: /Users/bisty/Documents/Codex/2026-10-19/est/work/icex-source, outputs/inventario-icex.json, work/supabase/upload-manifest.json y outputs/icex-materiales. Usar estas rutas como evidencia inicial, no ejecutar los antiguos scripts de importación a ciegas: algunos contienen rutas temporales de la importación inicial.

## Procedimiento

1. Leer las instrucciones vigentes, el estado remoto, los inventarios y el informe previo. Abrir el curso con cua_repl y comprobar que la sesión sigue autenticada. No extraer cookies ni contraseñas. Si no hay acceso, registrar el bloqueo y pedir renovación de sesión; no simular una revisión satisfactoria.
2. Recorrer secciones, recursos, carpetas, bases de datos, tareas y guías accesibles. Comparar identificadores, URLs canónicas, títulos, descripciones y fechas. Mantener un inventario fechado de lo inspeccionado y las restricciones.
3. Descargar los documentos accesibles a una carpeta nueva de la revisión y calcular SHA-256. Comprobar también los ya existentes: una URL o nombre igual puede contener bytes distintos. Comparar con el manifiesto y registros de Supabase. Detectar nuevos archivos y contenido modificado. No usar solamente fechas HTTP o tamaño como prueba de igualdad.
4. Cargar archivos nuevos/modificados al bucket privado con rutas por hash, conservando los anteriores. Verificar bytes/hash y almacenamiento antes de cambiar el índice. Usar el esquema real y las herramientas autenticadas disponibles para actualizar los registros, sin credenciales de administración en el cliente. Si un objeto no se ha subido/verificado, no enlazarlo como disponible.
5. Actualizar data.json, document-index.json y tablas según los cambios confirmados. Reflejar fechas de tareas en el calendario y .ics cuando corresponda. Conservar las clases/exámenes/TFM de fuentes aportadas por el usuario salvo corrección comprobada. No borrar contenido porque una visita falle o una sección esté temporalmente restringida. Ajustar contadores que dependan de los datos (incluido el aviso de biblioteca).
6. Actualizar sync-status.json: lastReviewedAt solo tras una revisión completada; lastUpdatedAt solo si se han implementado cambios de contenido. nextReviewAt es el siguiente lunes a las 09:00 Europe/Madrid, respetando cambios de horario. Si la revisión es parcial, mantener lastReviewedAt y documentar claramente el alcance y bloqueo; no presentar un fallo como ausencia de cambios.
7. Compilar con las dependencias existentes, comprobar la coherencia de índices/archivos y acceso privado. Publicar por GitHub preservando cambios remotos, verificar despliegue Vercel READY y la web de producción. No marcar como implementado un cambio que no se haya publicado. Si Vercel no lanza automáticamente, desplegar el HEAD verificado mediante su conexión Git existente.
8. Guardar informe fechado en outputs/revisiones-icex: alcance, novedades, versiones modificadas, hashes, restricciones, cambios publicados y comprobaciones. Si falla alguna etapa, conservar datos anteriores y comunicar el fallo.

La revisión inicial y última actualización de contenido son del 19 de octubre de 2026. Existen materiales restringidos en el LMS: los informes iniciales documentan esas limitaciones. No prometer cobertura de contenido al que la cuenta no tenga acceso.

## Corrección manual de asignatura (20 de octubre de 2026)
Los recursos module-53400, module-53401, module-53402 y module-53403 pertenecen a INVESTIGACIÓN COMERCIAL II: ESTUDIOS DE MERCADOS, Fase I (subject-investigacion-comercial-ii). Mantener separados de Marketing, aunque el LMS no delimite correctamente el bloque. Incluye sus seis archivos y la tarea 53403, también en Biblioteca y Tareas.
