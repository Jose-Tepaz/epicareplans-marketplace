-- ============================================
-- SISTEMA DE CONFIGURACIÓN PARA MÚLTIPLES ASEGURADORAS
-- ============================================
-- Descripción: Tablas para manejar campos, secciones y pagos específicos por aseguradora
-- Fecha: 2025-01-23
-- ============================================

-- ============================================
-- 1. TABLA DE CONFIGURACIÓN DE CAMPOS
-- ============================================
-- Descripción: Define qué campos específicos necesita cada aseguradora
-- ============================================

create table public.insurance_company_field_configs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.insurance_companies(id) on delete cascade,
  
  field_name varchar(100) not null,
  field_category varchar(50) not null,
  is_required boolean default false,
  is_enabled boolean default true,
  field_type varchar(50) not null,
  
  validation_rules jsonb,
  error_message text,
  
  api_field_name varchar(100),
  api_section varchar(100),
  transformation_rule jsonb,
  
  display_label varchar(255),
  display_placeholder varchar(255),
  help_text text,
  display_order integer default 0,
  
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp,
  
  unique(company_id, field_name)
);

create index idx_company_field_configs_company on insurance_company_field_configs(company_id);
alter table public.insurance_company_field_configs enable row level security;

create policy "field_configs_select_all" on public.insurance_company_field_configs
  for select using (true);

comment on table public.insurance_company_field_configs is 'Configuración de campos específicos por aseguradora';
comment on column public.insurance_company_field_configs.field_name is 'Nombre del campo (ej: medicare_id, tobacco_use)';
comment on column public.insurance_company_field_configs.field_category is 'Categoría: demographics, health, payment, coverage';
comment on column public.insurance_company_field_configs.api_field_name is 'Nombre del campo en la API de la aseguradora';
comment on column public.insurance_company_field_configs.transformation_rule is 'Reglas de transformación JSON para mapear datos';

-- ============================================
-- 2. TABLA DE CONFIGURACIÓN DE SECCIONES
-- ============================================
-- Descripción: Define qué secciones del formulario necesita cada aseguradora
-- ============================================

create table public.insurance_company_form_sections (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.insurance_companies(id) on delete cascade,
  
  section_name varchar(100) not null,
  section_title varchar(255),
  section_description text,
  
  is_enabled boolean default true,
  is_required boolean default false,
  section_config jsonb,
  conditional_logic jsonb,
  display_order integer default 0,
  
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp,
  
  unique(company_id, section_name)
);

create index idx_company_form_sections_company on insurance_company_form_sections(company_id);
alter table public.insurance_company_form_sections enable row level security;

create policy "form_sections_select_all" on public.insurance_company_form_sections
  for select using (true);

comment on table public.insurance_company_form_sections is 'Configuración de secciones del formulario por aseguradora';
comment on column public.insurance_company_form_sections.section_name is 'Nombre de la sección (ej: health_questions, payment_info)';
comment on column public.insurance_company_form_sections.conditional_logic is 'Lógica condicional JSON para mostrar/ocultar secciones';

-- ============================================
-- 3. TABLA DE CONFIGURACIÓN DE PAGOS
-- ============================================
-- Descripción: Configuración de procesadores de pago por aseguradora
-- ============================================

create table public.insurance_company_payment_configs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null unique references public.insurance_companies(id) on delete cascade,
  
  -- Procesador de pago
  payment_processor varchar(100) not null,
  
  -- Endpoints
  payment_api_endpoint varchar(500),
  tokenization_endpoint varchar(500),  -- NULL por ahora, se usará en el futuro
  
  -- Métodos de pago soportados
  supports_credit_card boolean default true,
  supports_debit_card boolean default false,
  supports_ach boolean default true,
  
  -- Configuración por método
  credit_card_config jsonb,
  ach_config jsonb,
  
  -- Frecuencias de pago soportadas
  supported_payment_frequencies jsonb,
  
  -- Comportamiento
  requires_tokenization boolean default false,  -- FALSE por ahora
  
  -- Metadata
  is_active boolean default true,
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp
);

comment on table public.insurance_company_payment_configs is 'Configuración de pagos por aseguradora (preparada para tokenización futura)';
comment on column public.insurance_company_payment_configs.requires_tokenization is 'FALSE = envío directo, TRUE = tokenización (futuro)';
comment on column public.insurance_company_payment_configs.credit_card_config is 'Configuración específica para tarjetas de crédito';
comment on column public.insurance_company_payment_configs.ach_config is 'Configuración específica para ACH/banco';
comment on column public.insurance_company_payment_configs.supported_payment_frequencies is 'Frecuencias soportadas: ["None", "Monthly", "SinglePayment", "Quarterly", "SemiAnnual", "Annual", "SocialSecurityMonthly"]';

