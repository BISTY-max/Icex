"use client";

import { useEffect, useRef, useState } from "react";
import importedEvents from "./calendar-events.json";
import "./calendar.css";

type Event = typeof importedEvents[number];
const labels:Record<string,string>={clase:"Clases",examen:"Exámenes",entrega:"Entregas",notas:"Notas",revision:"Revisiones",defensa:"Defensas TFM"};
const singular:Record<string,string>={clase:"Clase",examen:"Examen",entrega:"Entrega",notas:"Publicación de notas",revision:"Revisión",defensa:"Defensa TFM"};
const time=(value:string)=>new Date(value).toLocaleTimeString("es-ES",{timeZone:"Europe/Madrid",hour:"2-digit",minute:"2-digit"});
const dayLabel=(value:string)=>new Date(value.slice(0,10)+"T12:00:00Z").toLocaleDateString("es-ES",{day:"numeric",month:"long",year:"numeric",timeZone:"Europe/Madrid"});
const lastDay=(event:Event)=>event.allDay?new Date(new Date(event.end+"T12:00:00Z").getTime()-86400000).toISOString().slice(0,10):event.end.slice(0,10);
const onDay=(event:Event,day:string)=>event.start.slice(0,10)<=day&&lastDay(event)>=day;
const dateRange=(event:Event)=>dayLabel(event.start)+(lastDay(event)!==event.start.slice(0,10)?" — "+dayLabel(lastDay(event)):"")+(event.allDay?" · Hora no indicada":" · "+time(event.start)+(event.kind==="entrega"?"":"–"+time(event.end))+" h");

