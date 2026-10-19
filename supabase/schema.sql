-- Initial schema only. Read-access policies are configured separately in the project.
begin;
create table public.icex_courses (id text primary key, title text not null, academic_year text not null, source_url text not null, imported_at timestamptz not null default now());
create table public.icex_subjects (id text primary key, course_id text not null references public.icex_courses(id), title text not null, phase text not null, resources jsonb not null default '[]');
create table public.icex_tasks (id text primary key, course_id text not null references public.icex_courses(id), subject text not null, title text not null, source_url text not null, due_at timestamptz, description text not null default '');
create table public.icex_documents (id uuid primary key default gen_random_uuid(), course_id text not null references public.icex_courses(id), file_name text not null, title text not null, academic_year text not null, subjects text[] not null default '{}', source_url text, bucket_id text not null default 'icex-documents', storage_path text not null, sha256 text not null check (sha256 ~ '^[0-9a-f]{64}$'), size_bytes bigint not null, mime_type text not null, uploaded_at timestamptz, verified_at timestamptz, unique(course_id,storage_path));
alter table public.icex_courses enable row level security;
alter table public.icex_subjects enable row level security;
alter table public.icex_tasks enable row level security;
alter table public.icex_documents enable row level security;
revoke all on public.icex_courses,public.icex_subjects,public.icex_tasks,public.icex_documents from anon,authenticated;
create index icex_documents_subjects_idx on public.icex_documents using gin(subjects);
insert into storage.buckets(id,name,public) values('icex-documents','icex-documents',false);
commit;
