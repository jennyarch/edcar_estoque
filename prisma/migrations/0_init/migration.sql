-- Baseline do schema public (tabelas Prisma + extras do Postgres/Supabase).
-- Extras que o Prisma não gera: extensão pg_trgm, CHECKs, índices GIN,
-- triggers, funções (dar_baixa, handle_new_user, …), RLS, GRANTs e FKs para
-- auth.users. Se o banco já recebeu o SQL antigo em supabase/migrations,
-- marque esta migration como aplicada: npm run db:baseline

-- ============================================================================
-- EdCar Estoque — schema inicial
-- ============================================================================

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'categoria') then
    create type public.categoria as enum ('diafragma', 'pecas');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'tipo_movimento') then
    create type public.tipo_movimento as enum ('entrada', 'baixa', 'ajuste');
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Itens do estoque
-- ---------------------------------------------------------------------------
create table if not exists public.items (
  id           uuid primary key default gen_random_uuid(),
  categoria    public.categoria not null,
  codigo       text not null,
  nome         text not null,
  modelo       text not null,
  descricao    text,
  medidas      integer not null check (medidas between 1 and 5000),
  qtd_estoque  integer not null default 0 check (qtd_estoque >= 0),
  valor        numeric(12, 2) check (valor is null or valor > 0),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  -- Peças sempre têm valor; diafragma não exige.
  constraint items_valor_por_categoria check (
    categoria <> 'pecas' or valor > 0
  )
);

create index if not exists items_categoria_nome_idx on public.items (categoria, nome);
create index if not exists items_codigo_trgm_idx on public.items using gin (codigo gin_trgm_ops);
create index if not exists items_nome_trgm_idx on public.items using gin (nome gin_trgm_ops);
create index if not exists items_modelo_trgm_idx on public.items using gin (modelo gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- Movimentações (histórico de entradas, baixas e ajustes)
-- ---------------------------------------------------------------------------
create table if not exists public.stock_movements (
  id              uuid primary key default gen_random_uuid(),
  item_id         uuid not null references public.items (id) on delete cascade,
  tipo            public.tipo_movimento not null,
  quantidade      integer not null check (quantidade > 0),
  saldo_anterior  integer,
  saldo_posterior integer,
  user_id         uuid references auth.users (id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists stock_movements_item_idx on public.stock_movements (item_id);
create index if not exists stock_movements_created_idx on public.stock_movements (created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists items_set_updated_at on public.items;
create trigger items_set_updated_at
  before update on public.items
  for each row
  execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Baixa atômica: trava a linha, valida o saldo e grava o movimento.
-- Retorna o novo saldo.
-- ---------------------------------------------------------------------------
create or replace function public.dar_baixa(item_id uuid, quantidade integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  saldo_atual integer;
  novo_saldo  integer;
begin
  if quantidade is null or quantidade < 1 then
    raise exception 'Informe uma quantidade maior que zero.';
  end if;

  select i.qtd_estoque
    into saldo_atual
    from public.items i
   where i.id = item_id
     for update;

  if not found then
    raise exception 'Item não encontrado.';
  end if;

  if saldo_atual < quantidade then
    raise exception 'Saldo insuficiente (% unidade(s) em estoque).', saldo_atual;
  end if;

  novo_saldo := saldo_atual - quantidade;

  update public.items
     set qtd_estoque = novo_saldo
   where id = item_id;

  insert into public.stock_movements
    (item_id, tipo, quantidade, saldo_anterior, saldo_posterior, user_id)
  values
    (item_id, 'baixa', quantidade, saldo_atual, novo_saldo, auth.uid());

  return novo_saldo;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security: leitura e escrita apenas para usuários autenticados
-- ---------------------------------------------------------------------------
alter table public.items enable row level security;
alter table public.stock_movements enable row level security;

drop policy if exists items_select on public.items;
create policy items_select on public.items
  for select to authenticated using (true);
drop policy if exists items_insert on public.items;
create policy items_insert on public.items
  for insert to authenticated with check (true);
drop policy if exists items_update on public.items;
create policy items_update on public.items
  for update to authenticated using (true) with check (true);
drop policy if exists items_delete on public.items;
create policy items_delete on public.items
  for delete to authenticated using (true);

drop policy if exists movements_select on public.stock_movements;
create policy movements_select on public.stock_movements
  for select to authenticated using (true);
drop policy if exists movements_insert on public.stock_movements;
create policy movements_insert on public.stock_movements
  for insert to authenticated with check (true);
drop policy if exists movements_update on public.stock_movements;
create policy movements_update on public.stock_movements
  for update to authenticated using (true) with check (true);
drop policy if exists movements_delete on public.stock_movements;
create policy movements_delete on public.stock_movements
  for delete to authenticated using (true);

-- ---------------------------------------------------------------------------
-- Permissões
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on public.items to authenticated;
grant select, insert, update, delete on public.stock_movements to authenticated;

revoke execute on function public.dar_baixa(uuid, integer) from public;
revoke execute on function public.dar_baixa(uuid, integer) from anon;
grant execute on function public.dar_baixa(uuid, integer) to authenticated;

-- ============================================================================
-- Perfis de usuário (dados do cadastro)
-- ============================================================================

create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  nome       text not null default '',
  email      text,
  telefone   text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_nome_idx on public.profiles (nome);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Cria o perfil automaticamente quando um usuário é criado no Supabase Auth
-- (lê nome/telefone/avatar enviados em user_metadata no signup).
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome, email, telefone, avatar_url)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'nome'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      split_part(coalesce(new.email, 'usuario'), '@', 1)
    ),
    new.email,
    nullif(trim(new.raw_user_meta_data ->> 'telefone'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'avatar_url'), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Mantém o e-mail do perfil sincronizado com o auth.users
-- ---------------------------------------------------------------------------
create or replace function public.handle_user_email_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles
       set email = new.email
     where id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.handle_user_email_sync();

-- ---------------------------------------------------------------------------
-- Row Level Security: cada usuário lê e edita apenas o próprio perfil
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_delete_own on public.profiles
  for delete to authenticated
  using (auth.uid() = id);

grant select, insert, update, delete on public.profiles to authenticated;
