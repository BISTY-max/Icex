create table public.icex_notes (
  id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null check (char_length(btrim(text)) between 1 and 10000),
  created_at timestamptz not null default now(),
  done boolean not null default false,
  deleted_at timestamptz,
  primary key (user_id, id)
);
alter table public.icex_notes enable row level security;
revoke all on public.icex_notes from anon;
grant select, insert, update on public.icex_notes to authenticated;
create policy notes_select_own on public.icex_notes for select to authenticated using ((select auth.uid()) = user_id);
create policy notes_insert_own on public.icex_notes for insert to authenticated with check ((select auth.uid()) = user_id);
create policy notes_update_own on public.icex_notes for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
