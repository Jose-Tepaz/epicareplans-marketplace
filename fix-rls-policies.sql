-- ============================================
-- FIX RLS POLICIES - EPICARE MARKETPLACE
-- ============================================
-- Este archivo corrige las políticas RLS faltantes para permitir
-- operaciones INSERT, UPDATE y DELETE en las tablas relacionadas
-- ============================================

-- ============================================
-- 1. APPLICANTS TABLE - Agregar políticas faltantes
-- ============================================

-- Policy para INSERT: Los usuarios pueden insertar applicants en sus propias applications
create policy "Users can insert own applicants"
  on public.applicants for insert
  with check (
    exists (
      select 1 from public.applications
      where applications.id = applicants.application_id
      and applications.user_id = auth.uid()
    )
  );

-- Policy para UPDATE: Los usuarios pueden actualizar applicants de sus propias applications
create policy "Users can update own applicants"
  on public.applicants for update
  using (
    exists (
      select 1 from public.applications
      where applications.id = applicants.application_id
      and applications.user_id = auth.uid()
    )
  );

-- Policy para DELETE: Los usuarios pueden eliminar applicants de sus propias applications
create policy "Users can delete own applicants"
  on public.applicants for delete
  using (
    exists (
      select 1 from public.applications
      where applications.id = applicants.application_id
      and applications.user_id = auth.uid()
    )
  );

-- ============================================
-- 2. COVERAGES TABLE - Agregar políticas faltantes
-- ============================================

-- Policy para INSERT: Los usuarios pueden insertar coverages en sus propias applications
create policy "Users can insert own coverages"
  on public.coverages for insert
  with check (
    exists (
      select 1 from public.applications
      where applications.id = coverages.application_id
      and applications.user_id = auth.uid()
    )
  );

-- Policy para UPDATE: Los usuarios pueden actualizar coverages de sus propias applications
create policy "Users can update own coverages"
  on public.coverages for update
  using (
    exists (
      select 1 from public.applications
      where applications.id = coverages.application_id
      and applications.user_id = auth.uid()
    )
  );

-- Policy para DELETE: Los usuarios pueden eliminar coverages de sus propias applications
create policy "Users can delete own coverages"
  on public.coverages for delete
  using (
    exists (
      select 1 from public.applications
      where applications.id = coverages.application_id
      and applications.user_id = auth.uid()
    )
  );

-- ============================================
-- 3. BENEFICIARIES TABLE - Agregar políticas faltantes
-- ============================================

-- Policy para INSERT: Los usuarios pueden insertar beneficiaries en sus propias applications
create policy "Users can insert own beneficiaries"
  on public.beneficiaries for insert
  with check (
    exists (
      select 1 from public.applications
      where applications.id = beneficiaries.application_id
      and applications.user_id = auth.uid()
    )
  );

-- Policy para UPDATE: Los usuarios pueden actualizar beneficiaries de sus propias applications
create policy "Users can update own beneficiaries"
  on public.beneficiaries for update
  using (
    exists (
      select 1 from public.applications
      where applications.id = beneficiaries.application_id
      and applications.user_id = auth.uid()
    )
  );

-- Policy para DELETE: Los usuarios pueden eliminar beneficiaries de sus propias applications
create policy "Users can delete own beneficiaries"
  on public.beneficiaries for delete
  using (
    exists (
      select 1 from public.applications
      where applications.id = beneficiaries.application_id
      and applications.user_id = auth.uid()
    )
  );

-- ============================================
-- 4. APPLICATION_STATUS_HISTORY TABLE - Agregar políticas faltantes
-- ============================================

-- Policy para INSERT: Los usuarios pueden insertar status history en sus propias applications
create policy "Users can insert own status history"
  on public.application_status_history for insert
  with check (
    exists (
      select 1 from public.applications
      where applications.id = application_status_history.application_id
      and applications.user_id = auth.uid()
    )
  );

-- Policy para UPDATE: Los usuarios pueden actualizar status history de sus propias applications
create policy "Users can update own status history"
  on public.application_status_history for update
  using (
    exists (
      select 1 from public.applications
      where applications.id = application_status_history.application_id
      and applications.user_id = auth.uid()
    )
  );

-- Policy para DELETE: Los usuarios pueden eliminar status history de sus propias applications
create policy "Users can delete own status history"
  on public.application_status_history for delete
  using (
    exists (
      select 1 from public.applications
      where applications.id = application_status_history.application_id
      and applications.user_id = auth.uid()
    )
  );
