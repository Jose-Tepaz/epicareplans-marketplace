-- ==================================================
-- CORREGIR POLÍTICAS RLS DE application_payment_info
-- Permitir que clientes inserten cuando son dueños de la aplicación
-- ==================================================

-- Eliminar política antigua que solo permitía admins
DROP POLICY IF EXISTS "payment_info_insert_admins" ON application_payment_info;

-- Crear política que permite admins/agents
CREATE POLICY "payment_info_insert_admins" ON application_payment_info
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
        AND users.role IN ('super_admin', 'admin', 'agent')
    )
  );

-- Crear política que permite clientes dueños de la aplicación
CREATE POLICY "payment_info_insert_own" ON application_payment_info
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = application_payment_info.application_id 
        AND applications.user_id = auth.uid()
    )
  );

