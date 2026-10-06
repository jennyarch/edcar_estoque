-- ============================================================================
-- EdCar Estoque — perfis de usuário (dados do cadastro)
-- Complementa 0001_init.sql; execute depois dela.
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

-- ---------------------------------------------------------------------------
-- Permissões
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on public.profiles to authenticated;
