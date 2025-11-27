-- ============================================
-- FAMILY MEMBERS TABLE
-- ============================================
-- Tabla para almacenar miembros familiares del usuario
-- Se usa para calcular precios en insurance-options antes de crear una application
-- ============================================

-- Crear función trigger para updated_at si no existe
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Crear tabla family_members
create table public.family_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  
  -- Información personal
  first_name varchar(100) not null,
  middle_initial varchar(10),
  last_name varchar(100) not null,
  gender varchar(20) not null,
  date_of_birth date not null,
  ssn varchar(11),
  relationship varchar(50) not null,
  
  -- Información de salud
  smoker boolean default false,
  date_last_smoked date,
  weight integer,
  height_feet integer,
  height_inches integer,
  has_prior_coverage boolean default false,
  
  -- Metadata
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp,
  
  unique(user_id, first_name, last_name, date_of_birth)
);

comment on table public.family_members is 'Miembros familiares del usuario para calcular precios de seguros';
comment on column public.family_members.user_id is 'Usuario propietario del family member';
comment on column public.family_members.relationship is 'Relación con el usuario: Spouse, Child, Dependent, etc.';

-- Enable RLS
alter table public.family_members enable row level security;

-- Policies: Los usuarios solo pueden ver/editar sus propios family members
create policy "family_members_select_own" on public.family_members
  for select
  using (auth.uid() = user_id);

create policy "family_members_insert_own" on public.family_members
  for insert
  with check (auth.uid() = user_id);

create policy "family_members_update_own" on public.family_members
  for update
  using (auth.uid() = user_id);

create policy "family_members_delete_own" on public.family_members
  for delete
  using (auth.uid() = user_id);

-- Índices
create index idx_family_members_user_id on public.family_members(user_id);
create index idx_family_members_created_at on public.family_members(created_at);

-- Trigger para actualizar updated_at
create trigger update_family_members_updated_at
  before update on public.family_members
  for each row
  execute function public.update_updated_at_column();

