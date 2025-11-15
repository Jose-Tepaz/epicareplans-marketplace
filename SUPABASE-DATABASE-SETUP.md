# Supabase Database Setup - Epicare Marketplace

## Overview

Configurar Supabase desde cero con:

- Autenticacion: Email/Password + OAuth (Google, Facebook)
- Base de datos: Guardar enrollments completos (sin datos de pago)
- User profiles con datos del formulario explore
- Sistema de estados para tracking futuro (draft, submitted, approved, etc.)
- Integracion en el flujo: Login despues del carrito, antes del enrollment

## 1. Configuracion Inicial de Supabase

### 1.1 Crear Proyecto en Supabase

- Ir a https://supabase.com
- Crear nuevo proyecto: "epicareplans-marketplace"
- Region: seleccionar la mas cercana a usuarios
- Guardar las credenciales del proyecto

### 1.2 Configurar Variables de Entorno

Crear/actualizar `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://[tu-proyecto].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[tu-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[tu-service-role-key]
```

### 1.3 Instalar Dependencias

```bash
npm install @supabase/supabase-js @supabase/ssr
```

## 2. Esquema de Base de Datos

### 2.1 Tabla: users (Perfil de Usuario)

Almacena datos del formulario explore y perfil completo del usuario para autocompletar futuros enrollments.

```sql
-- Tabla de usuarios (integrada con Supabase Auth)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email varchar(255) not null unique,
  
  -- Informacion personal
  first_name varchar(100),
  last_name varchar(100),
  phone varchar(20),
  
  -- Direccion
  address varchar(255),
  city varchar(100),
  state varchar(50),
  zip_code varchar(10),
  country varchar(100) default 'United States',
  
  -- Datos del formulario explore
  date_of_birth date,
  gender varchar(20),
  is_smoker boolean default false,
  last_tobacco_use date,
  coverage_start_date date,
  
  -- Estado del perfil
  explore_completed boolean default false,
  profile_completed boolean default false,
  
  -- Metadata
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp
);

comment on table public.users is 'Usuarios del sistema integrados con Supabase Auth';
comment on column public.users.explore_completed is 'Indica si el usuario completo el formulario explore';
comment on column public.users.profile_completed is 'Indica si el usuario ha completado todos los datos de su perfil';

-- Enable RLS
alter table public.users enable row level security;

-- Policies
create policy "users_select_own" on public.users
  for select
  using (auth.uid() = id);

create policy "users_update_own" on public.users
  for update
  using (auth.uid() = id);

create policy "users_insert_own" on public.users
  for insert
  with check (auth.uid() = id);

-- Indexes
create index idx_users_email on public.users(email);
```

### 2.2 Tabla: roles

Define los diferentes roles en el sistema (para uso futuro en otros modulos).

```sql
create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null unique,
  description text,
  created_at timestamp with time zone default current_timestamp
);

comment on table public.roles is 'Roles disponibles: admin, support_staff, finance_staff, agent, user';

-- Enable RLS
alter table public.roles enable row level security;

-- Policy: Todos pueden leer roles
create policy "roles_select_all" on public.roles
  for select
  using (true);

-- Datos iniciales
insert into public.roles (name, description) values
('admin', 'Administrador del sistema con acceso total'),
('support_staff', 'Personal de soporte para gestion de tickets y usuarios'),
('finance_staff', 'Personal de finanzas para gestion de pagos y comisiones'),
('agent', 'Agente de ventas'),
('cliente', 'Cliente estándar del sistema');
```

### 2.3 Tabla: user_roles

Relacion muchos a muchos entre usuarios y roles (para uso futuro en otros modulos).

```sql
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  created_at timestamp with time zone default current_timestamp,
  unique(user_id, role_id)
);

comment on table public.user_roles is 'Asignacion de roles a usuarios (M:N)';

-- Enable RLS
alter table public.user_roles enable row level security;

-- Policy: Los usuarios pueden ver sus propios roles
create policy "user_roles_select_own" on public.user_roles
  for select
  using (auth.uid() = user_id);

-- Indexes
create index idx_user_roles_user_id on public.user_roles(user_id);
create index idx_user_roles_role_id on public.user_roles(role_id);
```

