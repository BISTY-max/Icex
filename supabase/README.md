# ICEX database

The project uses Supabase Auth, Postgres, and the private `icex-documents` Storage bucket.

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Vercel production environment variables. The publishable key is intended for browser use. Never add a service-role or secret key to client configuration.

Tables: `icex_courses`, `icex_subjects`, `icex_tasks`, `icex_documents`. RLS permits read access only to the owner's verified email. Anonymous users cannot query these tables or read stored files. The app does not have insert, update, or delete permissions.

The private library at `/campus/documentos` signs in via email. Supabase Auth Site URL must point to `https://icex.vercel.app/campus/documentos`; allow that exact redirect URL for sign-in. File downloads use short-lived signed URLs and retain original filenames.

The initial import contains 16 subjects/modules, 22 tasks, and 95 verified objects (94 documents and the logo). Storage paths use SHA-256 filenames and are recorded in `icex_documents`; `verified_at` is set after matching the Storage object path and byte size. The import is a snapshot, not automatic LMS synchronization.
