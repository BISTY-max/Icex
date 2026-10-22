"use client";

import { useId, useState } from "react";
import { PrivateDocumentLink } from "./account";
import historicalIndex from "./historical-index.json";
import "./historical-materials.css";

type HistoricalFile = { hash: string; name: string; year: string | null; stage: string; extension: string; questionsDetected: number; quizQuestions?: number; analyzed: boolean; aliases: string[] };
type Topic = { name: string; questions: number; questionPercent: number; examsWithTopic: number; examPercent: number };
type Statistics = { totalQuestions: number; classifiedQuestions: number; documents: number; analyzedDocuments: number; examGroups: number; topics: Topic[]; years: string[] };
type HistoricalSubject = { subject: string; source: string; exams: HistoricalFile[]; notes: HistoricalFile[]; statistics: Record<string, Statistics> };
const stages = [{ value: "parcial", label: "Parciales" }, { value: "final", label: "Finales" }, { value: "otros", label: "Otras pruebas y recopilaciones" }];
const percent = (n: number) => n.toLocaleString("es-ES", { maximumFractionDigits: 1 }) + " %";

function FileList({ files, quizzes = false }: { files: HistoricalFile[]; quizzes?: boolean }) {
  return <ul className="history-files">{files.map(file => <li key={file.hash}>
    {quizzes && file.quizQuestions ? <a href={`/campus/examenes-anteriores?doc=${file.hash}`}>{file.name} →</a> : <PrivateDocumentLink hash={file.hash}>{file.name}</PrivateDocumentLink>}
    {quizzes ? <small>{file.quizQuestions ? `Abrir cuestionario · ${file.quizQuestions} preguntas transcritas` : "Cuestionario pendiente: formato no extraíble con fiabilidad. Disponible el original."}</small> : null}
    <small>{file.extension}{file.year ? ` · ${file.year}` : " · Año sin identificar"}{file.analyzed ? ` · ${file.questionsDetected} preguntas detectadas` : ""}</small>
    {file.aliases.length ? <small>El mismo archivo figura también como: {file.aliases.join("; ")}. Se cuenta una sola vez.</small> : null}
  </li>)}</ul>;
}