### 2.4 Tabla: insurance_companies (Aseguradoras)

Empresas proveedoras de seguros (Allstate, Ameritas, etc.).

```sql
create table public.insurance_companies (
  id uuid primary key default gen_random_uuid(),
  name varchar(150) not null unique,
  slug varchar(100) not null unique, -- URL-friendly name
  description text,
  logo_url varchar(500),
  website varchar(255),
  api_endpoint varchar(500) not null, -- URL base de la API
  contact_email varchar(255),
  
  -- Configuracion de integracion
  supported_products jsonb, -- ["life", "accident", "medicare"]
  integration_status varchar(20) default 'active', -- pending, active, testing, disabled
  
  is_active boolean default true,
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp
);

comment on table public.insurance_companies is 'Companias aseguradoras integradas al sistema';
comment on column public.insurance_companies.api_endpoint is 'URL base de la API de la aseguradora';
comment on column public.insurance_companies.supported_products is 'Tipos de productos soportados en JSON';

-- Enable RLS
alter table public.insurance_companies enable row level security;

-- Policy: Todos pueden ver aseguradoras activas
create policy "insurance_companies_select_active" on public.insurance_companies
  for select
  using (is_active = true);

-- Indexes
create index idx_insurance_companies_slug on public.insurance_companies(slug);
create index idx_insurance_companies_active on public.insurance_companies(is_active);
```

### 2.5 Tabla: agents (Agentes de Ventas)

Agentes de ventas asociados a cada aseguradora.

```sql
create table public.agents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.insurance_companies(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null, -- Para agentes internos con cuenta
  
  -- Informacion del agente
  name varchar(150) not null,
  email varchar(255),
  phone varchar(20),
  
  -- Identificadores
  agent_code varchar(100) not null unique, -- Codigo unico interno de Epicare
  external_agent_id varchar(255) not null, -- ID en la API externa (ej: "159208")
  
  -- Comisiones
  commission_percentage decimal(5, 2), -- Porcentaje de comision (ej: 5.50%)
  
  -- Datos adicionales
  additional_data jsonb, -- Datos especificos por aseguradora
  
  is_active boolean default true,
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp,
  
  unique(company_id, external_agent_id)
);

comment on table public.agents is 'Agentes de ventas vinculados a aseguradoras';
comment on column public.agents.external_agent_id is 'ID del agente usado en las APIs externas (agentNumber)';
comment on column public.agents.commission_percentage is 'Porcentaje de comision por venta';
comment on column public.agents.user_id is 'Referencia a usuario interno si el agente tiene cuenta en el sistema';

-- Enable RLS
alter table public.agents enable row level security;

-- Policy: Solo staff puede ver datos de agentes (por las comisiones)
create policy "agents_select_staff" on public.agents
  for select
  using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on r.id = ur.role_id
      where ur.user_id = auth.uid()
      and r.name in ('admin', 'support_staff', 'finance_staff')
    )
  );

-- Indexes
create index idx_agents_company_id on public.agents(company_id);
create index idx_agents_external_id on public.agents(external_agent_id);
create index idx_agents_is_active on public.agents(is_active);
create index idx_agents_user_id on public.agents(user_id);
create index idx_agents_agent_code on public.agents(agent_code);
```

### 2.6 Tabla: applications

Almacena cada solicitud de enrollment con toda la informacion enviada a la API.

