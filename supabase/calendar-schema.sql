begin;
create table if not exists public.icex_calendar_events (
 id text primary key, course_id text not null references public.icex_courses(id),
 kind text not null check(kind in ('clase','examen','entrega','notas','revision','defensa')),
 title text not null, starts_at timestamptz not null, ends_at timestamptz not null,
 all_day boolean not null default false, description text not null default '',
 location text not null default '', source text not null, source_uid text, source_url text,
 check(ends_at>starts_at));
alter table public.icex_calendar_events enable row level security;
revoke all on public.icex_calendar_events from anon,authenticated;
grant select on public.icex_calendar_events to authenticated;
-- An owner-specific read policy is configured in the Supabase project.
commit;
