# ICEX database

The project uses Supabase Auth, Postgres, and the private `icex-documents` Storage bucket.

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Vercel production environment variables. The publishable key is intended for browser use. Never add a service-role or secret key to client configuration.

Tables: `icex_courses`, `icex_subjects`, `icex_tasks`, `icex_documents`. RLS permits read access only to the owner's verified email. Anonymous users cannot query these tables or read stored files. The app does not have insert, update, or delete permissions.

The private library at `/campus/documentos` signs in via email. Supabase Auth Site URL must point to `https://icex.vercel.app/campus/documentos`; allow that exact redirect URL for sign-in. File downloads use short-lived signed URLs and retain original filenames.

The initial import contains 16 subjects/modules, 22 tasks, and 95 verified objects (94 documents and the logo). Storage paths use SHA-256 filenames and are recorded in `icex_documents`; `verified_at` is set after matching the Storage object path and byte size. The import is a snapshot, not automatic LMS synchronization.

The calendar is backed up in `icex_calendar_events` with the same owner-only read access. The web calendar uses the corresponding checked-in snapshot, `app/campus/calendar-events.json`, and exports `/calendario-icex.ics`. It includes 106 classes, 12 exams or exam periods, 2 TFM defense periods, 7 deadlines, 6 grade-publication dates, and 4 review periods. Two timed partial exams come from the source class timetable. Image dates without times are all-day events; multi-day intervals retain an exclusive end date. Class times use Europe/Madrid, including the October 2026 DST transition.
