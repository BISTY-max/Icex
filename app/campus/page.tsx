"use client";

import { useState } from "react";
import data from "./data.json";
import "./campus.css";

const sections = ["Resumen", "Asignaturas", "Tareas", "Calendario", "Biblioteca", "Guías"];
const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const dateLabel = (date: string) => new Date(date).toLocaleString("es-ES", {timeZone:"Europe/Madrid",day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"});
const dated = data.tasks.filter(t=>t.due).sort((a,b)=>a.due.localeCompare(b.due));
const ext = (url: string) => decodeURIComponent(url.split("?")[0].split(".").pop()||"DOC").toUpperCase();

function External({href,children,className=""}:{href:string;children:React.ReactNode;className?:string}) {
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}<span aria-hidden="true"> ↗</span></a>;
}

export default function Campus() {
  const [section,setSection]=useState("Resumen");
  const [query,setQuery]=useState("");
  const [phase,setPhase]=useState("Todas");
  const [month,setMonth]=useState("2026-11");
  const matches=(text:string)=>normalize(text).includes(normalize(query));
  const subjects=data.subjects.filter(s=>(phase==="Todas"||s.phase===phase)&&matches(s.title+" "+s.resources.map(r=>r.title).join(" ")));
  const files=data.files.filter(f=>matches(f.text+" "+f.subject));
  const tasks=data.tasks.filter(t=>matches(t.title+" "+t.subject));
  const [year,monthNumber]=month.split("-").map(Number);
  const offset=(new Date(year,monthNumber-1,1).getDay()+6)%7;
  const days=new Date(year,monthNumber,0).getDate();

  return <div className="campus">
    <aside className="campus-sidebar">
      <a href="/campus" className="campus-logo"><img src="/icex-campus.svg" alt="ICEX Campus" width="210" height="43" /></a>
      <div className="campus-course"><span className="campus-overline">MI ESPACIO ACADÉMICO</span><strong>MBA in International<br/>Management</strong><span>Promoción 2026 — 2027</span></div>
      <nav aria-label="Secciones del campus">{sections.map((name,i)=><button key={name} type="button" className={section===name?"active":""} onClick={()=>{setSection(name);setQuery("");}} aria-current={section===name?"page":undefined}><span className="nav-number">0{i+1}</span>{name}<span className="nav-arrow" aria-hidden="true">↗</span></button>)}</nav>
      <div className="campus-sidebar-bottom"><External href="https://lms.icex.es/course/view.php?id=862">Abrir campus oficial</External><a href="/">← Volver a mi web</a><span>Consulta personal · ICEX</span></div>
    </aside>

    <div className="campus-main">
      <header className="campus-top"><span>Máster Universitario en Gestión Internacional de la Empresa</span><span className="campus-year">CURSO 26/27 <i/></span></header>
      <main className="campus-content" id="contenido">
        <div className="campus-page-heading"><div><p className="campus-overline">CAMPUS / {section.toUpperCase()}</p><h1>{section==="Resumen"?<>Tu próximo<br/><em>horizonte.</em></>:section}</h1><p className="campus-subtitle">{section==="Resumen"?"Asignaturas, materiales y entregas. Todo tu máster, en un solo lugar.":section==="Biblioteca"?"Documentación organizada por asignatura. Accede con tu sesión de ICEX.":section==="Calendario"?"Fechas de entrega publicadas en el curso · Horario de Madrid.":"Información del curso 2026–2027, organizada para consultar con facilidad."}</p></div><div className="campus-edition"><span>ICEX</span><span>2026<br/>2027</span><div className="edition-line"/></div></div>

        {section==="Resumen"?<>
          <div className="campus-stats">{[[data.subjects.length,"ASIGNATURAS VISIBLES"],[data.files.length,"DOCUMENTOS ENLAZADOS"],[data.tasks.length,"TAREAS DEL CURSO"],[dated.length,"PLAZOS PUBLICADOS"]].map(([n,label])=><div key={label}><strong>{n}</strong><span>{label}</span></div>)}</div>
          <div className="campus-summary-grid"><section className="campus-next"><span className="campus-overline">PRÓXIMA ENTREGA PUBLICADA</span><div className="campus-next-date"><strong>03</strong><div>NOVIEMBRE<span>2026 · 10:30 h</span></div></div><h2>Póster Académico</h2><p>Sector Exterior y Políticas Unión Europea</p><External className="campus-button" href="https://lms.icex.es/mod/assign/view.php?id=53839">Ver tarea en ICEX</External></section><section className="campus-upcoming"><div className="campus-section-heading"><h2>En el horizonte</h2><button onClick={()=>setSection("Calendario")}>Ver calendario ↗</button></div>{dated.map(t=><External key={t.id} href={t.url} className="campus-event-row"><time dateTime={t.due}><strong>{new Date(t.due).getUTCDate()}</strong><span>{new Date(t.due).toLocaleString("es-ES",{month:"short",timeZone:"Europe/Madrid"})}</span></time><div><strong>{t.title}</strong><small>{t.subject}</small></div></External>)}</section></div>
          <div className="campus-section-heading"><div><p className="campus-overline">APRENDER, CONECTAR, AVANZAR</p><h2>Tu plan de estudios</h2></div><button onClick={()=>setSection("Asignaturas")}>Ver las {data.subjects.length} asignaturas ↗</button></div><div className="campus-preview-grid">{data.subjects.filter(s=>s.phase==="Fase I").slice(0,3).map((s,i)=><button key={s.id} className="campus-subject-preview" onClick={()=>{setSection("Asignaturas");setQuery(s.title);}}><span>FASE I <b>0{i+1}</b></span><h3>{s.title}</h3><span>{s.resources.flatMap(r=>r.files).length} documentos <b>↗</b></span></button>)}</div>
        </>:null}

        {["Asignaturas","Tareas","Biblioteca"].includes(section)?<div className="campus-tools"><label className="campus-search"><span aria-hidden="true">⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar asignatura, tarea o documento…" aria-label="Buscar contenido"/></label>{section==="Asignaturas"?<select aria-label="Filtrar por fase" value={phase} onChange={e=>setPhase(e.target.value)}><option>Todas</option><option>Fase I</option><option>Transversales</option></select>:<span>{section==="Tareas"?tasks.length:files.length} resultados</span>}</div>:null}

        {section==="Asignaturas"?<><div className="campus-subjects">{subjects.map((s,i)=><details key={s.id} className="campus-subject"><summary><span className="campus-subject-index">{String(i+1).padStart(2,"0")}</span><div><span className="campus-overline">{s.phase}</span><h2>{s.title}</h2><small>{s.resources.flatMap(r=>r.files).length} documentos · {s.resources.filter(r=>r.kind==="Tarea").length} tareas</small></div><span className="campus-expand" aria-hidden="true">+</span></summary><div className="campus-resource-list">{s.resources.map(r=><div className="campus-resource" key={r.id}><span className="campus-pill">{r.kind}</span>{r.url?<External href={r.url}>{r.title}</External>:<span>{r.title}</span>}{r.note?<small>{r.note.split('Restringido')[1]}</small>:null}{r.files.length?<div className="campus-file-list">{r.files.map(f=><External key={f.url} href={f.url}>{f.text}</External>)}</div>:null}</div>)}</div></details>)}</div>{!subjects.length?<p className="campus-empty">No hay asignaturas que coincidan con tu búsqueda.</p>:null}<div className="campus-note">Las fases II, III y las optativas figuran en las guías. Sus secciones de actividades aún no están visibles en este curso.</div></>:null}

        {section==="Tareas"?<div className="campus-task-list">{tasks.map(t=><article key={t.id} className="campus-task"><div><p className="campus-overline">{t.subject}</p><h2>{t.title}</h2><p>{t.due?dateLabel(t.due)+" h":"Sin fecha límite publicada en la ficha consultada"}</p>{t.description?<details><summary>Ver indicaciones</summary><p className="campus-description">{t.description}</p></details>:null}</div><External href={t.url} className="campus-outline-button">Abrir tarea</External></article>)}{!tasks.length?<p className="campus-empty">No hay tareas que coincidan con tu búsqueda.</p>:null}</div>:null}

        {section==="Calendario"?<><div className="campus-tools"><label>Mes <input type="month" aria-label="Mes del calendario" value={month} min="2026-09" max="2027-12" onChange={e=>{if(e.target.value)setMonth(e.target.value);}}/></label><a className="campus-outline-button" href="/entregas-icex.ics" download>Descargar entregas .ics ↓</a></div><div className="campus-calendar"><div className="campus-weekdays">{["LUN","MAR","MIÉ","JUE","VIE","SÁB","DOM"].map(d=><span key={d}>{d}</span>)}</div><div className="campus-days">{Array.from({length:offset},(_,i)=><div key={'blank'+i} className="campus-day blank"/>)}{Array.from({length:days},(_,i)=>{const date=month+'-'+String(i+1).padStart(2,'0');const events=dated.filter(t=>t.due.startsWith(date));return <div key={date} className={'campus-day '+(events.length?'has-event':'')}><span>{i+1}</span>{events.map(t=><External key={t.id} href={t.url}>{t.title}<small>{dateLabel(t.due).split(',').pop()}</small></External>)}</div>;})}</div></div><div className="campus-note">Incluye los {dated.length} plazos de entrega publicados en el curso al {data.updated}. Algunas fechas están en los textos de las tareas y no aparecen como eventos en Moodle.</div><div className="campus-task-list">{dated.map(t=><div className="campus-task" key={t.id}><div><span className="campus-overline">{dateLabel(t.due)} h</span><h2>{t.title}</h2><p>{t.subject}</p></div><External href={t.url}>Ver tarea</External></div>)}</div></>:null}

        {section==="Biblioteca"?<div className="campus-library">{files.map(f=><External key={f.url} href={f.url} className="campus-file"><span className="campus-file-type">{ext(f.url)}</span><div><strong>{f.text}</strong><small>{f.subject}</small></div></External>)}{!files.length?<p className="campus-empty">No hay documentos que coincidan con tu búsqueda.</p>:null}</div>:null}

        {section==="Guías"?<><div className="campus-guide-grid">{data.guides.map((g,i)=><External key={g.url} href={g.url} className="campus-guide"><span className="campus-overline">DOCUMENTO {String(i+1).padStart(2,'0')} · PDF</span><h2>{g.text}</h2><span>Consultar en ICEX ↗</span></External>)}</div><div className="campus-section-heading"><h2>Primeros pasos</h2></div>{data.orientation.map(o=><section key={o.title} className="campus-task"><div><h2>{o.title}</h2>{o.resources.map(r=><p key={r.url}><External href={r.url}>{r.text.replace('Paquete SCORM','').replace('Cuestionario','')}</External></p>)}</div></section>)}</>:null}
        <footer className="campus-footer"><span>Consulta del {data.updated} · Información importada de ICEX</span><span>Los materiales requieren acceso al campus oficial. <External href="https://lms.icex.es/course/view.php?id=862">Ver fuente</External></span></footer>
      </main>
    </div>
  </div>;
}
