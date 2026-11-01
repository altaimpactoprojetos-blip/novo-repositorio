-- =====================================================================
--  MULHERES COM VISÃO — Estrutura do banco de dados (Supabase/PostgreSQL)
--  Todas as tabelas usam o prefixo mcv_ para conviver com outros sistemas
--  no mesmo projeto Supabase (ex.: CC Visão Profética) sem conflitos.
--  Execute este arquivo inteiro no SQL Editor do Supabase (ou via CLI).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Funções utilitárias (schema privado, NÃO exposto pela API REST)
-- ---------------------------------------------------------------------
create schema if not exists mcv_private;
grant usage on schema mcv_private to anon, authenticated;

create or replace function mcv_private.mcv_set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------
-- Administradores e permissões
--   role = 'admin'  → acesso total, inclusive gerenciar usuários
--   role = 'editor' → gerencia conteúdo, eventos, galeria e mensagens
-- ---------------------------------------------------------------------
create table if not exists public.mcv_admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  name       text,
  role       text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

create or replace function mcv_private.mcv_is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.mcv_admin_users where user_id = (select auth.uid()));
$$;

create or replace function mcv_private.mcv_is_super_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.mcv_admin_users where user_id = (select auth.uid()) and role = 'admin');
$$;

revoke all on function mcv_private.mcv_is_admin() from public;
revoke all on function mcv_private.mcv_is_super_admin() from public;
grant execute on function mcv_private.mcv_is_admin() to anon, authenticated;
grant execute on function mcv_private.mcv_is_super_admin() to anon, authenticated;

-- ---------------------------------------------------------------------
-- Conteúdo institucional editável (home, sobre, contato, configurações)
-- ---------------------------------------------------------------------
create table if not exists public.mcv_site_content (
  key        text primary key check (key in ('home', 'about', 'contact', 'settings')),
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);
drop trigger if exists mcv_site_content_updated on public.mcv_site_content;
create trigger mcv_site_content_updated before update on public.mcv_site_content
  for each row execute function mcv_private.mcv_set_updated_at();

-- ---------------------------------------------------------------------
-- Eventos
-- ---------------------------------------------------------------------
create table if not exists public.mcv_events (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null check (char_length(title) between 2 and 160),
  subtitle         text,
  description      text,
  banner_url       text,
  start_at         timestamptz not null,
  end_at           timestamptz,
  location_name    text,
  address          text,
  map_url          text,
  schedule         jsonb not null default '[]'::jsonb,
  additional_info  text,
  price            text,
  registration_url text,
  whatsapp_message text,
  is_published     boolean not null default false,
  is_finished      boolean not null default false,
  is_featured      boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint mcv_events_dates check (end_at is null or end_at >= start_at)
);
create index if not exists mcv_events_start_idx on public.mcv_events (start_at desc);
create index if not exists mcv_events_published_idx on public.mcv_events (is_published);
drop trigger if exists mcv_events_updated on public.mcv_events;
create trigger mcv_events_updated before update on public.mcv_events
  for each row execute function mcv_private.mcv_set_updated_at();

