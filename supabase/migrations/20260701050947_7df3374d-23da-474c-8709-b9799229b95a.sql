
create table public.announcement_bar (
  id boolean primary key default true,
  enabled boolean not null default true,
  text_fr text not null default '🚚 Livraison dans les 58 wilayas   ·   🎮 Nouveautés chaque semaine   ·   💳 Paiement à la livraison   ·   🔥 Offres exclusives',
  text_ar text not null default '🚚 التوصيل إلى 58 ولاية   ·   🎮 وصل حديثا كل أسبوع   ·   💳 الدفع عند الاستلام   ·   🔥 عروض حصرية',
  speed_seconds integer not null default 40,
  bg_color text not null default '#0A0A0A',
  text_color text not null default '#C6FF3D',
  updated_at timestamptz not null default now(),
  constraint announcement_bar_singleton check (id = true)
);

grant select on public.announcement_bar to anon, authenticated;
grant insert, update, delete on public.announcement_bar to authenticated;
grant all on public.announcement_bar to service_role;

alter table public.announcement_bar enable row level security;

create policy "announcement_bar public read"
  on public.announcement_bar for select
  to anon, authenticated using (true);

create policy "announcement_bar admin write"
  on public.announcement_bar for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

insert into public.announcement_bar (id) values (true) on conflict (id) do nothing;
