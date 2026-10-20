# Exámenes IA

39 modelos de práctica para 11 asignaturas, preparados el 20 de octubre de 2026. El bloque se muestra en las 17 fichas, justo antes de Metodología de examen. En 14 fichas hay modelos: las tres modalidades online reutilizan la evaluación de su asignatura presencial. Precurso de Contabilidad, Sesiones Magistrales y Análisis de Países quedan sin modelos por falta de temario suficiente o metodología específica.

## Alcance

- Economía: tres parciales de microeconomía y tres finales de macroeconomía, con 20 preguntas cada uno. Basados en los dos exámenes 2025–2026 aportados. Referencia: parcial 40 minutos; final 50 minutos; +0,50/−0,17/blanco 0. Nuevos datos, escenarios y distractores; ningún enunciado compartido entre los seis modelos.
- Investigación Comercial I: 40 preguntas por modelo; búsquedas de tarifas del examen anterior convertidas en supuestos cerrados, sin afirmar aranceles vigentes.
- Marketing: 25 preguntas y dos abiertas por modelo. Se conserva la discrepancia 75/25 frente a 80/20 detectada en la guía, pendiente de confirmación docente.
- Investigación Comercial II: 37 preguntas de conceptos y tres sobre las cuatro lecturas del ZIP de 2025. Examen anterior leído desde la copia facilitada en Descargas.
- Contabilidad: tres parciales de 10 preguntas sobre casos contables completos (balance, operaciones, amortización, FIFO/LIFO e impuestos hipotéticos) y tres finales de 20 preguntas (proyecto, análisis financiero y ejercicios individuales). Casos y cifras nuevos. Referencia de ambos documentos: 75 minutos. Parcial: +1/−0,33/blanco 0; final: +0,50/−0,16/blanco 0. Las reglas son referencias del curso anterior.
- Communication and Negotiation Skills: 50 preguntas en inglés por modelo; duración y penalización del examen anterior etiquetadas como referencia, no como confirmación de la convocatoria actual.
- Taller: tres exámenes prácticos originales con cinco ejercicios y rúbricas propuestas.
- Estrategia Avanzada: 12 preguntas más una abierta, limitadas al caso Acerinox disponible.
- Dirección Estratégica, Comportamiento Social y Sector Exterior: sin examen anterior descargado; el usuario autorizó crear los modelos con temario y metodología. Las reglas no establecidas en la guía se etiquetan como propuestas.

Economía y Contabilidad tienen seis modelos por asignatura, sin enunciados repetidos entre ellos. Los modelos de las demás asignaturas conservan selecciones de bancos comunes y pueden compartir preguntas. Ninguno constituye una predicción del examen oficial. Las soluciones están cerradas inicialmente. Las respuestas abiertas admiten alternativas y las rúbricas no son oficiales.

## Archivos y regeneración

Ejecutar `python3 scripts/build-ai-exams.py` regenera el contenido estructurado, el índice ligero y los 39 cuestionarios HTML interactivos e imprimibles. El contenido completo queda en `content/ai-exams.json` como resultado local; el generador conserva las preguntas y fuentes editables. El campus importa solamente el índice y abre los enunciados en páginas independientes, evitando cargar todos los modelos en el cliente principal.

En cada página, Imprimir / guardar PDF utiliza el diálogo nativo. Las soluciones aparecen al finalizar y se imprimen solo si están abiertas. Los test se corrigen en el navegador con aciertos, errores y blancos. Se muestra puntuación solo cuando se dispone de una escala completa, indicando si procede del examen anterior o es una propuesta. Investigación Comercial I, Comportamiento Social y Estrategia Avanzada muestran recuentos sin nota por no estar definidas todas las reglas. Los ejercicios escritos se contrastan con rúbricas, sin calificación automática. No se envían ni guardan respuestas: permanecen en el formulario hasta recargar o reiniciar. Reiniciar pide confirmación y volver a editar conserva las respuestas.

## Comprobación

Compilación Next.js y TypeScript correctas. Se han comprobado cuatro opciones distintas y una clave por pregunta, enlaces a las 39 páginas, selección diferente entre modelos, modelos por convocatoria con contenido, suma de rúbricas de Taller y apertura de soluciones en navegador. Comprobación visual del bloque y del modelo de Contabilidad. Cuestionarios: prueba en navegador de acierto, error y blanco, puntuación con penalización, progreso, edición, cancelación de reinicio, reinicio confirmado y desarrollo con conservación de respuesta y rúbrica.

## Navegación paso a paso

Cada modelo muestra una pregunta o ejercicio cada vez, con Anterior y Siguiente. Las respuestas permanecen al navegar. La corrección aparece en la última pregunta; las soluciones siguen ocultas hasta finalizar. Tras corregir, se pueden revisar las preguntas de una en una. Imprimir conserva todos los enunciados mediante estilos de impresión. Los títulos están dentro de la tarjeta en flujo normal, sin legend sobre el borde. Instrucciones y metodología quedan disponibles en un desplegable. Pruebas en navegador: navegación, conservación de selección y texto escrito, separación de 20 px entre enunciado y opciones, un único bloque visible y puntuación final correcta.

## Corrección por pregunta

Un botón rojo Corregir aparece a la derecha de Dejar en blanco en cada pregunta tipo test. Muestra Correcto o Incorrecto, identifica la opción correcta en verde y la elegida incorrectamente en rojo, y explica la solución. Cambiar o borrar una respuesta limpia su feedback; navegar lo conserva. Sin selección se pide elegir una respuesta. La corrección final sigue funcionando. Se ha retirado Materiales de referencia de la interfaz de los 33 modelos; las fuentes se conservan en los datos editables. Verificado en navegador con respuesta correcta, incorrecta, cambio de opción, ausencia de selección y puntuación final.

## Interfaz simplificada

Se han retirado de las páginas de cuestionarios los bloques Instrucciones y metodología y Materiales de referencia. La metodología de cada asignatura sigue disponible en su ficha del campus; los datos y fuentes de los modelos se conservan en el generador.

## Precisión de los enunciados de Economía

Revisados diez enunciados para distinguir precio, cantidad demandada e ingreso total; explicitar ceteris paribus y las pendientes de las curvas cuando son necesarias; y diferenciar cambios porcentuales exactos de aproximaciones. En el ejercicio de elasticidad, P baja un 5 % y Q aumenta un 10 %: el ingreso P × Q aumenta exactamente un 4,5 %. Comprobados los cálculos y la corrección por pregunta en el navegador. La revisión posterior con los cuatro documentos sustituye íntegramente estos modelos de Economía y elimina sus enunciados compartidos.

## Revisión con los cuatro documentos de parcial y final

El banco editable `scripts/ai-exams/exam_variants.py` sustituye los modelos de Economía y Contabilidad antes de generar las modalidades online. Cada asignatura muestra Modelo 1/2/3 parcial y Modelo 1/2/3 final. Los documentos de Economía se separan por microeconomía y macroeconomía; Contabilidad respeta los 10/20 ítems de los originales y aplica la puntuación específica de cada modelo. Las hipótesis alternativas no alteran el resto del caso. Los datos se consultan en un desplegable por pregunta y se incluyen al imprimir. Los antiguos enlaces se conservan: Economía 1–3 son parciales; account-1–3 son finales.

Validación: 12 modelos y 210 preguntas nuevas; cuatro opciones distintas y una clave por ítem; enunciados únicos en los seis modelos de cada asignatura; igualdad contable en cada caso; fórmulas de inversión y ratios calculadas desde los datos; enlaces existentes, alias online y puntuación específica comprobados. No se usa el documento de Marketing como fuente de Contabilidad.
