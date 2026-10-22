import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;
export function getCampusClient() {
  if (client === undefined) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    client = url && key ? createClient(url, key) : null;
  }
  return client;
}

export async function downloadCampusDocument(hash: string) {
  const client = getCampusClient();
  if (!client) throw new Error("configuration");
  const { data, error } = await client.from("icex_documents").select("bucket_id,storage_path,file_name").eq("course_id", "862").eq("sha256", hash).not("verified_at", "is", null).limit(1).maybeSingle();
  if (error || !data) throw new Error("document-unavailable");
  const signed = await client.storage.from(data.bucket_id).createSignedUrl(data.storage_path, 60, { download: data.file_name });
  if (signed.error || !signed.data?.signedUrl) throw new Error("download-unavailable");
  window.location.assign(signed.data.signedUrl);
}