function ExamHistory({ data }: { data: HistoricalSubject }) {
  const available = stages.filter(stage => data.exams.some(file => file.stage === stage.value));
  const [stage, setStage] = useState(available[0]?.value || "final");
  const [metric, setMetric] = useState("questions");
  const metricId = useId();
  const stats = data.statistics[stage];
  const files = data.exams.filter(file => file.stage === stage);
  const topics = [...(stats?.topics || [])].sort((a, b) => metric === "questions" ? b.questions - a.questions : b.examPercent - a.examPercent);
  return <details className="campus-exam-guidelines history-block"><summary>Exámenes anteriores <span aria-hidden="true">+</span></summary>
    <div className="history-content">
      <p className="history-intro">Elige un examen para hacerlo como cuestionario, pregunta a pregunta. Acceso con tu cuenta del campus.</p>
      <div className="history-stage-buttons" role="group" aria-label="Tipo de examen">{available.map(item => <button key={item.value} type="button" aria-pressed={stage === item.value} onClick={() => setStage(item.value)}>{item.label}</button>)}</div>
      <h3 className="history-documents-heading">Exámenes · {files.length}</h3>
      <FileList files={[...files].sort((a,b) => (b.year || "").localeCompare(a.year || "") || a.name.localeCompare(b.name))} quizzes/>
      <details className="history-exam-information"><summary>Información para examen</summary>
      <section className="history-analysis" aria-label="Análisis de temas del histórico">
        <h3>Qué temas aparecen más</h3>
        <p className="history-analysis-status">Análisis automático orientativo · Clasificación temática pendiente de revisión completa.</p>
        {stats?.totalQuestions ? <>
          <p className="history-sample"><strong>{stats.totalQuestions} preguntas detectadas</strong> en {stats.analyzedDocuments} de {stats.documents} documentos · {stats.examGroups} exámenes analizados.</p>
          <p className="history-years">Años incluidos: {stats.years.join(", ") || "Sin fecha identificada"}.</p>
          <label className="history-metric" htmlFor={metricId}>Mostrar gráfico por<select id={metricId} value={metric} onChange={event => setMetric(event.target.value)}><option value="questions">Porcentaje de preguntas</option><option value="exams">Aparición en exámenes</option></select></label>
          <p className="history-chart-help">{metric === "questions" ? "Preguntas de cada tema / total de preguntas detectadas. Todas pesan igual; no representa el porcentaje de la nota." : "Exámenes con al menos una pregunta del tema / exámenes analizados. Un examen puede incluir varios temas; los porcentajes no suman 100 %."}</p>
          <ul className="history-chart" aria-label={metric === "questions" ? "Distribución de preguntas por tema" : "Frecuencia de los temas en los exámenes"}>{topics.map(topic => {
            const value = metric === "questions" ? topic.questionPercent : topic.examPercent;
            return <li key={topic.name} className={topic.name === "Sin clasificar" ? "history-unclassified" : ""}><div className="history-bar-label"><strong>{topic.name}</strong><span>{percent(value)}</span></div><div className="history-bar-track" aria-hidden="true"><div style={{ width: `${value}%` }}/></div><small>{metric === "questions" ? `${topic.questions} de ${stats.totalQuestions} preguntas` : `${topic.examsWithTopic} de ${stats.examGroups} exámenes`}</small></li>;
          })}</ul>
          <p className="history-caution">{stats.totalQuestions - stats.classifiedQuestions} preguntas sin clasificación fiable permanecen en «Sin clasificar». Los documentos sin preguntas extraíbles no entran en el gráfico. No es una predicción del próximo examen.</p>
        </> : <p>No hay preguntas identificadas con suficiente fiabilidad para calcular porcentajes en este bloque. Los documentos siguen disponibles debajo.</p>}
        <details className="history-method"><summary>Cómo se ha calculado</summary><p>Fuente: el ZIP de Fase I aportado. Se detectan preguntas numeradas, sus opciones y las filas de las recopilaciones Excel, y se agrupan mediante términos temáticos. Los nombres de los bloques son descriptivos y no equivalen a la numeración oficial del temario. Puede haber errores de extracción o clasificación, especialmente en casos prácticos y preguntas con imágenes.</p><p>Los archivos idénticos se cuentan una sola vez. Las preguntas con texto idéntico se deduplican dentro del mismo año y bloque de examen; las variantes A/B con texto diferente pueden contar separadamente. Las preguntas repetidas en años distintos sí cuentan. Se excluyen las reservas cuando están identificadas por un encabezado; en otros formatos pueden quedar incluidas. No se pondera por puntos. Las recopilaciones sin año se muestran aparte y cada archivo cuenta como una fuente. Para la aparición, cada modelo de examen con preguntas extraíbles cuenta una vez.</p><p>Los casos de desarrollo sin numeración u opciones que no se hayan podido identificar quedan fuera del cálculo. Consulta los originales antes de decidir qué temas estudiar.</p></details>
      </section>
      <h3 className="history-documents-heading">Documentos originales · {files.length}</h3>
      <FileList files={files}/>
      </details>
    </div>
  </details>;
}

export function historicalDocumentCount(subjectId: string) {
  const data = (historicalIndex as Record<string, HistoricalSubject>)[subjectId];
  return data ? data.exams.length + data.notes.length : 0;
}

export default function HistoricalMaterials({ subjectId }: { subjectId: string }) {
  const data = (historicalIndex as Record<string, HistoricalSubject>)[subjectId];
  return <>
    {data?.exams.length ? <ExamHistory key={subjectId} data={data}/> : <details className="campus-exam-guidelines history-block"><summary>Exámenes anteriores <span aria-hidden="true">+</span></summary><div><p>El ZIP de Fase I no incluye exámenes identificados para esta asignatura.</p></div></details>}
    <details className="campus-exam-guidelines history-block"><summary>Apuntes de la asignatura <span aria-hidden="true">+</span></summary><div className="history-content">{data?.notes.length ? <><p className="history-intro">Material de años anteriores · Comprueba su correspondencia con el temario actual.</p><FileList files={data.notes}/></> : <p>El ZIP de Fase I no incluye apuntes separados para esta asignatura. Puedes consultar la documentación del curso que aparece arriba.</p>}</div></details>
  </>;
}
