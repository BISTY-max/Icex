"use client";

import { useEffect, useState } from "react";
import data from "../data.json";
import calendar from "../calendar-events.json";
import guidelines from "../exam-guidelines.json";
import { subjectExamIds } from "../subject-exams";
import { aliases, plans } from "./plans";
import Account, { PrivateDocumentLink } from "../account";
import documentIndex from "../document-index.json";
import "./study.css";

const dayKey = (ms: number) => new Date(ms).toLocaleDateString("en-CA", { timeZone: "Europe/Madrid" });
const dayNumber = (key: string) => Date.parse(key + "T12:00:00Z") / 86400000;
const dateLabel = (value: string) => new Date(value.length === 10 ? value + "T12:00:00Z" : value).toLocaleDateString("es-ES", { timeZone:"Europe/Madrid", day:"numeric", month:"long", year:"numeric" });
export default function StudyPlan() {
  const [selected, setSelected] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [minutes, setMinutes] = useState(60);
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("subject");
    setSelected(data.subjects.some(s => s.id === requested) ? requested : "module-53416");
    const tick = () => setNow(Date.now()); tick(); const timer = setInterval(tick, 60000); return () => clearInterval(timer);
  }, []);
  const subject = data.subjects.find(s => s.id === selected);
  if (!subject || now === null) return <main className="study-plan"><p role="status">Preparando tu plan de estudio…</p></main>;
  const id = aliases[subject.id] || subject.id;
  const plan = plans[id];
  const group = data.subjects.filter(s => (aliases[s.id] || s.id) === id);
  const exam = calendar.filter(e => (subjectExamIds[id] || []).includes(e.id) && (e.allDay ? e.end > dayKey(now) : Date.parse(e.end) > now)).sort((a,b) => a.start.localeCompare(b.start))[0];
  const remaining = exam ? Math.max(0, Math.round(dayNumber(exam.start.slice(0,10)) - dayNumber(dayKey(now)))) : null;
  const partial = !!exam && /parcial/i.test(exam.title);
  const units = plan?.units.filter(u => !u.scope || !exam || u.scope === (partial ? "parcial" : "final")) || [];
  const tasks = data.tasks.filter(t => group.some(s => s.title === t.subject));
  const upcoming = tasks.filter(t => t.due && Date.parse(t.due) >= now).sort((a,b) => a.due.localeCompare(b.due));
  const undated = tasks.filter(t => !t.due);
  const past = tasks.filter(t => t.due && Date.parse(t.due) < now);
  const guide = (guidelines as Record<string,{items:{label:string;text:string}[];note:string}>)[id];
  const files = [...new Map(group.flatMap(s => s.resources.flatMap(r => r.files)).map(f => [f.url, f])).values()];
  const studyDays = remaining === null ? null : Math.max(0, remaining - 2);
  const teachingBlocks = units.length;
  const intensive = studyDays !== null && studyDays < teachingBlocks;
  function select(value: string) {
    setSelected(value);
    const url = new URL(window.location.href); url.searchParams.set("subject", value); window.history.replaceState(null, "", url);
  }
  function taskDifficulty(title: string) {
    if (/caso|portfolio|proyecto|estudio|eucalipto|encina|laurel/i.test(title)) return "Alta · integra varios pasos y necesita revisión del conjunto";
    if (/póster|poster/i.test(title)) return "Media-alta · selección de fuentes, síntesis visual y ensayo oral";
    return "Media · lectura previa, resolución y comprobación";
  }
  return <main className="study-plan">
    <header><a href="/campus">← Volver al campus</a><Account/></header>
    <p className="study-eyebrow">ORGANÍZATE · PRACTICA · REPASA</p><h1>Plan de estudio</h1>
    <label className="study-select">Asignatura<select value={subject.id} onChange={e => select(e.target.value)}>{data.subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</select></label>
    <h2 className="study-subject-title">{subject.title}</h2>
    <p className="study-intro">Propuesta de organización basada en los materiales, tareas y metodología disponibles en el campus. Dificultad, tiempo y orden de trabajo son estimaciones de estudio, no indicaciones oficiales.</p>
    <section className="study-deadline" aria-label="Próximo examen"><div><span className="study-eyebrow">PRÓXIMO EXAMEN</span><h2>{exam ? dateLabel(exam.start) : "Sin fecha confirmada"}</h2><p>{exam ? `${exam.title}${exam.allDay ? " · Hora no indicada" : " · " + new Date(exam.start).toLocaleTimeString("es-ES",{timeZone:"Europe/Madrid",hour:"2-digit",minute:"2-digit"}) + " h"}` : "Confirma la fecha y el alcance antes de fijar un calendario de repaso."}</p></div>{remaining !== null ? <strong>{remaining === 0 ? "Hoy" : `${remaining} días`}</strong> : null}</section>
    {plan ? <>
      <section className="study-panel"><h2>Qué priorizar</h2><p>{plan.focus}</p><p>{plan.routine}</p>{exam && id === "module-53416" && partial ? <p className="study-callout">Empieza hoy por proceso contable y existencias. Revisa con el profesor si amortizaciones y cálculo financiero entran en este parcial; las sesiones que ves debajo son una ruta de preparación, no una confirmación de su alcance.</p> : null}</section>
      <section className="study-panel"><div className="study-section-heading"><h2>Temario, en orden de trabajo</h2><span>{units.length} bloques</span></div><p>Avanza cuando puedas cumplir el criterio «Lo llevas bien si…». Si falla, repite un ejercicio distinto antes de seguir.</p><ol className="study-units">{units.map((unit,i) => <li key={unit.title}><span className="study-unit-number">{String(i+1).padStart(2,"0")}</span><div><div className="study-section-heading"><h3>{unit.title}</h3><span className={unit.difficulty === "Alta" ? "study-badge high" : "study-badge"}>Dificultad {unit.difficulty.toLowerCase()}</span></div><p>{unit.practice}</p><p className="study-ready"><strong>Lo llevas bien si…</strong> {unit.ready}</p></div></li>)}</ol></section>
      <section className="study-panel"><h2>Cómo llevarlo al día</h2><label className="study-select">Tiempo por sesión de esta asignatura<select value={minutes} onChange={e => setMinutes(Number(e.target.value))}><option value={30}>30 minutos</option><option value={60}>60 minutos</option><option value={90}>90 minutos</option></select></label><div className="study-routine"><article><strong>{Math.round(minutes/6)} min</strong><h3>Recuperar</h3><p>Explica sin apuntes lo de la sesión anterior. Anota qué has olvidado.</p></article><article><strong>{Math.round(minutes*2/3)} min</strong><h3>Aplicar</h3><p>Resuelve ejercicios, casos o preguntas del bloque que toque. Consulta después.</p></article><article><strong>{minutes-Math.round(minutes/6)-Math.round(minutes*2/3)} min</strong><h3>Revisar</h3><p>Registra el error, su causa y la regla para no repetirlo.</p></article></div><p>Tras cada clase: ordena lo nuevo y apunta dudas. En las siguientes 48 horas: una sesión práctica. Cada semana: una sesión de repaso mezclado y otra para adelantar la entrega más próxima. Este tiempo es para una asignatura: repártelo entre materias según fechas y disponibilidad.</p></section>
      <section className="study-panel"><h2>{remaining !== null && remaining <= 14 ? "Desde hoy hasta el examen" : "Ruta hasta el examen"}</h2>
        {remaining !== null && remaining <= 2 ? <p className="study-callout">Quedan {remaining} días. Haz un diagnóstico breve, corrige los errores de base y repasa lo ya trabajado. No intentes completar todo el temario en una sesión; deja descanso antes de la prueba.</p> : remaining !== null && remaining <= 14 ? <><p>{intensive ? "Ruta intensiva: hay menos días de contenido que bloques. La dedicación puede no bastar para partir de cero; usa el diagnóstico para elegir tus lagunas prioritarias." : "Reparte los bloques entre los días disponibles y reserva el final para practicar y consolidar."}</p><ol className="study-timeline">{Array.from({length:studyDays || 0},(_,i) => {
          const start = Math.floor(i*teachingBlocks/(studyDays || 1)); const end = Math.max(start+1,Math.floor((i+1)*teachingBlocks/(studyDays || 1)));
          const assigned = units.slice(Math.min(start,teachingBlocks-1),end);
          return <li key={i}><strong>{dateLabel(new Date((dayNumber(dayKey(now))+i)*86400000).toISOString().slice(0,10))}</strong><span>{assigned.map(u=>u.title).join(" + ")}</span><small>{minutes} min de trabajo activo. {i === 0 ? "Empieza con un ejercicio diagnóstico." : "Recupera primero un error de la sesión anterior."}</small></li>;
        })}<li><strong>Dos días antes</strong><span>Haz un examen anterior completo con el tiempo de la metodología. Revisa respuestas con solución contrastada; las preguntas pendientes no equivalen a aciertos.</span></li><li><strong>La víspera</strong><span>Repite errores y conceptos que confundas, prepara materiales permitidos y evita abrir bloques nuevos.</span></li></ol></> : <ol className="study-timeline"><li><strong>Desde esta semana</strong><span>Recorre los bloques en el orden indicado, con una sesión de conceptos y otra de aplicación por bloque. Después de clase, actualiza el bloque correspondiente.</span></li><li><strong>Cada fin de semana</strong><span>Práctica mezclada de lo acumulado y revisión de la siguiente entrega. Si no puedes explicar un error, vuelve al material de ese tema.</span></li><li><strong>Últimos 7 días{exam ? ` · antes del ${dateLabel(exam.start)}` : " cuando se confirme la fecha"}</strong><span>Dos ensayos de examen en días distintos, con corrección entre ambos. Reserva la víspera para tu lista de errores y un repaso ligero.</span></li></ol>}
        <p className="study-small">No se asignan probabilidades de examen a partir del histórico. El objetivo es cubrir el contenido y aplicar los criterios de la convocatoria actual.</p>
      </section>
      <section className="study-panel"><h2>Trabajos y entregas</h2><p>{plan.work}</p><p className="study-callout"><strong>Dificultad estimada.</strong> {plan.workDifficulty}</p>
        {upcoming.length ? <><h3>Próximas entregas</h3>{upcoming.map(task => <article className="study-task" key={task.id}><h4>{task.title}</h4><p className="study-task-date">{dateLabel(task.due)} · {new Date(task.due).toLocaleTimeString("es-ES",{timeZone:"Europe/Madrid",hour:"2-digit",minute:"2-digit"})} h</p><p>{taskDifficulty(task.title)}</p><p>Empieza por leer el encargo, prepara una versión completa y termina con una revisión contra sus requisitos. {Date.parse(task.due)-now < 48*3600000 ? "El plazo ya está próximo: prioriza completar lo exigido y reserva tiempo para comprobar y entregar antes de la hora indicada." : "Fecha interna recomendada: versión lista 48 horas antes; no sustituye el plazo oficial."}</p></article>)}</> : <p>No hay próximas entregas con fecha publicada en esta ficha.</p>}
        {undated.length ? <details><summary>Trabajos sin fecha confirmada · {undated.length}</summary>{undated.map(task => <article className="study-task" key={task.id}><h4>{task.title}</h4><p>{taskDifficulty(task.title)}</p><p>Sin fecha confirmada. Hazlo al terminar el bloque correspondiente y consulta el plazo con el profesor.</p></article>)}</details> : null}
        {past.length ? <details><summary>Entregas cuya fecha ya ha pasado · {past.length}</summary><p>Comprueba tu estado de entrega en el campus oficial. Esta web no conoce si las has entregado.</p>{past.map(t => <p key={t.id}>{t.title} · {dateLabel(t.due)}</p>)}</details> : null}
      </section>
    </> : <section className="study-panel"><h2>Falta información para un plan detallado</h2><p>Esta asignatura no tiene temario suficiente disponible para ordenar contenidos ni estimar la dificultad de sus trabajos. Empieza por obtener programa, criterios y fechas. Tras cada sesión, redacta una síntesis, anota dudas y revisa las indicaciones docentes; el plan específico quedará pendiente.</p></section>}
    {guide ? <details className="study-panel study-method"><summary>Metodología que debes tener en cuenta</summary><dl>{guide.items.map(item => <div key={item.label}><dt>{item.label}</dt><dd>{item.text}</dd></div>)}</dl>{guide.note ? <p>{guide.note}</p> : null}</details> : null}
    <section className="study-panel"><h2>Materiales para seguir el plan</h2><p>Base del plan: documentación actual de esta asignatura y su modalidad asociada, fechas del calendario y metodología publicada en el campus. Los bloques de trabajo son una propuesta, no el índice oficial completo.</p><a className="study-primary-link" href={`/campus?subject=${subject.id}`}>Ver documentación, exámenes y metodología →</a>{files.length ? <details><summary>Documentos del curso · {files.length}</summary><ul className="study-files">{files.map(file => {const hash=(documentIndex as Record<string,string>)[file.url.split("?")[0]];return <li key={file.url}>{hash ? <PrivateDocumentLink hash={hash}>{file.text}</PrivateDocumentLink> : <span>{file.text} · Copia privada no disponible; consulta la ficha del curso.</span>}</li>;})}</ul></details> : null}</section>
  </main>;
}