create index idx_company_payment_configs_company on insurance_company_payment_configs(company_id);
alter table public.insurance_company_payment_configs enable row level security;

create policy "payment_configs_select_all" on public.insurance_company_payment_configs
  for select using (true);

-- ============================================
-- 4. TABLA DE TRANSACCIONES POR ASEGURADORA
-- ============================================
-- Descripción: Tracking de transacciones de pago por aseguradora
-- ============================================

create table public.application_payment_transactions (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  company_id uuid not null references public.insurance_companies(id),
  
  -- Estado de la transacción
  transaction_status varchar(50) not null,
  transaction_reference varchar(255),
  
  -- Montos
  amount decimal(10, 2) not null,
  currency varchar(3) default 'USD',
  
  -- Método de pago usado
  payment_method varchar(50) not null,
  payment_token text,  -- NULL por ahora, se usará con tokenización
  
  -- Frecuencia de pago
  payment_frequency varchar(50),
  next_payment_date date,
  payment_schedule jsonb,
  
  -- Información adicional del método (sin datos sensibles)
  payment_method_info jsonb,
  
  -- Respuesta del procesador
  processor_response jsonb,
  processor_error jsonb,
  
  -- Metadata
  processed_at timestamp with time zone,
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp
);

comment on table public.application_payment_transactions is 'Transacciones de pago por aseguradora';
comment on column public.application_payment_transactions.payment_token is 'NULL por ahora, se usará con tokenización futura';
comment on column public.application_payment_transactions.payment_frequency is 'Frecuencia de pago: None, Monthly, SinglePayment, Quarterly, SemiAnnual, Annual, SocialSecurityMonthly';
comment on column public.application_payment_transactions.next_payment_date is 'Próxima fecha de cobro calculada';
comment on column public.application_payment_transactions.payment_schedule is 'Cronograma de pagos futuros en JSON';
comment on column public.application_payment_transactions.payment_method_info is 'Info no sensible: últimos 4 dígitos, marca, etc.';

create index idx_payment_transactions_application on application_payment_transactions(application_id);
create index idx_payment_transactions_company on application_payment_transactions(company_id);
create index idx_payment_transactions_status on application_payment_transactions(transaction_status);

alter table public.application_payment_transactions enable row level security;

create policy "payment_transactions_select_own" on public.application_payment_transactions
  for select using (
    exists (
      select 1 from public.applications
      where applications.id = application_payment_transactions.application_id
      and applications.user_id = auth.uid()
    )
  );

-- ============================================
-- 5. MODIFICAR TABLA APPLICATIONS PARA MULTI-CARRIER
-- ============================================
-- Descripción: Agregar soporte para enrollments con múltiples aseguradoras
-- ============================================

alter table public.applications 
  add column if not exists is_multi_carrier boolean default false,
  add column if not exists parent_application_id uuid references public.applications(id),
  add column if not exists payment_status varchar(50) default 'pending',
  add column if not exists member_id varchar(255),
  add column if not exists member_portal_url text,
  add column if not exists attestation_status varchar(100),
  add column if not exists allstate_links jsonb;

comment on column public.applications.is_multi_carrier is 'True si incluye planes de múltiples aseguradoras';
comment on column public.applications.parent_application_id is 'ID de aplicación padre si es sub-enrollment';
comment on column public.applications.payment_status is 'pending, partially_paid, paid, failed';
comment on column public.applications.member_id is 'ID del miembro en la aseguradora (ej: Allstate memberId)';
comment on column public.applications.member_portal_url is 'URL del portal del miembro';
comment on column public.applications.attestation_status is 'Estado de la atestación';
comment on column public.applications.allstate_links is 'Enlaces de la respuesta de Allstate API';

create index if not exists idx_applications_parent on public.applications(parent_application_id);

-- ============================================
-- 6. TABLA DE RESULTADOS DE SUBMISSION POR PLAN
-- ============================================
-- Descripción: Resultados específicos de cada plan en el enrollment
-- ============================================

create table public.application_submission_results (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  
  -- Información del plan
  plan_type integer,
  plan_key varchar(255),
  
  -- Resultados de submission
  submission_received boolean default false,
  policy_no varchar(255),
  total_rate decimal(10, 2),
  effective_date date,
  application_id_external integer,
  partner_application_id integer,
  
  -- Errores específicos del plan
  submission_errors jsonb,
  
  -- Metadata
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp
);

