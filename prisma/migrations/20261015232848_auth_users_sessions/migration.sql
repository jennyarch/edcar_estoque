-- Auth própria do EdCar: tabelas users e sessions (substitui o auth.users do Supabase).
-- A API (Prisma) usa conexão direta e não depende de RLS nem de auth.uid().

-- ---------------------------------------------------------------------------
-- Usuários
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  email      text not null unique,
  telefone   text,
  avatar_url text,
  senha_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_email_idx on public.users (email);

-- ---------------------------------------------------------------------------
-- Sessões (histórico de tokens JWT emitidos)
-- ---------------------------------------------------------------------------
create table if not exists public.sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users (id) on delete cascade,
  token      text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists sessions_user_id_idx on public.sessions (user_id);
create index if not exists sessions_token_idx on public.sessions (token);

-- ---------------------------------------------------------------------------
-- stock_movements.user_id passa a referenciar public.users (não auth.users)
-- ---------------------------------------------------------------------------
alter table public.stock_movements
  drop constraint if exists stock_movements_user_id_fkey;

alter table public.stock_movements
  add constraint stock_movements_user_id_fkey
  foreign key (user_id) references public.users (id) on delete set null;

-- ---------------------------------------------------------------------------
-- updated_at automático em users
-- ---------------------------------------------------------------------------
drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
  before update on public.users
  for each row
  execute function public.handle_updated_at();
