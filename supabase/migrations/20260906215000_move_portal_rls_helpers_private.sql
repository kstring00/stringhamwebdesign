create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;

create or replace function private.portal_is_admin() returns boolean language sql stable security definer set search_path=public as $$
select exists(select 1 from public.users where id=auth.uid() and role='admin');
$$;
create or replace function private.portal_can_access_client(p_client_id uuid) returns boolean language sql stable security definer set search_path=public as $$
select private.portal_is_admin() or exists(select 1 from public.clients c where c.id=p_client_id and c.user_id=auth.uid());
$$;
create or replace function private.portal_can_access_project(p_project_id uuid) returns boolean language sql stable security definer set search_path=public as $$
select private.portal_is_admin() or exists(select 1 from public.projects p join public.clients c on c.id=p.client_id where p.id=p_project_id and c.user_id=auth.uid());
$$;
revoke all on function private.portal_is_admin() from public, anon;
revoke all on function private.portal_can_access_client(uuid) from public, anon;
revoke all on function private.portal_can_access_project(uuid) from public, anon;
grant execute on function private.portal_is_admin() to authenticated, service_role;
grant execute on function private.portal_can_access_client(uuid) to authenticated, service_role;
grant execute on function private.portal_can_access_project(uuid) to authenticated, service_role;

alter policy users_read_portal on public.users using (id=auth.uid() or private.portal_is_admin());
alter policy users_admin_write_portal on public.users using (private.portal_is_admin()) with check (private.portal_is_admin());
alter policy clients_read_portal on public.clients using (user_id=auth.uid() or private.portal_is_admin());
alter policy clients_admin_write_portal on public.clients using (private.portal_is_admin()) with check (private.portal_is_admin());
alter policy projects_read_portal on public.projects using (private.portal_can_access_client(client_id));
alter policy projects_admin_write_portal on public.projects using (private.portal_is_admin()) with check (private.portal_is_admin());
alter policy quotes_read_portal on public.quotes using (private.portal_can_access_project(project_id));
alter policy quotes_admin_write_portal on public.quotes using (private.portal_is_admin()) with check (private.portal_is_admin());
alter policy messages_read_portal on public.messages using (private.portal_can_access_project(project_id));
alter policy messages_insert_portal on public.messages with check (sender_id=auth.uid() and private.portal_can_access_project(project_id));
alter policy files_read_portal on public.files using (private.portal_can_access_project(project_id));
alter policy files_insert_portal on public.files with check (uploaded_by=auth.uid() and private.portal_can_access_project(project_id));
alter policy files_delete_portal on public.files using (private.portal_is_admin() or (uploaded_by=auth.uid() and private.portal_can_access_project(project_id)));
alter policy time_entries_read_portal on public.time_entries using (private.portal_can_access_project(project_id));
alter policy time_entries_admin_write_portal on public.time_entries using (private.portal_is_admin()) with check (private.portal_is_admin());
alter policy invoices_read_portal on public.invoices using (private.portal_can_access_project(project_id));
alter policy invoices_admin_write_portal on public.invoices using (private.portal_is_admin()) with check (private.portal_is_admin());
alter policy docs_read_portal on public.docs using (private.portal_can_access_project(project_id));
alter policy docs_admin_write_portal on public.docs using (private.portal_is_admin()) with check (private.portal_is_admin());
alter policy prospects_admin_only_portal on public.prospects using (private.portal_is_admin()) with check (private.portal_is_admin());
alter policy change_requests_read_portal on public.change_requests using (private.portal_can_access_project(project_id));
alter policy change_requests_insert_portal on public.change_requests with check (requested_by=auth.uid() and private.portal_can_access_project(project_id));
alter policy change_requests_admin_update_portal on public.change_requests using (private.portal_is_admin()) with check (private.portal_is_admin());
alter policy care_plans_read_portal on public.care_plans using (private.portal_can_access_project(project_id));
alter policy care_plans_admin_write_portal on public.care_plans using (private.portal_is_admin()) with check (private.portal_is_admin());
alter policy portal_files_storage_read on storage.objects using (bucket_id='portal-files' and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' and private.portal_can_access_project(((storage.foldername(name))[1])::uuid));
alter policy portal_files_storage_insert on storage.objects with check (bucket_id='portal-files' and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' and private.portal_can_access_project(((storage.foldername(name))[1])::uuid));
alter policy portal_files_storage_delete on storage.objects using (bucket_id='portal-files' and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' and private.portal_can_access_project(((storage.foldername(name))[1])::uuid));

drop function public.portal_can_access_project(uuid);
drop function public.portal_can_access_client(uuid);
drop function public.portal_is_admin();