comment on table public.application_submission_results is 'Resultados de submission por plan individual';
comment on column public.application_submission_results.plan_type is 'Tipo de plan (código numérico)';
comment on column public.application_submission_results.policy_no is 'Número de póliza asignado';
comment on column public.application_submission_results.total_rate is 'Tarifa total del plan';
comment on column public.application_submission_results.submission_errors is 'Errores específicos del plan en JSON';

create index idx_submission_results_application on application_submission_results(application_id);
create index idx_submission_results_policy on application_submission_results(policy_no);

alter table public.application_submission_results enable row level security;

create policy "submission_results_select_own" on public.application_submission_results
  for select using (
    exists (
      select 1 from public.applications
      where applications.id = application_submission_results.application_id
      and applications.user_id = auth.uid()
    )
  );

-- Trigger para submission_results
create trigger set_updated_at_submission_results
  before update on public.application_submission_results
  for each row
  execute function public.handle_updated_at();

-- ============================================
-- 7. TABLA DE ERRORES DE VALIDACIÓN
-- ============================================
-- Descripción: Errores de validación de la API de Allstate
-- ============================================

create table public.application_validation_errors (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  
  -- Información del error
  error_code varchar(100),
  error_detail text,
  
  -- Metadata
  created_at timestamp with time zone default current_timestamp
);

comment on table public.application_validation_errors is 'Errores de validación de la API de Allstate';
comment on column public.application_validation_errors.error_code is 'Código del error';
comment on column public.application_validation_errors.error_detail is 'Detalle del error';

create index idx_validation_errors_application on application_validation_errors(application_id);
create index idx_validation_errors_code on application_validation_errors(error_code);

alter table public.application_validation_errors enable row level security;

create policy "validation_errors_select_own" on public.application_validation_errors
  for select using (
    exists (
      select 1 from public.applications
      where applications.id = application_validation_errors.application_id
      and applications.user_id = auth.uid()
    )
  );

-- ============================================
-- 6. AGREGAR TRIGGERS
-- ============================================
-- Descripción: Triggers para actualizar updated_at automáticamente
-- ============================================

create trigger set_updated_at_field_configs
  before update on public.insurance_company_field_configs
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at_form_sections
  before update on public.insurance_company_form_sections
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at_payment_configs
  before update on public.insurance_company_payment_configs
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at_payment_transactions
  before update on public.application_payment_transactions
  for each row
  execute function public.handle_updated_at();

-- ============================================
-- 7. INSERTAR CONFIGURACIÓN DE ALLSTATE
-- ============================================
-- Descripción: Configuración inicial para Allstate (SIN tokenización)
-- ============================================

-- Configuración de pago para Allstate (SIN tokenización por ahora)
insert into public.insurance_company_payment_configs 
  (company_id, payment_processor, payment_api_endpoint, 
   supports_credit_card, supports_ach, requires_tokenization,
   tokenization_endpoint, credit_card_config, ach_config, supported_payment_frequencies)
select 
  ic.id,
  'allstate_direct',
  'https://qa1-ngahservices.ngic.com/enrollment',
  true,
  true,
  false,  -- NO requiere tokenización por ahora
  null,   -- Sin endpoint de tokenización
  '{"brands": ["visa", "mastercard", "amex", "discover"], "requires_cvv": true, "min_cvv_length": 3}'::jsonb,
  '{"account_types": ["checking", "savings"], "requires_routing": true, "routing_length": 9}'::jsonb,
  '["None", "Monthly", "SinglePayment", "Quarterly", "SemiAnnual", "Annual", "SocialSecurityMonthly"]'::jsonb
from public.insurance_companies ic 
where ic.slug = 'allstate';

-- ============================================
-- NOTAS DE IMPLEMENTACIÓN
-- ============================================
-- 
-- 1. Para agregar una nueva aseguradora:
--    - Insertar en insurance_companies
--    - Insertar configuración en insurance_company_payment_configs
--    - Insertar campos específicos en insurance_company_field_configs
--    - Insertar secciones en insurance_company_form_sections
--
-- 2. Para habilitar tokenización en el futuro:
--    - Cambiar requires_tokenization a true
--    - Agregar tokenization_endpoint
--    - Actualizar el código para usar tokenización
--
-- 3. Multi-carrier funciona así:
--    - 1 application padre (is_multi_carrier = true)
--    - N applications hijos (parent_application_id = padre.id)
--    - N transacciones en application_payment_transactions
--
-- ============================================
