"use client";

import { useEffect, useRef, useState } from "react";
import Account, { PrivateDocumentLink } from "../account";
import { getCampusClient } from "../campus-client";
import "./quiz.css";

type Quiz = { name: string; subject: string; questions: { number: number; text: string; options: string[]; correct?: number; explanation?: string; solutionSource?: string }[] };
export default function HistoricalQuiz() {
  const [hash, setHash] = useState("");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<Record<number, string>>({});
  const setAnswer = (value: string) => { setAnswers(a => ({ ...a, [position]: value })); setFeedback(f => ({ ...f, [position]: "" })); };
  const [finished, setFinished] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const doc = new URLSearchParams(window.location.search).get("doc") || "";
    setHash(doc);
    const client = getCampusClient();
    if (!client) { setError("El acceso no está configurado."); setLoading(false); return; }
    let active = true;
    let controller: AbortController | undefined;
    const load = async () => {
      controller?.abort(); controller = new AbortController();
      const signal = controller.signal;
      setLoading(true); setError(""); setQuiz(null);
      try {
        const session = await client.auth.getSession();
        const response = await fetch(`/api/historical-quiz?doc=${encodeURIComponent(doc)}`, { signal, cache: "no-store", headers: session.data.session ? { Authorization: `Bearer ${session.data.session.access_token}` } : {} });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "No se pudo abrir el examen.");
        if (active && !signal.aborted) setQuiz(data);
      } catch (e) { if (active && !signal.aborted) setError(e instanceof Error ? e.message : "No se pudo abrir el examen."); }
      finally { if (active && !signal.aborted) setLoading(false); }
    };
    void load();
    // Defer outside the auth callback to avoid awaiting another auth operation inside it.
    const { data: { subscription } } = client.auth.onAuthStateChange(() => { queueMicrotask(() => { if (active) void load(); }); });
    return () => { active = false; controller?.abort(); subscription.unsubscribe(); };
  }, []);
  const change = (n: number) => { setPosition(n); requestAnimationFrame(() => heading.current?.focus()); };
  const answered = Object.values(answers).filter(a => a.trim()).length;
  const question = quiz?.questions[position];
  return <main className="old-quiz">
    <header><a href="/campus">← Volver al campus</a><Account/></header>
    <p className="old-quiz-eyebrow">Exámenes anteriores · Cuestionario</p>
    <h1>{quiz?.subject || "Examen anterior"}</h1>
    {loading ? <p role="status">Abriendo examen…</p> : error ? <div role="alert"><p>{error}</p><button onClick={() => window.dispatchEvent(new CustomEvent("campus-login"))}>Iniciar sesión</button></div> : quiz && question ? <>
      <p>{quiz.name}</p>
      <details className="old-quiz-source"><summary>Consultar el examen original y sus datos</summary><p>Consulta aquí los casos, tablas, imágenes y soluciones que incluya el archivo. La transcripción automática puede contener errores; el documento original es la referencia.</p><PrivateDocumentLink hash={hash}>Descargar original</PrivateDocumentLink></details>
      {finished ? <section aria-live="polite"><h2>Cuestionario terminado</h2><p>{answered} respondidas · {quiz.questions.length - answered} en blanco.</p><p>Contrasta tus respuestas con las soluciones del documento, si las incluye.</p><button onClick={() => setFinished(false)}>Revisar respuestas</button></section> : <>
        <p role="status">Pregunta {position + 1} de {quiz.questions.length} · {answered} respondidas</p>
        <progress value={position + 1} max={quiz.questions.length} aria-label="Progreso del cuestionario"/>
        <section className="old-question" aria-labelledby="old-question-title">
          <h2 id="old-question-title" tabIndex={-1} ref={heading}>{question.number}. {question.text}</h2>
          {question.options.length ? <div role="radiogroup" aria-labelledby="old-question-title">{question.options.map((option, i) => <label key={i} className={feedback[position] === "graded" && question.correct === i ? "is-correct" : feedback[position] === "graded" && answers[position] === String(i) ? "is-wrong" : answers[position] === String(i) ? "is-selected" : ""}><input type="radio" name={`question-${position}`} checked={answers[position] === String(i)} onChange={() => setAnswer(String(i))}/><span>{String.fromCharCode(65 + i)}. {option}</span></label>)}</div> : <><p>Respuesta escrita: el formato del original no permite separar opciones con fiabilidad.</p><textarea aria-label="Tu respuesta" rows={6} value={answers[position] || ""} onChange={e => setAnswer(e.target.value)}/></>}
          <div className="old-question-actions"><button className="old-blank" onClick={() => setAnswer("")}>Dejar en blanco</button><button onClick={() => setFeedback(f => ({ ...f, [position]: !answers[position]?.trim() ? "Elige una respuesta antes de corregir." : question.correct === undefined ? "Esta pregunta aún no tiene una solución revisada. Puedes consultar el documento original." : "graded" }))}>Corregir</button></div>
          {feedback[position] ? <div role="status" className={feedback[position] === "graded" ? Number(answers[position]) === question.correct ? "old-feedback is-correct" : "old-feedback is-wrong" : "old-feedback"}>{feedback[position] === "graded" ? <><strong>{Number(answers[position]) === question.correct ? "Correcto" : "Incorrecto"}</strong><p>Respuesta correcta: {String.fromCharCode(65 + question.correct!)}. {question.options[question.correct!]}</p><p>{question.explanation}</p><small>{question.solutionSource}</small></> : feedback[position]}</div> : null}
        </section>
        <nav aria-label="Navegar entre preguntas"><button disabled={!position} onClick={() => change(position - 1)}>← Anterior</button>{position < quiz.questions.length - 1 ? <button onClick={() => change(position + 1)}>Siguiente →</button> : <button onClick={() => setFinished(true)}>Finalizar</button>}</nav>
      </>}
    </> : null}
  </main>;
}
