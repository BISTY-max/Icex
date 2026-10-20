"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { downloadCampusDocument, getCampusClient } from "./campus-client";
import "./account.css";

export function PrivateDocumentLink({hash,children,className=""}:{hash:string;children:ReactNode;className?:string}) {
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  return <><a className={className} href={"/campus/documentos?doc="+hash} aria-busy={busy} onClick={async event=>{
    event.preventDefault();if(busy)return;setBusy(true);setError("");
    try{
      const client=getCampusClient();if(!client)throw new Error("configuration");
      const auth=await client.auth.getSession();if(auth.error)throw auth.error;
      if(!auth.data.session){window.dispatchEvent(new CustomEvent("campus-login",{detail:{hash}}));return;}
      await downloadCampusDocument(hash);
    }catch{setError("No se pudo descargar. Comprueba tu sesión y vuelve a intentarlo.");}
    finally{setBusy(false);}
  }}>{children}<span aria-hidden="true"> {busy?"…":"↓"}</span></a>{error?<small className="account-download-error" role="alert">{error}</small>:null}</>;
}

export default function Account(){
  const dialog=useRef<HTMLDialogElement>(null);
  const [session,setSession]=useState<Session|null>(null);
  const [ready,setReady]=useState(false);
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [pending,setPending]=useState<string|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  useEffect(()=>{
    const client=getCampusClient();if(!client){setReady(true);return;}
    let active=true;
    client.auth.getSession().then(({data,error})=>{if(active){setSession(data.session);setReady(true);if(error)setError("No se pudo recuperar la sesión.");}}).catch(()=>{if(active){setReady(true);setError("No se pudo conectar con el servicio de acceso.");}});
    const {data:{subscription}}=client.auth.onAuthStateChange((_event,next)=>{if(active)setSession(next);});
    const request=(event:Event)=>{const hash=(event as CustomEvent<{hash:string}>).detail?.hash;setPending(typeof hash==="string"&&/^[a-f0-9]{64}$/.test(hash)?hash:null);setError("");setMessage("");dialog.current?.showModal();};
    window.addEventListener("campus-login",request);
    return()=>{active=false;subscription.unsubscribe();window.removeEventListener("campus-login",request);};
  },[]);
  return <><button className={"account-trigger"+(session?" is-signed-in":"")} aria-label={session?"Mi cuenta":"Iniciar sesión"} title={session?"Mi cuenta":"Iniciar sesión"} aria-haspopup="dialog" disabled={!ready} onClick={()=>{setPending(null);setError("");setMessage("");dialog.current?.showModal();}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/></svg>{session?<i aria-label="Sesión activa"/>:null}</button>
    <dialog ref={dialog} className="account-dialog" aria-labelledby="account-title" onClose={()=>{setPassword("");setPending(null);}}><div className="account-heading"><h2 id="account-title">{session?"Mi cuenta":"Iniciar sesión"}</h2><button aria-label="Cerrar acceso" onClick={()=>dialog.current?.close()}>×</button></div>
      {error?<p role="alert" className="account-error">{error}</p>:null}{message?<p role="status" className="account-message">{message}</p>:null}
      {session?<><p className="account-email">{session.user.email}</p><p>Tu sesión está activa. Pulsa un documento del campus para descargarlo directamente.</p><button className="account-primary" disabled={busy} onClick={async()=>{const client=getCampusClient();if(!client)return;setBusy(true);const result=await client.auth.signOut();setBusy(false);if(result.error){setError("No se pudo cerrar la sesión.");return;}setSession(null);setMessage("");}}>Cerrar sesión</button></>:<><p>{pending?"Entra para descargar el documento seleccionado.":"Entra una vez y descarga tus documentos desde el campus."}</p><form onSubmit={async event=>{
        event.preventDefault();if(busy)return;const client=getCampusClient();if(!client){setError("El acceso no está configurado.");return;}setBusy(true);setError("");setMessage("");
        try{
          const result=await client.auth.signInWithPassword({email:email.trim(),password});
          if(result.error||!result.data.session){setError(result.error?.code==="email_not_confirmed"?"Esta cuenta todavía necesita confirmación. Revisa tu correo.":"No se pudo entrar. Comprueba el correo y la contraseña.");return;}
          setPassword("");
          const access=await client.from("icex_documents").select("id").eq("course_id","862").not("verified_at","is",null).limit(1);
          if(access.error||!access.data?.length){setError("La cuenta ha iniciado sesión, pero aún no tiene acceso a los documentos.");return;}
          if(pending){await downloadCampusDocument(pending);setPending(null);}
          setMessage("Sesión iniciada y acceso a documentos verificado.");dialog.current?.close();
        }catch{setError("No se pudo completar el acceso o la descarga. Comprueba tu conexión y vuelve a intentarlo.");}
        finally{setBusy(false);}
      }}><label htmlFor="campus-account-email">Correo electrónico</label><input id="campus-account-email" type="email" autoComplete="username" required value={email} onChange={event=>setEmail(event.target.value)} disabled={busy}/><label htmlFor="campus-account-password">Contraseña</label><input id="campus-account-password" type="password" autoComplete="current-password" required value={password} onChange={event=>setPassword(event.target.value)} disabled={busy}/><button className="account-primary" disabled={busy} type="submit">{busy?"Comprobando…":"Entrar"}</button></form><small>La sesión se mantiene en este navegador hasta que cierres sesión o borres sus datos.</small></>}
    </dialog></>;
}