export default function CalendarPanel(){
  const [month,setMonth]=useState("2026-10");
  const [today,setToday]=useState("");
  useEffect(()=>{
    const update=()=>setToday(new Date().toLocaleDateString("en-CA",{timeZone:"Europe/Madrid"}));
    update();
    const timer=setInterval(update,30000);
    document.addEventListener("visibilitychange",update);
    return()=>{clearInterval(timer);document.removeEventListener("visibilitychange",update);};
  },[]);
  const [kind,setKind]=useState("todas");
  const [view,setView]=useState("mes");
  const [selected,setSelected]=useState<Event|null>(null);
  const dialog=useRef<HTMLDialogElement>(null);
  const matching=importedEvents.filter(e=>kind==="todas"||e.kind===kind);
  const [year,number]=month.split("-").map(Number);
  const offset=(new Date(Date.UTC(year,number-1,1)).getUTCDay()+6)%7;
  const days=new Date(Date.UTC(year,number,0)).getUTCDate();
  const first=month+"-01",last=month+"-"+String(days).padStart(2,"0");
  const visible=matching.filter(e=>e.start.slice(0,10)<=last&&lastDay(e)>=first);
  function changeKind(value:string){setKind(value);const filtered=importedEvents.filter(e=>value==="todas"||e.kind===value);if(!filtered.some(e=>e.start.slice(0,10)<=last&&lastDay(e)>=first)){const next=filtered.find(e=>lastDay(e)>="2026-10-19")||filtered[0];if(next)setMonth(next.start.slice(0,7));}}
  function moveMonth(delta:number){const next=new Date(Date.UTC(year,number-1+delta,1)).toISOString().slice(0,7);if(next>="2026-10"&&next<="2027-12")setMonth(next);}
  function openEvent(event:Event){setSelected(event);dialog.current?.showModal();}
  return <section className="academic-calendar" aria-label="Calendario académico">
    <div className="academic-toolbar"><div className="academic-month"><button aria-label="Mes anterior" onClick={()=>moveMonth(-1)} disabled={month==="2026-10"}>←</button><label><span className="campus-overline">MES</span><input type="month" aria-label="Mes del calendario" value={month} min="2026-10" max="2027-12" onChange={e=>{if(/^\d{4}-\d{2}$/.test(e.target.value)&&e.target.value>="2026-10"&&e.target.value<="2027-12")setMonth(e.target.value);}}/></label><button aria-label="Mes siguiente" onClick={()=>moveMonth(1)} disabled={month==="2027-12"}>→</button></div><label className="academic-filter"><span className="campus-overline">MOSTRAR</span><select aria-label="Tipo de evento" value={kind} onChange={e=>changeKind(e.target.value)}><option value="todas">Todo el calendario</option>{Object.entries(labels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label><div className="academic-view" aria-label="Vista del calendario"><button aria-pressed={view==="mes"} onClick={()=>setView("mes")}>Mes</button><button aria-pressed={view==="agenda"} onClick={()=>setView("agenda")}>Agenda</button></div></div>
    <div className="academic-legend">{Object.entries(labels).map(([key,label])=><span key={key} className={"legend-"+key}><i/>{label}</span>)}</div>
    {view==="mes"?<div className="academic-grid"><div className="academic-weekdays">{["LUN","MAR","MIÉ","JUE","VIE","SÁB","DOM"].map(d=><span key={d}>{d}</span>)}</div><div className="academic-days">{Array.from({length:offset},(_,i)=><div key={'blank'+i} className="academic-day empty"/>)}{Array.from({length:days},(_,i)=>{const date=month+'-'+String(i+1).padStart(2,'0');const events=matching.filter(e=>onDay(e,date));return <div key={date} className={"academic-day "+(date===today?"is-today":"")} aria-current={date===today?"date":undefined}><span>{i+1}</span>{events.map(e=><button key={e.id} className={"academic-event kind-"+e.kind} title={e.title+" · "+dateRange(e)} onClick={()=>openEvent(e)}><small>{e.allDay?singular[e.kind]:time(e.start)+(e.kind==='entrega'?'':'–'+time(e.end))}</small><strong>{e.title}</strong></button>)}</div>;})}</div></div>:<div className="academic-agenda">{visible.map(e=><button className={"academic-agenda-row kind-border-"+e.kind} key={e.id} onClick={()=>openEvent(e)}><time dateTime={e.start}><strong>{e.start.slice(8,10)}</strong><span>{new Date(e.start.slice(0,10)+'T12:00:00Z').toLocaleDateString('es-ES',{month:'short',timeZone:'Europe/Madrid'})}</span></time><div><span className={"academic-type kind-"+e.kind}>{singular[e.kind]}</span><h2>{e.title}</h2><p>{dateRange(e)}</p>{e.location?<small>{e.location}</small>:null}</div><span aria-hidden="true">↗</span></button>)}</div>}
    {!visible.length?<p className="campus-empty">No hay eventos de este tipo en el mes seleccionado. Puedes cambiar de mes o de filtro.</p>:null}
    <div className="campus-note">Horario de Madrid. Las clases del archivo abarcan del 1 de octubre al 10 de diciembre de 2026. Las fechas de exámenes, notas y revisiones proceden de la imagen facilitada y llegan hasta diciembre de 2027. Los periodos de varias fechas se muestran completos; la imagen no indica horas ni una asignación individual de día para esas convocatorias.</div>
    <div aria-label="Información adicional"><h2 className="campus-overline">Información adicional</h2><div className="academic-summary"><span><strong>{importedEvents.filter(e=>e.kind==='clase').length}</strong> clases</span><span><strong>{importedEvents.filter(e=>e.kind==='examen').length}</strong> exámenes o periodos</span><span><strong>{importedEvents.filter(e=>e.kind==='defensa').length}</strong> periodos de defensa TFM</span><a href="/calendario-icex.ics" download>Descargar calendario completo .ics ↓</a></div></div>
    <dialog ref={dialog} className="academic-dialog" onClose={()=>setSelected(null)}><form method="dialog"><button aria-label="Cerrar detalle">×</button></form>{selected?<><span className={"academic-type kind-"+selected.kind}>{singular[selected.kind]}</span><h2>{selected.title}</h2><p className="academic-detail-date">{dateRange(selected)}</p>{selected.location?<p>{selected.location}</p>:null}<p className="academic-detail-description">{selected.description}</p><small>Fuente: {selected.source}</small>{selected.url?<p><a href={selected.url} target="_blank" rel="noopener noreferrer">Abrir tarea en ICEX ↗</a></p>:null}</>:null}</dialog>
  </section>;
}