```sql
create type application_status as enum (
  'draft',
  'submitted',
  'pending_approval',
  'approved',
  'rejected',
  'active',
  'cancelled'
);

create table public.applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  
  -- Relaciones con aseguradora y agente
  company_id uuid references public.insurance_companies(id),
  agent_id uuid references public.agents(id),
  
  -- Estado de la aplicacion
  status application_status default 'draft' not null,
  
  -- Referencia de la aseguradora
  external_reference_id text, -- ID retornado por la API de la aseguradora
  carrier_name text,
  
  -- Demographics (del enrollment)
  zip_code text not null,
  email text not null,
  address1 text not null,
  address2 text,
  city text not null,
  state text not null,
  phone text not null,
  alternate_phone text,
  zip_code_plus4 text,
  
  -- Enrollment metadata
  enrollment_date timestamp with time zone,
  effective_date date,
  
  -- JSON completo del enrollment (sin datos de pago)
  enrollment_data jsonb not null,
  
  -- Respuesta de la API
  api_response jsonb,
  api_error jsonb,
  
  -- Metadata
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.applications enable row level security;

-- Policies
create policy "Users can view own applications"
  on public.applications for select
  using (auth.uid() = user_id);

create policy "Users can insert own applications"
  on public.applications for insert
  with check (auth.uid() = user_id);

create policy "Users can update own applications"
  on public.applications for update
  using (auth.uid() = user_id);

-- Indexes
create index applications_user_id_idx on public.applications(user_id);
create index applications_company_id_idx on public.applications(company_id);
create index applications_agent_id_idx on public.applications(agent_id);
create index applications_status_idx on public.applications(status);
create index applications_created_at_idx on public.applications(created_at desc);
```

### 2.7 Tabla: applicants

Almacena los aplicantes de cada application (primary + dependientes).

```sql
create table public.applicants (
  id uuid default gen_random_uuid() primary key,
  application_id uuid references public.applications on delete cascade not null,
  
  applicant_id text not null, -- ID interno usado en el enrollment
  
  -- Datos personales
  first_name text not null,
  middle_initial text,
  last_name text not null,
  gender text not null,
  date_of_birth date not null,
  ssn text not null, -- Encriptado en produccion
  relationship text not null, -- Primary, Spouse, Dependent
  
  -- Datos de salud
  smoker boolean not null,
  date_last_smoked date,
  weight numeric,
  height_feet integer,
  height_inches integer,
  has_prior_coverage boolean,
  
  -- Rate tiers
  eligible_rate_tier text,
  quoted_rate_tier text,
  
  -- Medicare info (JSON)
  med_supp_info jsonb,
  
  -- Medications y Question Responses (JSON arrays)
  medications jsonb,
  question_responses jsonb,
  phone_numbers jsonb,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.applicants enable row level security;

-- Policy: Users can view applicants of their own applications
create policy "Users can view own applicants"
  on public.applicants for select
  using (
    exists (
      select 1 from public.applications
      where applications.id = applicants.application_id
      and applications.user_id = auth.uid()
    )
  );

-- Indexes
create index applicants_application_id_idx on public.applicants(application_id);
```

### 2.8 Tabla: coverages

Almacena las coberturas/planes seleccionados en cada application.

```sql
create table public.coverages (
  id uuid default gen_random_uuid() primary key,
  application_id uuid references public.applications on delete cascade not null,
  
  -- Plan info
  plan_key text not null,
  carrier_name text,
  
  -- Coverage details
  effective_date date not null,
  monthly_premium numeric not null,
  payment_frequency text not null,
  
  term integer,
  number_of_terms integer,
  termination_date date,
  
  -- Options
  is_automatic_loan_provision_opted_in boolean default false,
  
  -- Riders y discounts (JSON arrays)
  riders jsonb,
  discounts jsonb,
  
  -- Agent info
  agent_number text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.coverages enable row level security;

-- Policy
create policy "Users can view own coverages"
  on public.coverages for select
  using (
    exists (
      select 1 from public.applications
      where applications.id = coverages.application_id
      and applications.user_id = auth.uid()
    )
  );

-- Indexes
create index coverages_application_id_idx on public.coverages(application_id);
```

### 2.9 Tabla: beneficiaries

Almacena los beneficiarios de cada application.

