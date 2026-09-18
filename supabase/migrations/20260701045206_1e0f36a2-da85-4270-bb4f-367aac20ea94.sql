
-- Roles enum + user_roles
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users can view own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);
create policy "Admins can view all roles" on public.user_roles
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins manage roles" on public.user_roles
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles self read" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profiles self upsert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles self update" on public.profiles for update to authenticated using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_fr text not null,
  name_ar text,
  position int not null default 0,
  image_url text,
  created_at timestamptz not null default now()
);
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "categories public read" on public.categories for select to anon, authenticated using (true);
create policy "categories admin write" on public.categories for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Subcategories
create table public.subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  slug text not null,
  name_fr text not null,
  name_ar text,
  position int not null default 0,
  created_at timestamptz not null default now(),
  unique (category_id, slug)
);
grant select on public.subcategories to anon, authenticated;
grant insert, update, delete on public.subcategories to authenticated;
grant all on public.subcategories to service_role;
alter table public.subcategories enable row level security;
create policy "subcategories public read" on public.subcategories for select to anon, authenticated using (true);
create policy "subcategories admin write" on public.subcategories for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_fr text not null,
  name_ar text,
  description_fr text,
  description_ar text,
  price_da integer not null check (price_da >= 0),
  compare_at_price_da integer,
  brand text,
  image_url text,
  gallery jsonb not null default '[]'::jsonb,
  stock integer not null default 0,
  featured boolean not null default false,
  active boolean not null default true,
  category_id uuid not null references public.categories(id) on delete restrict,
  subcategory_id uuid references public.subcategories(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products(category_id);
create index products_subcategory_idx on public.products(subcategory_id);
create index products_featured_idx on public.products(featured) where featured = true;

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "products public read active" on public.products for select to anon using (active = true);
create policy "products auth read all" on public.products for select to authenticated using (true);
create policy "products admin write" on public.products for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create or replace function public.tg_products_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger products_updated_at before update on public.products
  for each row execute function public.tg_products_updated_at();

-- Constraint: subcategory must belong to same category
create or replace function public.tg_products_check_subcategory()
returns trigger language plpgsql as $$
begin
  if new.subcategory_id is not null then
    if not exists (select 1 from public.subcategories where id = new.subcategory_id and category_id = new.category_id) then
      raise exception 'Subcategory does not belong to the selected category';
    end if;
  end if;
  return new;
end $$;
create trigger products_check_subcategory before insert or update on public.products
  for each row execute function public.tg_products_check_subcategory();
