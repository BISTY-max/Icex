"use client";

import { useEffect, useState } from "react";
import CalendarPanel from "./calendar";
import Notes from "./notes";
import HistoricalMaterials, { historicalDocumentCount } from "./historical-materials";
import Account, { PrivateDocumentLink } from "./account";
import calendarEvents from "./calendar-events.json";
import data from "./data.json";
import syncStatus from "./sync-status.json";
import examGuidelines from "./exam-guidelines.json";
import aiExams from "./ai-exams-index.json";
import taskDocuments from "./task-documents.json";
import TaskDownload from "./task-download";
import documentIndex from "./document-index.json";
import "./campus.css";

const sections = ["Resumen", "Asignaturas", "Tareas", "Calendario", "Biblioteca", "Guías"];
const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const dateLabel = (date: string) => new Date(date).toLocaleString("es-ES", {timeZone:"Europe/Madrid",day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"});
const syncDate = (value:string) => new Date(value.length===10?value+"T12:00:00Z":value).toLocaleDateString("es-ES",{timeZone:"Europe/Madrid",day:"numeric",month:"long",year:"numeric"});
const subjectExamIds:Record<string,string[]>={
  "module-53392":["exam-image-research-i"],
  "subject-investigacion-comercial-ii":["exam-image-research-ii"],
  "module-53450":["exam-image-sector"],
  "module-53378":["exam-image-direccion"],
  "module-53395":["exam-image-marketing"],
  "module-53445":["exam-image-skills"],
  "module-53441":["exam-image-social"],
  "module-53375":["class-CECO0000596831","exam-image-economia-final"],
  "module-53416":["class-CECO0000596838","exam-image-contabilidad-final"],
  "module-53428":["academic-escritura"],
  "module-53592":["academic-estrategia"],
  "module-53603":["academic-paises"]
};
const ext = (url: string) => decodeURIComponent(url.split("?")[0].split(".").pop()||"DOC").toUpperCase();

function External({href,children,className=""}:{href:string;children:React.ReactNode;className?:string}) {
  const stored=(documentIndex as Record<string,string>)[href.split("?")[0]];
  if(stored)return <PrivateDocumentLink hash={stored} className={className}>{children}</PrivateDocumentLink>;
  const destination=stored?"/campus/documentos?doc="+stored:href;
  return <a className={className} href={destination} target="_blank" rel="noopener noreferrer">{children}<span aria-hidden="true"> ↗</span></a>;
}

const isPracticeExam=(name:string)=>/^(?:ex(?:[\s_.-]|$)|ex[aá]menes?\b)/i.test(name.trim());
function SubjectResources({subject}:{subject:typeof data.subjects[number]}){
  const exams=subject.resources.flatMap(resource=>resource.files).filter(file=>isPracticeExam(file.text));
  const renderResource=(resource:typeof subject.resources[number])=>{
    const files=resource.files.filter(file=>!isPracticeExam(file.text));
    return <div className="campus-resource" key={resource.id}><span className="campus-pill">{resource.kind}</span><span>{resource.title}</span>{resource.note?<small>{resource.note.split('Restringido')[1]}</small>:null}{files.length?<div className="campus-file-list">{files.map(file=><External key={file.url} href={file.url}>{file.text}</External>)}</div>:null}</div>;
  };
  return <div className="campus-resource-list">{subject.resources.filter(resource=>resource.kind==="Documentación").map(renderResource)}{exams.length?<section className="campus-practice-exams" aria-label="Exámenes de prueba"><h3>Exámenes de prueba</h3><div className="campus-file-list">{exams.map(file=><External key={file.url} href={file.url}>{file.text}</External>)}</div></section>:null}{subject.resources.filter(resource=>resource.kind!=="Documentación").map(renderResource)}</div>;
}

function ExamGuidelines({subjectId}:{subjectId:string}){
  const guide=(examGuidelines as Record<string,{pages:number[];items:{label:string;text:string}[];note:string}>)[subjectId];
  if(!guide)return null;
  return <details className="campus-exam-guidelines"><summary>Metodología de examen <span aria-hidden="true">+</span></summary><div><p className="campus-overline">PAUTAS DEL EXAMEN · CONVOCATORIA ORDINARIA</p>{guide.items.length?<dl>{guide.items.map(item=><div key={item.label}><dt>{item.label}</dt><dd>{item.text}</dd></div>)}</dl>:null}{guide.note?<p className="exam-guidelines-note">{guide.note}</p>:null}{guide.pages.length?<small>Fuente: Anexo 1 · Asignaturas Fase 1, curso 2026–2027 · Páginas {guide.pages.join(", ")}. <External href={data.guides[1].url}>Consultar guía</External></small>:null}</div></details>;
}

function AIExams({subjectId}:{subjectId:string}){
  const exams=(aiExams as Record<string,{scope:string;models:{title:string;url:string;testCount:number;openCount:number}[]}>)[subjectId];
  return <details className="campus-exam-guidelines campus-ai-exams"><summary>Exámenes IA <span className="campus-ai-arrow" aria-hidden="true">▸</span></summary><div>{exams?<><p className="exam-guidelines-note">Práctica generada con IA · No oficial</p><div className="campus-ai-models">{exams.models.map(model=><a key={model.url} href={model.url}><span>{model.title} <span aria-hidden="true">→</span></span><small>{[model.testCount?`${model.testCount} preguntas tipo test`:null,model.openCount?`${model.openCount} ${model.openCount===1?"ejercicio de desarrollo":"ejercicios de desarrollo"}`:null].filter(Boolean).join(" · ")}</small></a>)}</div><p className="exam-guidelines-note">{exams.scope}</p><small>Abre un modelo, responde al cuestionario y corrige el test al terminar. Los ejercicios escritos incluyen rúbricas para autocorregirte.</small></>:<p className="exam-guidelines-note">Todavía no hay modelos: falta temario suficiente o una metodología de evaluación específica.</p>}</div></details>;
}

export default function Campus() {
  const [section,setSection]=useState("Resumen");
  const [query,setQuery]=useState("");
  const [phase,setPhase]=useState("Todas");
  const [taskDateFilter,setTaskDateFilter]=useState("todas");
  const [now,setNow]=useState<number|null>(null);
  useEffect(()=>{const update=()=>setNow(Date.now());update();const timer=setInterval(update,60000);return()=>clearInterval(timer);},[]);
  const today=now===null?"":new Date(now).toLocaleDateString("en-CA",{timeZone:"Europe/Madrid"});
  const upcoming=now===null?[]:calendarEvents.filter(event=>event.allDay?event.start>=today:new Date(event.start).getTime()>=now).sort((a,b)=>a.start.localeCompare(b.start));
  const nextEvent=upcoming[0];
  const nextTask=upcoming.find(event=>event.kind==="entrega");
  const nextDayEvents=nextEvent?calendarEvents.filter(event=>event.start.slice(0,10)===nextEvent.start.slice(0,10)).sort((a,b)=>a.start.localeCompare(b.start)):[];
  const nextDayTasks=nextTask?calendarEvents.filter(event=>event.kind==="entrega"&&event.start.slice(0,10)===nextTask.start.slice(0,10)).sort((a,b)=>a.start.localeCompare(b.start)):[];
  const previewDate=(event:typeof calendarEvents[number])=>new Date(event.allDay?event.start+"T12:00:00Z":event.start).toLocaleDateString("es-ES",{timeZone:"Europe/Madrid",weekday:"long",day:"numeric",month:"long"})+(event.allDay?" · Sin hora indicada":" · "+new Date(event.start).toLocaleTimeString("es-ES",{timeZone:"Europe/Madrid",hour:"2-digit",minute:"2-digit"})+" h");
  useEffect(()=>{if(window.location.hash==="#calendario")setSection("Calendario");},[]);
  const matches=(text:string)=>normalize(text).includes(normalize(query));
  const subjects=data.subjects.filter(s=>(phase==="Todas"||s.phase===phase)&&matches(s.title+" "+s.resources.map(r=>r.title).join(" ")));
  const files=data.files.filter(f=>matches(f.text+" "+f.subject));
  const tasks=data.tasks.filter(t=>matches(t.title+" "+t.subject)&&(taskDateFilter!=="sin-fecha"||!t.due)).sort((a,b)=>{
    if(taskDateFilter!=="proximas"&&taskDateFilter!=="recientes")return 0;
    if(!a.due)return b.due?1:0;
    if(!b.due)return -1;
    const difference=new Date(a.due).getTime()-new Date(b.due).getTime();
    return taskDateFilter==="recientes"?-difference:difference;
  });

  const studyPlan=data.subjects.map((subject,index)=>({subject,index,exam:calendarEvents.filter(event=>(subjectExamIds[subject.id]||[]).includes(event.id)&&(event.allDay?event.end>today:now!==null&&new Date(event.end).getTime()>now)).sort((a,b)=>a.start.localeCompare(b.start))[0]})).sort((a,b)=>a.exam&&b.exam?a.exam.start.localeCompare(b.exam.start):a.exam?-1:b.exam?1:a.index-b.index);

  return <div className="campus">
    <aside className="campus-sidebar">
      <div className="campus-brand"><a href="/campus" className="campus-logo"><img src="/icex-campus.svg" alt="ICEX Campus" width="210" height="43" /></a><div className="campus-brand-actions"><Notes/><Account/></div></div>
      <div className="campus-course"><span className="campus-overline">MI ESPACIO ACADÉMICO</span><strong>MBA in International<br/>Management</strong><span>Promoción 2026 — 2027</span></div>
      <nav aria-label="Secciones del campus">{sections.map((name,i)=><button key={name} type="button" className={section===name?"active":""} onClick={()=>{setSection(name);setQuery("");}} aria-current={section===name?"page":undefined}><span className="nav-number">0{i+1}</span>{name}<span className="nav-arrow" aria-hidden="true">↗</span></button>)}</nav>
      <div className="campus-sidebar-bottom"><a href="/campus/documentos">Mi biblioteca privada ↗</a><External href="https://lms.icex.es/course/view.php?id=862">Abrir campus oficial</External><a href="/">← Volver a mi web</a><span>Consulta personal · ICEX</span></div>
    </aside>

    <div className="campus-main">
      <main className="campus-content" id="contenido">
        {section!=="Resumen"?<div className="campus-page-heading"><div><p className="campus-overline">CAMPUS / {section.toUpperCase()}</p><h1>{section==="Resumen"?<>Tu próximo<br/><em>horizonte.</em></>:section}</h1></div><div className="campus-edition"><span>ICEX</span><span>2026<br/>2027</span><div className="edition-line"/></div></div>:null}

        {section==="Resumen"?<>
          <div className="campus-quick-grid">{[{label:"Próximas clases/exámenes",events:nextDayEvents,target:"Calendario",action:"Ver calendario"},{label:"Próximas entregas",events:nextDayTasks,target:"Tareas",action:"Ver tareas"}].map(card=><section className="campus-quick-card" key={card.label} aria-label={card.label}><h2 className="campus-quick-heading">{card.label}</h2>{card.events.length?<div className="campus-quick-items">{card.events.map(event=><article className="campus-quick-item" key={event.id}><h3>{event.title}</h3><p className="campus-quick-date">{previewDate(event)}{!event.allDay&&event.kind!=="entrega"?" – "+new Date(event.end).toLocaleTimeString("es-ES",{timeZone:"Europe/Madrid",hour:"2-digit",minute:"2-digit"})+" h":""}</p></article>)}</div>:<p className="campus-quick-empty">{now===null?"Consultando calendario…":"No hay próximas fechas publicadas."}</p>}<button onClick={()=>setSection(card.target)}>{card.action} ↗</button></section>)}</div>

          <div className="campus-section-heading"><div><p className="campus-overline">APRENDER, CONECTAR, AVANZAR</p><h2>Tu plan de estudios</h2></div><button onClick={()=>setSection("Asignaturas")}>Ver las {data.subjects.length} asignaturas ↗</button></div><div className="campus-preview-grid">{studyPlan.filter(item=>item.exam).slice(0,5).map(({subject:s,exam})=><article key={s.id} className="campus-study-card"><span className="campus-overline">{s.phase}</span><h3><button onClick={()=>{setSection("Asignaturas");setQuery(s.title);}}>{s.title}</button></h3><p className="campus-study-exam">{exam?<>Examen · {new Date(exam.allDay?exam.start+"T12:00:00Z":exam.start).toLocaleDateString("es-ES",{timeZone:"Europe/Madrid",day:"numeric",month:"long",year:"numeric"})}{exam.allDay?" · Hora no indicada":" · "+new Date(exam.start).toLocaleTimeString("es-ES",{timeZone:"Europe/Madrid",hour:"2-digit",minute:"2-digit"})+" h"}</>:"Examen · Sin próxima fecha confirmada"}</p>{s.resources.flatMap(r=>r.files).length?<details className="campus-study-documents"><summary>{s.resources.flatMap(r=>r.files).length} documentos</summary><div>{s.resources.flatMap(r=>r.files).map(f=><External key={f.url} href={f.url}>{f.text}</External>)}</div></details>:<span className="campus-study-empty">Sin documentos publicados</span>}</article>)}</div>
        </>:null}

        {["Asignaturas","Tareas","Biblioteca"].includes(section)?<div className="campus-tools"><label className="campus-search"><span aria-hidden="true">⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar asignatura, tarea o documento…" aria-label="Buscar contenido"/></label>{section==="Asignaturas"?<select aria-label="Filtrar por fase" value={phase} onChange={e=>setPhase(e.target.value)}><option>Todas</option><option>Fase I</option><option>Transversales</option></select>:<span>{section==="Tareas"?tasks.length:files.length} resultados</span>}</div>:null}

        {section==="Asignaturas"?<><div className="campus-subjects">{subjects.map((s,i)=><details key={s.id} className="campus-subject"><summary><span className="campus-subject-index">{String(i+1).padStart(2,"0")}</span><div><span className="campus-overline">{s.phase}</span><h2>{s.title}</h2><small>{s.resources.flatMap(r=>r.files).length} documentos del curso{historicalDocumentCount(s.id)?` · ${historicalDocumentCount(s.id)} históricos`:""} · {s.resources.filter(r=>r.kind==="Tarea").length} tareas</small></div><span className="campus-expand" aria-hidden="true">+</span></summary><SubjectResources subject={s}/><HistoricalMaterials subjectId={s.id}/><AIExams subjectId={s.id}/><ExamGuidelines subjectId={s.id}/></details>)}</div>{!subjects.length?<p className="campus-empty">No hay asignaturas que coincidan con tu búsqueda.</p>:null}<div className="campus-note">Las fases II, III y las optativas figuran en las guías. Sus secciones de actividades aún no están visibles en este curso.</div></>:null}

        {section==="Tareas"?<div className="campus-task-date-filter"><label htmlFor="task-date-filter">Fecha de entrega</label><select id="task-date-filter" value={taskDateFilter} onChange={e=>setTaskDateFilter(e.target.value)}><option value="todas">Todas las tareas</option><option value="proximas">Entrega más próxima primero</option><option value="recientes">Entrega más reciente primero</option><option value="sin-fecha">Sin fecha límite</option></select></div>:null}

        {section==="Tareas"?<div className="campus-task-list">{tasks.map(t=><article key={t.id} className="campus-task"><div><p className="campus-overline">{t.subject}</p><h2>{t.title}</h2><p>{t.due?dateLabel(t.due)+" h":"Sin fecha límite publicada en la ficha consultada"}</p>{t.description?<details><summary>Ver indicaciones</summary><p className="campus-description">{t.description}</p></details>:null}</div>{t.id in taskDocuments?<TaskDownload documents={(taskDocuments as Record<string,{sha256:string;name:string}[]>)[t.id]}/>:<External href={t.url} className="campus-outline-button">Abrir tarea</External>}</article>)}{!tasks.length?<p className="campus-empty">No hay tareas que coincidan con tu búsqueda.</p>:null}</div>:null}

        {section==="Calendario"?<CalendarPanel/>:null}

        {section==="Biblioteca"?<div className="campus-library">{files.map(f=><External key={f.url} href={f.url} className="campus-file"><span className="campus-file-type">{ext(f.url)}</span><div><strong>{f.text}</strong><small>{f.subject}</small></div></External>)}{!files.length?<p className="campus-empty">No hay documentos que coincidan con tu búsqueda.</p>:null}</div>:null}

        {section==="Guías"?<><div className="campus-guide-grid">{data.guides.map((g,i)=><External key={g.url} href={g.url} className="campus-guide"><span className="campus-overline">DOCUMENTO {String(i+1).padStart(2,'0')} · PDF</span><h2>{g.text}</h2><span>Consultar en ICEX ↗</span></External>)}</div><div className="campus-section-heading"><h2>Primeros pasos</h2></div>{data.orientation.map(o=><section key={o.title} className="campus-task"><div><h2>{o.title}</h2>{o.resources.map(r=><p key={r.url}><External href={r.url}>{r.text.replace('Paquete SCORM','').replace('Cuestionario','')}</External></p>)}</div></section>)}</>:null}
        <footer className="campus-footer"><span className="campus-sync-status">Última revisión: {syncDate(syncStatus.lastReviewedAt)}<br/>Última actualización: {syncDate(syncStatus.lastUpdatedAt)}<br/>Próxima revisión programada: {syncDate(syncStatus.nextReviewAt)} · 09:00 h (Madrid)<small>Revisión semanal · Requiere Codex disponible y sesión de ICEX activa.</small></span><span>Los materiales requieren acceso al campus oficial. <External href="https://lms.icex.es/course/view.php?id=862">Ver fuente</External></span></footer>
      </main>
    </div>
  </div>;
}
