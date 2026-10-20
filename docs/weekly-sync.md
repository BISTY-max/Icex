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

## Fechas manuales de actividades (20 de octubre de 2026)
Tareas 53840/Actividades 1–2: 9 de octubre; 53841/3–4: 16 de octubre; 53842/5–6: 23 de octubre; 53843/7–8: 30 de octubre; 53844/9–10: 8 de noviembre. Año 2026, todas antes de las 19:30 Europe/Madrid. Fuente: imagen aportada por el usuario. Mantener si el LMS no publica fechas; no volver a dejarlas sin fecha por campos vacíos. Leer capítulos 0 y 00 es una indicación previa sin fecha concreta, no una entrega nueva.

## Exámenes completados (20 de octubre de 2026)
Las dos nuevas imágenes del usuario añaden 18 exámenes, 7 publicaciones de notas y 8 periodos/días de revisión. Preservar las horas de los parciales de Economía (21/10/2026 09:30) y Contabilidad (28/10/2026 10:00) sin duplicarlos. El 18/12/2026 hay dos exámenes diferentes: Habilidades Directivas y Comportamiento Social. Las revisiones de marzo son el 16 y el 19 de abril (dos días, no un rango). Mantener los vínculos subjectExamIds para el resumen de los cinco exámenes más próximos. Horas no indicadas: eventos de día completo. No inferir fechas de filas que no aparezcan en las imágenes.

## Metodología de examen
app/campus/exam-guidelines.json contiene los resúmenes de evaluación del Anexo 1 Fase 1 (70 páginas), aportado el 20 de octubre de 2026. Cada entrada conserva las páginas fuente. No inventar penalizaciones ni sustituir datos por deducciones. Mantener la distinción entre componentes de Taller/Comportamiento Social y el reparto detallado frente a aproximado de Marketing. Tres fichas no tienen metodología específica en ese anexo.

## Descarga de documentos de tareas
Mantener app/campus/task-documents.json: diccionario de id de tarea a lista de documentos {sha256,name}. Una lista vacía significa Documento pendiente y no lleva al LMS. Al encontrar actividades nuevas o adjuntos de cualquier tarea, confirmar la correspondencia tarea-archivo (no inferir solo por cercanía en el catálogo), descargar, verificar el hash y almacenar en el bucket privado con su registro verificado; solo entonces incorporar el hash al mapa. La UI sustituye Abrir tarea por Descargar tarea y genera una URL privada firmada al pulsar, utilizando la sesión de biblioteca del usuario. No almacenar URLs firmadas ni hacer públicos los archivos. Puede haber varios documentos por tarea. Para 53841 y 53842 ya se han vinculado los PDF de actividades 3–4 y 5–6; 53840, 53843 y 53844 siguen pendientes. Conservar todas las asociaciones verificadas y actualizar hashes cuando cambien las versiones. Comprobar descarga y que las tareas pendientes no naveguen al LMS. Mantener acceso por correo cuando no hay sesión de biblioteca activa.

Los enlaces /campus/documentos?doc=HASH inician la descarga automáticamente tras validar la sesión y cargar los registros verificados. Si se necesita acceso por correo, se conserva temporalmente el hash de la solicitud para continuar al volver del enlace de acceso. Mantener esta continuidad sin hacer públicos los archivos ni guardar URLs firmadas. Evitar que un refresco de sesión repita la descarga.
