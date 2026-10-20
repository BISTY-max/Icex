"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import "../campus.css";
import "./documentos.css";

type Document = { id:string; title:string; file_name:string; subjects:string[]; mime_type:string; size_bytes:number; bucket_id:string; storage_path:string; verified_at:string };
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const pendingDownloadKey="icex.pending-document-download.v1";
const normalize=(text:string)=>text.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();

export default function Documents() {
  const [client]=useState<SupabaseClient|null>(()=>url&&key?createClient(url,key):null);
  const [session,setSession]=useState<Session|null>(null);
  const [ready,setReady]=useState(false);
  const [files,setFiles]=useState<Document[]>([]);
  const [loading,setLoading]=useState(false);
  const [email,setEmail]=useState("");
  const [query,setQuery]=useState("");
  const [subject,setSubject]=useState("");
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState("");
  const [requested,setRequested]=useState<string|null>(null);
  const [filesLoaded,setFilesLoaded]=useState(false);
  const autoAttempt=useRef("");

  useEffect(()=>{
    if(!client)return;
    let active=true;
    const requestedDoc=new URLSearchParams(window.location.search).get("doc");
    if(requestedDoc&&/^[a-f0-9]{64}$/.test(requestedDoc))setRequested(requestedDoc);
    else if(!requestedDoc){
      try{
        const pending=JSON.parse(localStorage.getItem(pendingDownloadKey)||"null");
        if(pending&&typeof pending.doc==="string"&&/^[a-f0-9]{64}$/.test(pending.doc)&&typeof pending.expiresAt==="number"&&pending.expiresAt>Date.now())setRequested(pending.doc);
        else localStorage.removeItem(pendingDownloadKey);
      }catch{/* Storage may be unavailable; normal library access still works. */}
    }
    const fragment=new URLSearchParams(window.location.hash.slice(1));
    if(fragment.get("error_description"))setError(fragment.get("error_description")||"El enlace no es válido. Solicita uno nuevo.");
    client.auth.getSession().then(({data,error})=>{if(active){setSession(data.session);setReady(true);if(error)setError("No se pudo recuperar la sesión. Vuelve a iniciar sesión.");}}).catch(()=>{if(active){setReady(true);setError("No se pudo conectar. Comprueba tu conexión y vuelve a intentarlo.");}});
    const {data:{subscription}}=client.auth.onAuthStateChange((_event,next)=>{if(active){setSession(next);setReady(true);}});
    return ()=>{active=false;subscription.unsubscribe();};
  },[client]);

  useEffect(()=>{
    if(!client||!session){setFiles([]);setFilesLoaded(false);return;}
    let active=true;
    setLoading(true);setFilesLoaded(false);
    client.from("icex_documents").select("id,title,file_name,subjects,mime_type,size_bytes,bucket_id,storage_path,verified_at").eq("course_id","862").not("verified_at","is",null).order("file_name").then(({data,error})=>{
      if(!active)return;
      setLoading(false);
      if(error){setError("No se pudo cargar la biblioteca. Vuelve a intentarlo más tarde.");return;}
      setFiles((data||[]) as Document[]);setFilesLoaded(true);
    });
    return ()=>{active=false;};
  },[client,session]);

  async function signIn(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();if(!client)return;
    setBusy("login");setError("");setMessage("");
    try {
      if(requested){try{localStorage.setItem(pendingDownloadKey,JSON.stringify({doc:requested,expiresAt:Date.now()+30*60*1000}));}catch{/* Continue sign-in even if storage is unavailable. */}}
      const redirect=new URL("/campus/documentos",window.location.origin);
      const {error}=await client.auth.signInWithOtp({email:email.trim(),options:{emailRedirectTo:redirect.toString()}});
      if(error)throw error;
      setMessage("Revisa tu correo y abre el enlace de acceso. Si no lo encuentras, comprueba la carpeta de spam.");
    } catch(error) {
      const text=error instanceof Error?error.message:"";
      setError(/rate|seconds/i.test(text)?"Espera un minuto antes de solicitar otro enlace.":/email.*not.*authorized|only.*organization|not.*allowed/i.test(text)?"Supabase no permite enviar el correo a esta dirección con la configuración actual. Contacta con el administrador.":"No se pudo enviar el enlace. Comprueba el correo y vuelve a intentarlo.");
    } finally {setBusy("");}
  }

  const download=useCallback(async(file:Document)=>{
    if(!client)return;
    setBusy(file.id);setError("");
    try {
      const {data,error}=await client.storage.from(file.bucket_id).createSignedUrl(file.storage_path,60,{download:file.file_name});
      if(error||!data?.signedUrl)throw error||new Error("No URL");
      try{
        const pending=JSON.parse(localStorage.getItem(pendingDownloadKey)||"null");
        if(pending?.doc===file.storage_path.split('/').pop()?.split('.')[0])localStorage.removeItem(pendingDownloadKey);
      }catch{/* A blocked local store must not prevent downloading. */}
      const current=new URL(window.location.href);current.searchParams.delete("doc");window.history.replaceState(null,"",current.pathname+current.search+current.hash);
      setMessage("Descarga iniciada. Si no aparece, puedes pulsar Descargar para volver a intentarlo.");
      window.location.assign(data.signedUrl);
    } catch {setError("No se pudo descargar el archivo. Comprueba que tu sesión siga activa e inténtalo de nuevo.");}
    finally {setBusy("");}
  },[client]);

  useEffect(()=>{
    if(!client||!session||!requested||!filesLoaded||loading)return;
    const attempt=session.user.id+":"+requested;
    if(autoAttempt.current===attempt)return;
    autoAttempt.current=attempt;
    const file=files.find(file=>file.storage_path.split('/').pop()?.split('.')[0]===requested);
    if(!file){setError("El documento solicitado no está disponible en tu biblioteca.");return;}
    setMessage("Preparando la descarga automática de "+file.file_name+"…");
    void download(file);
  },[client,session,requested,filesLoaded,loading,files,download]);

  async function signOut(){if(!client)return;const {error}=await client.auth.signOut();if(error){setError("No se pudo cerrar la sesión. Inténtalo de nuevo.");return;}setFiles([]);setSession(null);setMessage("");}
  const subjects=[...new Set(files.flatMap(f=>f.subjects))].sort();
  const isRequested=(file:Document)=>!!requested&&file.storage_path.split('/').pop()?.split('.')[0]===requested;
  const visible=files.filter(f=>(!subject||f.subjects.includes(subject))&&normalize(f.title+" "+f.file_name+" "+f.subjects.join(" ")).includes(normalize(query))).sort((a,b)=>Number(isRequested(b))-Number(isRequested(a)));

  return <div className="campus private-library"><div className="private-shell">
    <header className="private-header"><a href="/campus"><img src="/icex-campus.svg" alt="ICEX Campus" width="210" height="42"/></a><a href="/campus">← Volver al campus</a></header>
    <main>
      <div className="private-heading"><div><p className="campus-overline">TU ARCHIVO ACADÉMICO / 2026 — 2027</p><h1>Tu biblioteca.<br/><em>Siempre a mano.</em></h1><p>Las copias de tus materiales, guardadas en tu espacio privado.</p></div><span className="private-badge">SUPABASE<br/><strong>Archivo privado</strong></span></div>
      <div aria-live="polite">{requested&&ready&&!session?<p className="private-feedback">Entra con tu correo y el documento que has seleccionado se descargará automáticamente.</p>:null}{error?<p className="private-feedback error" role="alert">{error}</p>:null}{message?<p className="private-feedback">{message}</p>:null}</div>
      {!client?<p className="private-feedback error">La biblioteca no está conectada todavía. Vuelve al campus e inténtalo más tarde.</p>:!ready?<p className="private-feedback" role="status">Comprobando tu sesión…</p>:!session?<div className="private-login-grid"><section className="private-login"><p className="campus-overline">ACCESO A TUS DOCUMENTOS</p><h2>Entra con tu correo.</h2><p>Recibirás un enlace para acceder. No necesitas una contraseña ni iniciar sesión en el campus de ICEX.</p><form onSubmit={signIn}><label htmlFor="library-email">Correo electrónico</label><input id="library-email" type="email" autoComplete="email" placeholder="tu@correo.com" required value={email} onChange={e=>setEmail(e.target.value)} disabled={busy==="login"}/><button className="private-primary" disabled={busy==="login"} type="submit">{busy==="login"?"Enviando…":"Recibir enlace de acceso ↗"}</button></form><small>Solo la cuenta autorizada puede consultar y descargar los archivos.</small></section><section className="private-explainer"><span className="private-large-number">94<span>+ logo</span></span><h2>Documentos que te acompañan.</h2><p>Guías, lecturas, presentaciones y ejercicios organizados por asignatura.</p><div>Copias guardadas en Supabase<br/>Acceso privado por correo<br/>Descargas con su nombre original</div><small>Archivo importado el 19 de octubre de 2026. Los materiales que seguían restringidos o no pudieron descargarse no forman parte de esta copia.</small></section></div>:<>
        <div className="private-session"><div><strong>{session.user.email}</strong><span>{loading?"Cargando biblioteca…":`${files.length} archivos guardados`}</span></div><button onClick={signOut}>Cerrar sesión</button></div>
        <div className="campus-tools"><label className="campus-search"><span aria-hidden="true">⌕</span><input aria-label="Buscar documentos privados" placeholder="Buscar por título, archivo o asignatura…" value={query} onChange={e=>setQuery(e.target.value)}/></label><select aria-label="Filtrar documentos por asignatura" value={subject} onChange={e=>setSubject(e.target.value)}><option value="">Todas las asignaturas</option>{subjects.map(s=><option key={s}>{s}</option>)}</select></div>
        <div className="private-files" aria-busy={loading}>{visible.map(f=><article key={f.id} className={"private-file "+(isRequested(f)?"requested":"")}><span className="campus-file-type">{f.file_name.split('.').pop()?.toUpperCase()}</span><div><h2>{f.title}</h2><p>{f.subjects.join(" · ")||"Documentación general"}</p><small>{(f.size_bytes/1024/1024).toLocaleString("es-ES",{maximumFractionDigits:1})} MB · Copia guardada</small></div><button className="campus-outline-button" onClick={()=>download(f)} disabled={!!busy}>{busy===f.id?"Preparando…":"Descargar ↓"}</button></article>)}</div>
        {!loading&&!files.length?<p className="campus-empty">Esta cuenta no tiene documentos disponibles. Comprueba que has entrado con el correo autorizado.</p>:!loading&&!visible.length?<p className="campus-empty">No hay documentos que coincidan con tu búsqueda.</p>:null}
      </>}
      <footer className="campus-footer"><span>Archivo personal · ICEX 2026–2027</span><span>Acceso protegido. Los enlaces de descarga se generan cuando los solicitas.</span></footer>
    </main>
  </div></div>;
}
