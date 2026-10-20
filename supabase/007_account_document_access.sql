begin;
do $$
declare t text;
begin
  if not exists(select 1 from auth.users where id='9493c547-459e-4865-867c-351f5070a970' and lower(email)='myicex@gmail.com' and email_confirmed_at is not null) then
    raise exception 'Expected confirmed account does not exist';
  end if;
  foreach t in array array['icex_courses','icex_subjects','icex_tasks','icex_documents','icex_calendar_events'] loop
    if not exists(select 1 from pg_policies where schemaname='public' and tablename=t and policyname='icex_personal_account_read') then
      execute format('create policy icex_personal_account_read on public.%I for select to authenticated using ((select auth.uid()) = %L::uuid and %I = %L)',t,'9493c547-459e-4865-867c-351f5070a970',case when t='icex_courses' then 'id' else 'course_id' end,'862');
    end if;
  end loop;
  if not exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='icex_personal_account_download') then
    create policy icex_personal_account_download on storage.objects for select to authenticated using (
      (select auth.uid())='9493c547-459e-4865-867c-351f5070a970'::uuid
      and bucket_id='icex-documents'
      and exists(select 1 from public.icex_documents d where d.course_id='862' and d.bucket_id=objects.bucket_id and d.storage_path=objects.name and d.verified_at is not null)
    );
  end if;
end $$;
commit;
begin;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"9493c547-459e-4865-867c-351f5070a970","role":"authenticated","email":"myicex@gmail.com"}',true);
select (select count(*) from public.icex_documents where verified_at is not null) as readable_documents,(select count(*) from storage.objects where bucket_id='icex-documents') as downloadable_objects;
rollback;