-- ---------------------------------------------------------------------
-- Álbuns e fotografias
-- ---------------------------------------------------------------------
create table if not exists public.mcv_albums (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null check (char_length(title) between 2 and 160),
  description  text,
  album_date   date not null default current_date,
  event_id     uuid references public.mcv_events (id) on delete set null,
  cover_url    text,
  is_published boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists mcv_albums_date_idx on public.mcv_albums (album_date desc);
create index if not exists mcv_albums_event_idx on public.mcv_albums (event_id);
drop trigger if exists mcv_albums_updated on public.mcv_albums;
create trigger mcv_albums_updated before update on public.mcv_albums
  for each row execute function mcv_private.mcv_set_updated_at();

create table if not exists public.mcv_photos (
  id         uuid primary key default gen_random_uuid(),
  album_id   uuid not null references public.mcv_albums (id) on delete cascade,
  url        text not null,
  caption    text,
  width      integer,
  height     integer,
  position   integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists mcv_photos_album_idx on public.mcv_photos (album_id, position);

-- ---------------------------------------------------------------------
-- Mensagens e testemunhos
-- ---------------------------------------------------------------------
create table if not exists public.mcv_posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  type         text not null check (type in ('testemunho', 'historia', 'mensagem', 'reflexao', 'video')),
  title        text not null check (char_length(title) between 2 and 200),
  excerpt      text,
  content      text,
  author_name  text,
  author_role  text,
  image_url    text,
  video_url    text,
  is_published boolean not null default false,
  is_featured  boolean not null default false,
  published_at timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists mcv_posts_type_idx on public.mcv_posts (type, published_at desc);
drop trigger if exists mcv_posts_updated on public.mcv_posts;
create trigger mcv_posts_updated before update on public.mcv_posts
  for each row execute function mcv_private.mcv_set_updated_at();

-- ---------------------------------------------------------------------
-- Equipe
-- ---------------------------------------------------------------------
create table if not exists public.mcv_team_members (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(name) between 2 and 120),
  role         text,
  bio          text,
  photo_url    text,
  position     integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Mensagens recebidas pelo formulário de contato
-- ---------------------------------------------------------------------
create table if not exists public.mcv_contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 2 and 120),
  email      text not null check (char_length(email) between 5 and 160),
  phone      text check (phone is null or char_length(phone) <= 40),
  subject    text check (subject is null or char_length(subject) <= 160),
  message    text not null check (char_length(message) between 5 and 5000),
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

-- =====================================================================
--  ROW LEVEL SECURITY
-- =====================================================================
alter table public.mcv_admin_users      enable row level security;
alter table public.mcv_site_content     enable row level security;
alter table public.mcv_events           enable row level security;
alter table public.mcv_albums           enable row level security;
alter table public.mcv_photos           enable row level security;
alter table public.mcv_posts            enable row level security;
alter table public.mcv_team_members     enable row level security;
alter table public.mcv_contact_messages enable row level security;

-- admin_users: cada admin vê a lista; só super admin altera
drop policy if exists "admins leem admins" on public.mcv_admin_users;
create policy "admins leem admins" on public.mcv_admin_users
  for select to authenticated using (mcv_private.mcv_is_admin());
drop policy if exists "super admin gerencia admins" on public.mcv_admin_users;
create policy "super admin gerencia admins" on public.mcv_admin_users
  for all to authenticated using (mcv_private.mcv_is_super_admin()) with check (mcv_private.mcv_is_super_admin());

-- site_content: leitura pública, escrita por admins
drop policy if exists "conteudo publico" on public.mcv_site_content;
create policy "conteudo publico" on public.mcv_site_content for select using (true);
drop policy if exists "admins editam conteudo" on public.mcv_site_content;
create policy "admins editam conteudo" on public.mcv_site_content
  for all to authenticated using (mcv_private.mcv_is_admin()) with check (mcv_private.mcv_is_admin());

-- events
drop policy if exists "eventos publicados" on public.mcv_events;
create policy "eventos publicados" on public.mcv_events
  for select using (is_published or mcv_private.mcv_is_admin());
drop policy if exists "admins gerenciam eventos" on public.mcv_events;
create policy "admins gerenciam eventos" on public.mcv_events
  for all to authenticated using (mcv_private.mcv_is_admin()) with check (mcv_private.mcv_is_admin());

-- albums
drop policy if exists "albuns publicados" on public.mcv_albums;
create policy "albuns publicados" on public.mcv_albums
  for select using (is_published or mcv_private.mcv_is_admin());
drop policy if exists "admins gerenciam albuns" on public.mcv_albums;
create policy "admins gerenciam albuns" on public.mcv_albums
  for all to authenticated using (mcv_private.mcv_is_admin()) with check (mcv_private.mcv_is_admin());

-- photos: visíveis quando o álbum está publicado
drop policy if exists "fotos de albuns publicados" on public.mcv_photos;
create policy "fotos de albuns publicados" on public.mcv_photos
  for select using (
    mcv_private.mcv_is_admin()
    or exists (select 1 from public.mcv_albums a where a.id = album_id and a.is_published)
  );
drop policy if exists "admins gerenciam fotos" on public.mcv_photos;
create policy "admins gerenciam fotos" on public.mcv_photos
  for all to authenticated using (mcv_private.mcv_is_admin()) with check (mcv_private.mcv_is_admin());

-- posts
drop policy if exists "posts publicados" on public.mcv_posts;
create policy "posts publicados" on public.mcv_posts
  for select using (is_published or mcv_private.mcv_is_admin());
drop policy if exists "admins gerenciam posts" on public.mcv_posts;
create policy "admins gerenciam posts" on public.mcv_posts
  for all to authenticated using (mcv_private.mcv_is_admin()) with check (mcv_private.mcv_is_admin());

-- team_members
drop policy if exists "equipe publicada" on public.mcv_team_members;
create policy "equipe publicada" on public.mcv_team_members
  for select using (is_published or mcv_private.mcv_is_admin());
drop policy if exists "admins gerenciam equipe" on public.mcv_team_members;
create policy "admins gerenciam equipe" on public.mcv_team_members
  for all to authenticated using (mcv_private.mcv_is_admin()) with check (mcv_private.mcv_is_admin());

-- contact_messages: qualquer visitante envia; só admins leem/alteram
drop policy if exists "visitantes enviam contato" on public.mcv_contact_messages;
create policy "visitantes enviam contato" on public.mcv_contact_messages
  for insert to anon, authenticated with check (is_read = false);
drop policy if exists "admins leem contatos" on public.mcv_contact_messages;
create policy "admins leem contatos" on public.mcv_contact_messages
  for select to authenticated using (mcv_private.mcv_is_admin());
drop policy if exists "admins atualizam contatos" on public.mcv_contact_messages;
create policy "admins atualizam contatos" on public.mcv_contact_messages
  for update to authenticated using (mcv_private.mcv_is_admin()) with check (mcv_private.mcv_is_admin());
drop policy if exists "admins removem contatos" on public.mcv_contact_messages;
create policy "admins removem contatos" on public.mcv_contact_messages
  for delete to authenticated using (mcv_private.mcv_is_admin());

-- =====================================================================
--  STORAGE — bucket "mulheres-com-visao" (fotos, banners e imagens)
--  Leitura pública; upload/edição/remoção somente por administradores.
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('mulheres-com-visao', 'mulheres-com-visao', true, 26214400, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Bucket público: as imagens são servidas pela URL pública sem precisar de
-- política de SELECT. A listagem dos arquivos fica restrita aos administradores.
drop policy if exists "mcv media listagem admins" on storage.objects;
create policy "mcv media listagem admins" on storage.objects
  for select to authenticated using (bucket_id = 'mulheres-com-visao' and mcv_private.mcv_is_admin());
drop policy if exists "mcv media upload admins" on storage.objects;
create policy "mcv media upload admins" on storage.objects
  for insert to authenticated with check (bucket_id = 'mulheres-com-visao' and mcv_private.mcv_is_admin());
drop policy if exists "mcv media update admins" on storage.objects;
create policy "mcv media update admins" on storage.objects
  for update to authenticated using (bucket_id = 'mulheres-com-visao' and mcv_private.mcv_is_admin());
drop policy if exists "mcv media delete admins" on storage.objects;
create policy "mcv media delete admins" on storage.objects
  for delete to authenticated using (bucket_id = 'mulheres-com-visao' and mcv_private.mcv_is_admin());

-- Conteúdo inicial (vazio: o site usa os textos padrão até que sejam editados)
insert into public.mcv_site_content (key, data) values
  ('home', '{}'::jsonb), ('about', '{}'::jsonb), ('contact', '{}'::jsonb), ('settings', '{}'::jsonb)
on conflict (key) do nothing;
