"use client";

import { useEffect, useRef, useState } from "react";
import "./notes.css";

type Note = { id: string; text: string; createdAt: string; done: boolean };
const storageKey = "icex.personal-notes.v1";
function readNotes(): Note[] {
  const value: unknown = JSON.parse(localStorage.getItem(storageKey) || "[]");
  if (!Array.isArray(value) || !value.every(note => note && typeof note.id === "string" && typeof note.text === "string" && typeof note.createdAt === "string" && typeof note.done === "boolean")) throw new Error("Invalid notes");
  return value;
}

export default function Notes() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showDone, setShowDone] = useState(false);
  const [removed, setRemoved] = useState<Note | null>(null);
  useEffect(() => {
    function load() {
      try { setNotes(readNotes()); setReady(true); setError(""); }
      catch { setReady(false); setError("No se pueden leer tus notas. Comprueba que el navegador permita guardar datos."); }
    }
    load();
    const changed = (event: StorageEvent) => { if (event.key === storageKey || event.key === null) load(); };
    window.addEventListener("storage", changed);
    return () => window.removeEventListener("storage", changed);
  }, []);
  function save(change: (current: Note[]) => Note[]) {
    try {
      const next = change(readNotes());
      localStorage.setItem(storageKey, JSON.stringify(next));
      setNotes(next); setError(""); return true;
    } catch { setError("No se ha podido guardar. Tu texto sigue aquí; prueba de nuevo o copia la nota."); return false; }
  }
  const pending = notes.filter(note => !note.done);
  const completed = notes.filter(note => note.done);
  return <>
    <button className="notes-trigger" aria-label="Abrir mis notas" title="Mis notas" aria-haspopup="dialog" aria-expanded={open} onClick={() => { dialog.current?.showModal(); setOpen(true); }}><span aria-hidden="true">📝</span>{pending.length ? <small>{pending.length}</small> : null}</button>
    <dialog ref={dialog} className="notes-dialog" aria-labelledby="notes-title" onClose={() => setOpen(false)}>
      <div className="notes-heading"><div><span className="campus-overline">TU BLOC PERSONAL</span><h2 id="notes-title">Mis notas</h2></div><button className="notes-close" aria-label="Cerrar notas" onClick={() => dialog.current?.close()}>×</button></div>
      <form onSubmit={event => { event.preventDefault(); const text = draft.trim(); if (!text || !ready) return; if (save(current => [{ id: crypto.randomUUID(), text, done: false, createdAt: new Date().toISOString() }, ...current])) { setDraft(""); setMessage("Nota guardada."); } }}>
        <label htmlFor="personal-note">Escribe una nota o algo pendiente</label>
        <textarea id="personal-note" value={draft} onChange={event => setDraft(event.target.value)} placeholder="¿Qué quieres recordar?" maxLength={10000} rows={3}/>
        <button className="notes-send" type="submit" disabled={!ready || !draft.trim()}>Enviar</button>
      </form>
      {error ? <p className="notes-error" role="alert">{error}</p> : null}
      <p className="notes-status" role="status">{message}</p>
      <div className="notes-list-heading"><h3>Pendientes <span>{pending.length}</span></h3>{completed.length ? <button aria-expanded={showDone} onClick={() => setShowDone(!showDone)}>{showDone ? "Ocultar terminadas" : `Ver terminadas (${completed.length})`}</button> : null}</div>
      {!pending.length ? <p className="notes-empty">No tienes notas pendientes.</p> : null}
      {[...pending, ...(showDone ? completed : [])].map(note => <article key={note.id} className={"personal-note" + (note.done ? " is-done" : "")}><label className="note-check"><input type="checkbox" checked={note.done} aria-label={(note.done ? "Reabrir nota: " : "Marcar terminada: ") + note.text} onChange={() => { if (save(current => current.map(item => item.id === note.id ? { ...item, done: !item.done } : item))) setMessage(note.done ? "Nota reabierta." : "Nota terminada."); }}/><span>{note.text}</span></label><div className="note-meta"><time dateTime={note.createdAt}>{new Date(note.createdAt).toLocaleString("es-ES", { timeZone: "Europe/Madrid", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</time><button aria-label={"Eliminar nota: " + note.text} onClick={() => { if (save(current => current.filter(item => item.id !== note.id))) { setRemoved(note); setMessage("Nota eliminada."); } }}>Eliminar</button></div></article>)}
      {removed ? <button className="notes-undo" onClick={() => { if (save(current => current.some(note => note.id === removed.id) ? current : [removed, ...current])) { setRemoved(null); setMessage("Nota recuperada."); } }}>Deshacer eliminación</button> : null}
      <p className="notes-storage">Guardadas en este navegador. Puedes cerrar el bloc y volver cuando quieras. Al borrar los datos del navegador se eliminarán las notas.</p>
    </dialog>
  </>;
}
