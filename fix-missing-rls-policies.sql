-- ============================================
-- POLÍTICAS RLS FALTANTES PARA APPLICATION_STATUS_HISTORY
-- ============================================
-- Descripción: Agregar política SELECT faltante
-- Fecha: 2025-01-28
-- ============================================

-- Política para SELECT - permitir ver historial si el usuario es dueño de la aplicación
create policy "status_history_select_own" on public.application_status_history
  for select using (
    exists (
      select 1 from public.applications
      where applications.id = application_status_history.application_id
      and applications.user_id = auth.uid()
    )
  );

-- ============================================
-- POLÍTICAS RLS FALTANTES PARA APPLICATION_PAYMENT_TRANSACTIONS
-- ============================================
-- Descripción: Agregar políticas INSERT, UPDATE y DELETE faltantes
-- Fecha: 2025-01-28
-- ============================================

-- Política para INSERT - permitir insertar si el usuario es dueño de la aplicación
create policy "payment_transactions_insert_own" on public.application_payment_transactions
  for insert with check (
    exists (
      select 1 from public.applications
      where applications.id = application_payment_transactions.application_id
      and applications.user_id = auth.uid()
    )
  );

-- Política para UPDATE - permitir actualizar si el usuario es dueño de la aplicación
create policy "payment_transactions_update_own" on public.application_payment_transactions
  for update using (
    exists (
      select 1 from public.applications
      where applications.id = application_payment_transactions.application_id
      and applications.user_id = auth.uid()
    )
  );

-- Política para DELETE - permitir eliminar si el usuario es dueño de la aplicación
create policy "payment_transactions_delete_own" on public.application_payment_transactions
  for delete using (
    exists (
      select 1 from public.applications
      where applications.id = application_payment_transactions.application_id
      and applications.user_id = auth.uid()
    )
  );

-- ============================================
-- POLÍTICAS RLS FALTANTES PARA APPLICATION_SUBMISSION_RESULTS
-- ============================================

-- Política para INSERT
create policy "submission_results_insert_own" on public.application_submission_results
  for insert with check (
    exists (
      select 1 from public.applications
      where applications.id = application_submission_results.application_id
      and applications.user_id = auth.uid()
    )
  );

-- Política para UPDATE
create policy "submission_results_update_own" on public.application_submission_results
  for update using (
    exists (
      select 1 from public.applications
      where applications.id = application_submission_results.application_id
      and applications.user_id = auth.uid()
    )
  );

-- Política para DELETE
create policy "submission_results_delete_own" on public.application_submission_results
  for delete using (
    exists (
      select 1 from public.applications
      where applications.id = application_submission_results.application_id
      and applications.user_id = auth.uid()
    )
  );

-- ============================================
-- POLÍTICAS RLS FALTANTES PARA APPLICATION_VALIDATION_ERRORS
-- ============================================

-- Política para INSERT
create policy "validation_errors_insert_own" on public.application_validation_errors
  for insert with check (
    exists (
      select 1 from public.applications
      where applications.id = application_validation_errors.application_id
      and applications.user_id = auth.uid()
    )
  );

-- Política para UPDATE
create policy "validation_errors_update_own" on public.application_validation_errors
  for update using (
    exists (
      select 1 from public.applications
      where applications.id = application_validation_errors.application_id
      and applications.user_id = auth.uid()
    )
  );

-- Política para DELETE
create policy "validation_errors_delete_own" on public.application_validation_errors
  for delete using (
    exists (
      select 1 from public.applications
      where applications.id = application_validation_errors.application_id
      and applications.user_id = auth.uid()
    )
  );

-- ============================================
-- COMENTARIOS
-- ============================================

comment on policy "status_history_select_own" on public.application_status_history is 'Permite ver historial de estados para aplicaciones del usuario autenticado';

comment on policy "payment_transactions_insert_own" on public.application_payment_transactions is 'Permite insertar payment transactions para aplicaciones del usuario autenticado';
comment on policy "payment_transactions_update_own" on public.application_payment_transactions is 'Permite actualizar payment transactions para aplicaciones del usuario autenticado';
comment on policy "payment_transactions_delete_own" on public.application_payment_transactions is 'Permite eliminar payment transactions para aplicaciones del usuario autenticado';

comment on policy "submission_results_insert_own" on public.application_submission_results is 'Permite insertar submission results para aplicaciones del usuario autenticado';
comment on policy "submission_results_update_own" on public.application_submission_results is 'Permite actualizar submission results para aplicaciones del usuario autenticado';
comment on policy "submission_results_delete_own" on public.application_submission_results is 'Permite eliminar submission results para aplicaciones del usuario autenticado';

comment on policy "validation_errors_insert_own" on public.application_validation_errors is 'Permite insertar validation errors para aplicaciones del usuario autenticado';
comment on policy "validation_errors_update_own" on public.application_validation_errors is 'Permite actualizar validation errors para aplicaciones del usuario autenticado';
comment on policy "validation_errors_delete_own" on public.application_validation_errors is 'Permite eliminar validation errors para aplicaciones del usuario autenticado';
