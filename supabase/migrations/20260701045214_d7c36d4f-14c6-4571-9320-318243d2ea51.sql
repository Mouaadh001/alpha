
alter function public.tg_products_updated_at() set search_path = public;
alter function public.tg_products_check_subcategory() set search_path = public;

revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