```sql
create table public.beneficiaries (
  id uuid default gen_random_uuid() primary key,
  application_id uuid references public.applications on delete cascade not null,
  
  beneficiary_id integer not null,
  
  -- Personal info
  first_name text not null,
  middle_name text,
  last_name text not null,
  relationship text not null,
  date_of_birth date not null,
  
  -- Allocation
  allocation_percentage integer not null,
  
  -- Contact info (JSON)
  addresses jsonb,
  phone_numbers jsonb,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.beneficiaries enable row level security;

-- Policy
create policy "Users can view own beneficiaries"
  on public.beneficiaries for select
  using (
    exists (
      select 1 from public.applications
      where applications.id = beneficiaries.application_id
      and applications.user_id = auth.uid()
    )
  );

-- Indexes
create index beneficiaries_application_id_idx on public.beneficiaries(application_id);
```

### 2.10 Tabla: application_status_history

Tracking de cambios de estado (para auditoria y uso futuro).

```sql
create table public.application_status_history (
  id uuid default gen_random_uuid() primary key,
  application_id uuid references public.applications on delete cascade not null,
  
  previous_status application_status,
  new_status application_status not null,
  
  changed_by uuid references auth.users,
  notes text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.application_status_history enable row level security;

-- Policy
create policy "Users can view own status history"
  on public.application_status_history for select
  using (
    exists (
      select 1 from public.applications
      where applications.id = application_status_history.application_id
      and applications.user_id = auth.uid()
    )
  );

-- Indexes
create index application_status_history_application_id_idx 
  on public.application_status_history(application_id);
```

### 2.11 Triggers para updated_at

```sql
-- Function para actualizar updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger para users
create trigger set_updated_at
  before update on public.users
  for each row
  execute function public.handle_updated_at();

-- Trigger para insurance_companies
create trigger set_updated_at
  before update on public.insurance_companies
  for each row
  execute function public.handle_updated_at();

-- Trigger para agents
create trigger set_updated_at
  before update on public.agents
  for each row
  execute function public.handle_updated_at();

-- Trigger para applications
create trigger set_updated_at
  before update on public.applications
  for each row
  execute function public.handle_updated_at();
```

### 2.12 Function para crear perfil automaticamente

```sql
-- Function para crear user cuando se crea un nuevo usuario en auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger en auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

## 3. Configuracion de Autenticacion en Supabase

### 3.1 Habilitar Proveedores de Auth

En Supabase Dashboard > Authentication > Providers:

- Habilitar Email (Password-based)
- Habilitar Google OAuth
- Habilitar Facebook OAuth
- Configurar URLs de redireccion:
  - Development: http://localhost:3000/auth/callback
  - Production: https://epicareplans.com/auth/callback

### 3.2 Configurar Email Templates

En Supabase Dashboard > Authentication > Email Templates:

- Personalizar plantilla de confirmacion con branding de Epicare

## 4. Datos Iniciales

### 4.1 Insertar Aseguradora Allstate

```sql
-- Insertar Allstate como aseguradora
insert into public.insurance_companies (name, slug, description, api_endpoint, supported_products, integration_status) values
('Allstate', 'allstate', 'Allstate Insurance Company', 'https://qa1-ngahservices.ngic.com', '["life", "accident"]', 'active');

-- Obtener el ID de Allstate (guardarlo para el siguiente paso)
select id from public.insurance_companies where slug = 'allstate';

-- Insertar agente de Allstate (reemplazar [allstate-id] con el ID obtenido)
insert into public.agents (company_id, name, agent_code, external_agent_id, is_active) values
('[allstate-id]', 'Epicare Agent', 'EPIC-001', '159208', true);
```

## 5. Notas Importantes

- **API Keys**: NO se guardan en la base de datos, siempre en .env
- **SSN**: Debe encriptarse en produccion usando Supabase Vault
- **RLS**: Ya configurado para proteger datos de usuarios
- **Roles**: Sistema preparado para modulos futuros (admin, support, finance, agent)
- **Applications**: Guarda JSON completo SIN datos de pago

