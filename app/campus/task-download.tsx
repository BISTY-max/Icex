"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function TaskDownload({documents}:{documents:{sha256:string;name:string}[]}){
  const [busy,setBusy]=useState("");
  const [error,setError]=useState("");
  const [needsLogin,setNeedsLogin]=useState(false);
  async function download(sha256:string){
    setBusy(sha256);setError("");setNeedsLogin(false);
    try{
      const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if(!url||!key)throw new Error("configuration");
      const client=createClient(url,key);
      const {data:auth,error:authError}=await client.auth.getSession();
      if(authError)throw authError;
      if(!auth.session){setNeedsLogin(true);return;}
      const {data:file,error:lookupError}=await client.from("icex_documents").select("bucket_id,storage_path,file_name").eq("course_id","862").eq("sha256",sha256).not("verified_at","is",null).maybeSingle();
      if(lookupError||!file)throw lookupError||new Error("missing");
      const {data,error:signedError}=await client.storage.from(file.bucket_id).createSignedUrl(file.storage_path,60,{download:file.file_name});
      if(signedError||!data?.signedUrl)throw signedError||new Error("download");
      window.location.assign(data.signedUrl);
    }catch{setError("No se pudo descargar. Comprueba tu conexión y tu sesión de la biblioteca y vuelve a intentarlo.");}
    finally{setBusy("");}
  }
  return <div className="campus-task-download">{documents.length?documents.map(document=><button className="campus-outline-button" key={document.sha256} disabled={!!busy} title={document.name} onClick={()=>download(document.sha256)}>{busy===document.sha256?"Preparando…":documents.length===1?"Descargar tarea ↓":document.name+" ↓"}</button>):<span className="campus-document-pending">Documento pendiente</span>}{needsLogin?<p role="status">Entra en <a href="/campus/documentos">tu biblioteca privada</a> y vuelve aquí para descargar la tarea.</p>:null}{error?<p role="alert">{error}</p>:null}</div>;
}
