"use client";

import { useEffect, useState } from "react";
import CalendarPanel from "./calendar";
import calendarEvents from "./calendar-events.json";
import data from "./data.json";
import syncStatus from "./sync-status.json";
import documentIndex from "./document-index.json";
import "./campus.css";

const sections = ["Resumen", "Asignaturas", "Tareas", "Calendario", "Biblioteca", "Guías"];
const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const dateLabel = (date: string) => new Date(date).toLocaleString("es-ES", {timeZone:"Europe/Madrid",day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"});
const syncDate = (value:string) => new Date(value.length===10?value+"T12:00:00Z":value).toLocaleDateString("es-ES",{timeZone:"Europe/Madrid",day:"numeric",month:"long",year:"numeric"});
const ext = (url: string) => decodeURIComponent(url.split("?")[0].split(".").pop()||"DOC").toUpperCase();

function External({href,children,className=""}:{href:string;children:React.ReactNode;className?:string}) {
  const stored=(documentIndex as Record<string,string>)[href.split("?")[0]];
  const destination=stored?"/campus/documentos?doc="+stored:href;
  return <a className={className} href={destination} target="_blank" rel="noopener noreferrer">{children}<span aria-hidden="true"> ↗</span></a>;
}

export default function Campus() {
  const [section,setSection]=useState("Resumen");
  const [query,setQuery]=useState("");
  const [phase,setPhase]=useState("Todas");
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
  const tasks=data.tasks.filter(t=>matches(t.title+" "+t.subject));

  return <div className="campus">
    <aside className="campus-sidebar">
      <a href="/campus" className="campus-logo"><img src="/icex-campus.svg" alt="ICEX Campus" width="210" height="43" /></a>
      <div className="campus-course"><span className="campus-overline">MI ESPACIO ACADÉMICO</span><strong>MBA in International<br/>Management</strong><span>Promoción 2026 — 2027</span></div>
      <nav aria-label="Secciones del campus">{sections.map((name,i)=><button key={name} type="button" className={section===name?"active":""} onClick={()=>{setSection(name);setQuery("");}} aria-current={section===name?"page":undefined}><span className="nav-number">0{i+1}</span>{name}<span className="nav-arrow" aria-hidden="true">↗</span></button>)}</nav>
      <div className="campus-sidebar-bottom"><a href="/campus/documentos">Mi biblioteca privada ↗</a><External href="https://lms.icex.es/course/view.php?id=862">Abrir campus oficial</External><a href="/">← Volver a mi web</a><span>Consulta personal · ICEX</span></div>
    </aside>

    <div className="campus-main">
      <main className="campus-content" id="contenido">
        {section!=="Resumen"?<div className="campus-page-heading"><div><p className="campus-overline">CAMPUS / {section.toUpperCase()}</p><h1>{section==="Resumen"?<>Tu próximo<br/><em>horizonte.</em></>:section}</h1><p className="campus-subtitle">{section==="Resumen"?"Asignaturas, materiales y entregas. Todo tu máster, en un solo lugar.":section==="Biblioteca"?"Documentación organizada por asignatura. Accede con tu sesión de ICEX.":section==="Calendario"?"Clases, exámenes, entregas y revisiones · Horario de Madrid.":"Información del curso 2026–2027, organizada para consultar con facilidad."}</p></div><div className="campus-edition"><span>ICEX</span><span>2026<br/>2027</span><div className="edition-line"/></div></div>:null}

        {section==="Resumen"?<>
          <div className="campus-quick-grid">{[{label:"Próximo evento",events:nextDayEvents,target:"Calendario",action:"Ver calendario"},{label:"Próximas tareas",events:nextDayTasks,target:"Tareas",action:"Ver tareas"}].map(card=><section className="campus-quick-card" key={card.label} aria-label={card.label}><h2 className="campus-quick-heading">{card.label}</h2>{card.events.length?<div className="campus-quick-items">{card.events.map(event=><article className="campus-quick-item" key={event.id}><h3>{event.title}</h3><p className="campus-quick-date">{previewDate(event)}{!event.allDay&&event.kind!=="entrega"?" – "+new Date(event.end).toLocaleTimeString("es-ES",{timeZone:"Europe/Madrid",hour:"2-digit",minute:"2-digit"})+" h":""}</p></article>)}</div>:<p className="campus-quick-empty">{now===null?"Consultando calendario…":"No hay próximas fechas publicadas."}</p>}<button onClick={()=>setSection(card.target)}>{card.action} ↗</button></section>)}</div>

          <div className="campus-section-heading"><div><p className="campus-overline">APRENDER, CONECTAR, AVANZAR</p><h2>Tu plan de estudios</h2></div><button onClick={()=>setSection("Asignaturas")}>Ver las {data.subjects.length} asignaturas ↗</button></div><div className="campus-preview-grid">{data.subjects.filter(s=>s.phase==="Fase I").slice(0,3).map((s,i)=><button key={s.id} className="campus-subject-preview" onClick={()=>{setSection("Asignaturas");setQuery(s.title);}}><span>FASE I <b>0{i+1}</b></span><h3>{s.title}</h3><span>{s.resources.flatMap(r=>r.files).length} documentos <b>↗</b></span></button>)}</div>
        </>:null}

        {section!=="Calendario"?<div className="campus-note"><a href="/campus/documentos">Mi biblioteca privada ↗</a> · Tus 94 documentos y el logo guardados en Supabase. Entra con tu correo para descargarlos sin depender del LMS.</div>:null}
        {["Asignaturas","Tareas","Biblioteca"].includes(section)?<div className="campus-tools"><label className="campus-search"><span aria-hidden="true">⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar asignatura, tarea o documento…" aria-label="Buscar contenido"/></label>{section==="Asignaturas"?<select aria-label="Filtrar por fase" value={phase} onChange={e=>setPhase(e.target.value)}><option>Todas</option><option>Fase I</option><option>Transversales</option></select>:<span>{section==="Tareas"?tasks.length:files.length} resultados</span>}</div>:null}

        {section==="Asignaturas"?<><div className="campus-subjects">{subjects.map((s,i)=><details key={s.id} className="campus-subject"><summary><span className="campus-subject-index">{String(i+1).padStart(2,"0")}</span><div><span className="campus-overline">{s.phase}</span><h2>{s.title}</h2><small>{s.resources.flatMap(r=>r.files).length} documentos · {s.resources.filter(r=>r.kind==="Tarea").length} tareas</small></div><span className="campus-expand" aria-hidden="true">+</span></summary><div className="campus-resource-list">{s.resources.map(r=><div className="campus-resource" key={r.id}><span className="campus-pill">{r.kind}</span>{r.url?<External href={r.url}>{r.title}</External>:<span>{r.title}</span>}{r.note?<small>{r.note.split('Restringido')[1]}</small>:null}{r.files.length?<div className="campus-file-list">{r.files.map(f=><External key={f.url} href={f.url}>{f.text}</External>)}</div>:null}</div>)}</div></details>)}</div>{!subjects.length?<p className="campus-empty">No hay asignaturas que coincidan con tu búsqueda.</p>:null}<div className="campus-note">Las fases II, III y las optativas figuran en las guías. Sus secciones de actividades aún no están visibles en este curso.</div></>:null}

        {section==="Tareas"?<div className="campus-task-list">{tasks.map(t=><article key={t.id} className="campus-task"><div><p className="campus-overline">{t.subject}</p><h2>{t.title}</h2><p>{t.due?dateLabel(t.due)+" h":"Sin fecha límite publicada en la ficha consultada"}</p>{t.description?<details><summary>Ver indicaciones</summary><p className="campus-description">{t.description}</p></details>:null}</div><External href={t.url} className="campus-outline-button">Abrir tarea</External></article>)}{!tasks.length?<p className="campus-empty">No hay tareas que coincidan con tu búsqueda.</p>:null}</div>:null}

        {section==="Calendario"?<CalendarPanel/>:null}

        {section==="Biblioteca"?<div className="campus-library">{files.map(f=><External key={f.url} href={f.url} className="campus-file"><span className="campus-file-type">{ext(f.url)}</span><div><strong>{f.text}</strong><small>{f.subject}</small></div></External>)}{!files.length?<p className="campus-empty">No hay documentos que coincidan con tu búsqueda.</p>:null}</div>:null}

        {section==="Guías"?<><div className="campus-guide-grid">{data.guides.map((g,i)=><External key={g.url} href={g.url} className="campus-guide"><span className="campus-overline">DOCUMENTO {String(i+1).padStart(2,'0')} · PDF</span><h2>{g.text}</h2><span>Consultar en ICEX ↗</span></External>)}</div><div className="campus-section-heading"><h2>Primeros pasos</h2></div>{data.orientation.map(o=><section key={o.title} className="campus-task"><div><h2>{o.title}</h2>{o.resources.map(r=><p key={r.url}><External href={r.url}>{r.text.replace('Paquete SCORM','').replace('Cuestionario','')}</External></p>)}</div></section>)}</>:null}
        <footer className="campus-footer"><span className="campus-sync-status">Última revisión: {syncDate(syncStatus.lastReviewedAt)}<br/>Última actualización: {syncDate(syncStatus.lastUpdatedAt)}<br/>Próxima revisión programada: {syncDate(syncStatus.nextReviewAt)} · 09:00 h (Madrid)<small>Revisión semanal · Requiere Codex disponible y sesión de ICEX activa.</small></span><span>Los materiales requieren acceso al campus oficial. <External href="https://lms.icex.es/course/view.php?id=862">Ver fuente</External></span></footer>
      </main>
    </div>
  </div>;
}
