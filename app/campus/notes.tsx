"use client";

import { useEffect, useRef, useState } from "react";
import { getCampusClient } from "./campus-client";
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
  const [userId, setUserId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const owner = useRef<string | null>(null);
  const saving = useRef(false);
  const refreshVersion = useRef(0);
  const reload = useRef<() => Promise<void>>(async () => {});
  useEffect(() => {
    const client = getCampusClient();
    let active = true;
    let authVersion = 0;
    async function load(id: string | null, migrate = false) {
      if (saving.current) return;
      const version = ++refreshVersion.current;
      try {
        let next: Note[];
        if (id && client) {
          if (migrate) {
            let local: Note[] = [];
            try { local = readNotes(); } catch { /* Keep unreadable local data untouched. */ }
            if (local.length) {
              const imported = await client.from("icex_notes").upsert(local.map(note => ({ id: note.id, user_id: id, text: note.text, created_at: note.createdAt, done: note.done })), { onConflict: "user_id,id", ignoreDuplicates: true });
              if (imported.error) throw imported.error;
              // Remove only the notes successfully imported, preserving new local entries.
              localStorage.setItem(storageKey, JSON.stringify(readNotes().filter(note => !local.some(item => item.id === note.id))));
            }
          }
          const result = await client.from("icex_notes").select("id,text,created_at,done").eq("user_id", id).is("deleted_at", null).order("created_at", { ascending: false });
          if (result.error) throw result.error;
          next = result.data.map(row => ({ id: row.id, text: row.text, createdAt: row.created_at, done: row.done }));
        } else next = readNotes();
        if (active && owner.current === id && version === refreshVersion.current) { setNotes(next); setReady(true); setError(""); }
      } catch {
        if (active && owner.current === id && version === refreshVersion.current) setError("No se pudieron sincronizar tus notas. Comprueba la conexión y vuelve a abrir el bloc.");
      }
    }
    function account(id: string | null) {
      if (!active) return;
      if (owner.current !== id) { ++refreshVersion.current; setNotes([]); setRemoved(null); setMessage(""); setReady(false); }
      owner.current = id; setUserId(id);
      reload.current = () => load(id);
      void load(id, true);
    }
    const initial = authVersion;
    client?.auth.getSession().then(({ data, error }) => { if (active && authVersion === initial) { if (error) setError("No se pudo recuperar la sesión."); else account(data.session?.user.id ?? null); } }).catch(() => { if (active) setError("No se pudo recuperar la sesión."); });
    const subscription = client?.auth.onAuthStateChange((_event, session) => {
      ++authVersion;
      // Defer database requests until the auth callback has released its lock.
      window.setTimeout(() => account(session?.user.id ?? null), 0);
    }).data.subscription;
    if (!client) account(null);
    const refresh = () => { if (document.visibilityState === "visible") void reload.current(); };
    const changed = (event: StorageEvent) => { if (!owner.current && (event.key === storageKey || event.key === null)) refresh(); };
    const timer = window.setInterval(refresh, 15000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("storage", changed);
    return () => { active = false; ++refreshVersion.current; subscription?.unsubscribe(); clearInterval(timer); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); window.removeEventListener("storage", changed); };
  }, []);
  async function save(change: (current: Note[]) => Note[]) {
    if (saving.current || !ready) return false;
    saving.current = true; setBusy(true); ++refreshVersion.current;
    const id = owner.current;
    try {
      if (id) {
        const client = getCampusClient();
        if (!client) throw new Error("configuration");
        const current = notes;
        const next = change(current);
        const rows = next.filter(note => JSON.stringify(note) !== JSON.stringify(current.find(item => item.id === note.id))).map(note => ({ id: note.id, user_id: id, text: note.text, created_at: note.createdAt, done: note.done, deleted_at: null as string | null }));
        for (const note of current.filter(note => !next.some(item => item.id === note.id))) rows.push({ id: note.id, user_id: id, text: note.text, created_at: note.createdAt, done: note.done, deleted_at: new Date().toISOString() });
        if (rows.length) {
          const result = await client.from("icex_notes").upsert(rows, { onConflict: "user_id,id" });
          if (result.error) throw result.error;
        }
        if (owner.current !== id) return false;
        setNotes(next);
      } else {
        const next = change(readNotes());
        localStorage.setItem(storageKey, JSON.stringify(next)); setNotes(next);
      }
      setError(""); return true;
    } catch { if (owner.current === id) setError("No se ha podido guardar. Tu texto sigue aquí; comprueba la conexión y prueba de nuevo."); return false; }
    finally { saving.current = false; setBusy(false); void reload.current(); }
  }
  const pending = notes.filter(note => !note.done);
  const completed = notes.filter(note => note.done);
  return <>
    <button className="notes-trigger" aria-label="Abrir mis notas" title="Mis notas" aria-haspopup="dialog" aria-expanded={open} onClick={() => { dialog.current?.showModal(); setOpen(true); void reload.current(); }}><span aria-hidden="true">📝</span>{pending.length ? <small>{pending.length}</small> : null}</button>
    <dialog ref={dialog} className="notes-dialog" aria-labelledby="notes-title" onClose={() => setOpen(false)}>
      <div className="notes-heading"><div><span className="campus-overline">TU BLOC PERSONAL</span><h2 id="notes-title">Mis notas</h2></div><button className="notes-close" aria-label="Cerrar notas" onClick={() => dialog.current?.close()}>×</button></div>
      <form onSubmit={async event => { event.preventDefault(); const text = draft.trim(); if (!text || !ready) return; if (await save(current => [{ id: crypto.randomUUID(), text, done: false, createdAt: new Date().toISOString() }, ...current])) { setDraft(""); setMessage("Nota guardada."); } }}>
        <label htmlFor="personal-note">Escribe una nota o algo pendiente</label>
        <textarea id="personal-note" value={draft} onChange={event => setDraft(event.target.value)} placeholder="¿Qué quieres recordar?" maxLength={10000} rows={3}/>
        <button className="notes-send" type="submit" disabled={!ready || busy || !draft.trim()}>Enviar</button>
      </form>
      {error ? <p className="notes-error" role="alert">{error}</p> : null}
      <p className="notes-status" role="status">{message}</p>
      <div className="notes-list-heading"><h3>Pendientes <span>{pending.length}</span></h3>{completed.length ? <button aria-expanded={showDone} onClick={() => setShowDone(!showDone)}>{showDone ? "Ocultar terminadas" : `Ver terminadas (${completed.length})`}</button> : null}</div>
      {!pending.length ? <p className="notes-empty">No tienes notas pendientes.</p> : null}
      {[...pending, ...(showDone ? completed : [])].map(note => <article key={note.id} className={"personal-note" + (note.done ? " is-done" : "")}><label className="note-check"><input type="checkbox" checked={note.done} aria-label={(note.done ? "Reabrir nota: " : "Marcar terminada: ") + note.text} disabled={!ready || busy} onChange={async () => { if (await save(current => current.map(item => item.id === note.id ? { ...item, done: !item.done } : item))) setMessage(note.done ? "Nota reabierta." : "Nota terminada."); }}/><span>{note.text}</span></label><div className="note-meta"><time dateTime={note.createdAt}>{new Date(note.createdAt).toLocaleString("es-ES", { timeZone: "Europe/Madrid", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</time><button aria-label={"Eliminar nota: " + note.text} disabled={!ready || busy} onClick={async () => { if (await save(current => current.filter(item => item.id !== note.id))) { setRemoved(note); setMessage("Nota eliminada."); } }}>Eliminar</button></div></article>)}
      {removed ? <button className="notes-undo" disabled={!ready || busy} onClick={async () => { if (await save(current => current.some(note => note.id === removed.id) ? current : [removed, ...current])) { setRemoved(null); setMessage("Nota recuperada."); } }}>Deshacer eliminación</button> : null}
      <p className="notes-storage">{userId ? "Guardadas en tu cuenta. Se sincronizan entre dispositivos al abrir el bloc y cada 15 segundos." : "Guardadas solo en este navegador. Inicia sesión para sincronizarlas con tu cuenta y verlas en otros dispositivos."}</p>
    </dialog>
  </>;
}
