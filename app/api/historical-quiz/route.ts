import { createClient } from "@supabase/supabase-js";


export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store", "Vary": "Authorization" };
export async function GET(request: Request) {
  const hash = new URL(request.url).searchParams.get("doc") || "";
  if (!/^[a-f0-9]{64}$/.test(hash)) return Response.json({ error: "Documento no válido." }, { status: 400, headers });
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return Response.json({ error: "Inicia sesión en el campus para abrir el cuestionario." }, { status: 401, headers });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return Response.json({ error: "Acceso no configurado." }, { status: 503, headers });
  const client = createClient(url, key, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false, autoRefreshToken: false } });
  const user = await client.auth.getUser(token);
  if (user.error || !user.data.user) return Response.json({ error: "Tu sesión ha caducado. Vuelve a iniciar sesión." }, { status: 401, headers });
  // RLS checks access to this specific original, not merely whether the user exists.
  const access = await client.from("icex_documents").select("id").eq("course_id", "862").eq("sha256", hash).not("verified_at", "is", null).limit(1);
  if (access.error || !access.data?.length) return Response.json({ error: "Esta cuenta no tiene acceso a este examen." }, { status: 403, headers });
  const bank = await client.storage.from("icex-documents").download("historical-quizzes.json");
  if (bank.error || !bank.data) return Response.json({ error: "No se pudo cargar el banco de exámenes." }, { status: 503, headers });
  let quizzes: Record<string, unknown>;
  try { quizzes = JSON.parse(await bank.data.text()); }
  catch { return Response.json({ error: "El banco de exámenes no está disponible." }, { status: 503, headers }); }
  const quiz = quizzes[hash];
  if (!quiz) return Response.json({ error: "Este documento todavía no tiene cuestionario disponible." }, { status: 404, headers });
  return Response.json(quiz, { headers });
}
