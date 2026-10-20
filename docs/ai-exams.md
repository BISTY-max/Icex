# Exámenes IA

33 modelos de práctica para 11 asignaturas, preparados el 20 de octubre de 2026. El bloque se muestra en las 17 fichas, justo antes de Metodología de examen. En 14 fichas hay modelos: las tres modalidades online reutilizan la evaluación de su asignatura presencial. Precurso de Contabilidad, Sesiones Magistrales y Análisis de Países quedan sin modelos por falta de temario suficiente o metodología específica.

## Alcance

- Economía: tres modelos de parcial, basados en el parcial 2025–2026 disponible. No se simula el final no disponible.
- Investigación Comercial I: 40 preguntas por modelo; búsquedas de tarifas del examen anterior convertidas en supuestos cerrados, sin afirmar aranceles vigentes.
- Marketing: 25 preguntas y dos abiertas por modelo. Se conserva la discrepancia 75/25 frente a 80/20 detectada en la guía, pendiente de confirmación docente.
- Investigación Comercial II: 37 preguntas de conceptos y tres sobre las cuatro lecturas del ZIP de 2025. Examen anterior leído desde la copia facilitada en Descargas.
- Contabilidad: 20 problemas tipo test por modelo, con cifras distintas. Combina habilidades de parcial y final; las reglas de 75 minutos y puntuación se identifican como referencia del final anterior.
- Communication and Negotiation Skills: 50 preguntas en inglés por modelo; duración y penalización del examen anterior etiquetadas como referencia, no como confirmación de la convocatoria actual.
- Taller: tres exámenes prácticos originales con cinco ejercicios y rúbricas propuestas.
- Estrategia Avanzada: 12 preguntas más una abierta, limitadas al caso Acerinox disponible.
- Dirección Estratégica, Comportamiento Social y Sector Exterior: sin examen anterior descargado; el usuario autorizó crear los modelos con temario y metodología. Las reglas no establecidas en la guía se etiquetan como propuestas.

Los modelos teóricos tienen selecciones distintas de bancos comunes y comparten preguntas. No son tres bancos completamente independientes ni predicciones del examen oficial. Las soluciones están cerradas inicialmente. Las respuestas abiertas admiten alternativas y las rúbricas no son oficiales.

## Archivos y regeneración

Ejecutar `python3 scripts/build-ai-exams.py` regenera el contenido estructurado, el índice ligero y las 33 cuestionarios HTML interactivos e imprimibles. El contenido completo queda en `content/ai-exams.json` como resultado local; el generador conserva las preguntas y fuentes editables. El campus importa solamente el índice y abre los enunciados en páginas independientes, evitando cargar todos los modelos en el cliente principal.

En cada página, Imprimir / guardar PDF utiliza el diálogo nativo. Las soluciones aparecen al finalizar y se imprimen solo si están abiertas. Los test se corrigen en el navegador con aciertos, errores y blancos. Se muestra puntuación solo cuando se dispone de una escala completa, indicando si procede del examen anterior o es una propuesta. Investigación Comercial I, Comportamiento Social y Estrategia Avanzada muestran recuentos sin nota por no estar definidas todas las reglas. Los ejercicios escritos se contrastan con rúbricas, sin calificación automática. No se envían ni guardan respuestas: permanecen en el formulario hasta recargar o reiniciar. Reiniciar pide confirmación y volver a editar conserva las respuestas.

## Comprobación

Compilación Next.js y TypeScript correctas. Se han comprobado cuatro opciones distintas y una clave por pregunta, enlaces a las 33 páginas, selección diferente entre modelos, tres modelos por ficha con contenido, suma de rúbricas de Taller y apertura de soluciones en navegador. Comprobación visual del bloque y del modelo de Contabilidad. Cuestionarios: prueba en navegador de acierto, error y blanco, puntuación con penalización, progreso, edición, cancelación de reinicio, reinicio confirmado y desarrollo con conservación de respuesta y rúbrica.
