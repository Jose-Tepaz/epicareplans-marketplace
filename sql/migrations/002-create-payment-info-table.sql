-- ==================================================
-- TABLA PARA ALMACENAR DATOS DE PAGO ENCRIPTADOS
-- ==================================================

CREATE TABLE IF NOT EXISTS public.application_payment_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  
  -- Tipo de pago
  payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('credit_card', 'ach', 'bank_draft')),
  
  -- Datos de tarjeta de crédito (ENCRIPTADOS)
  card_holder_name TEXT,
  card_number_encrypted TEXT, -- Encriptado
  card_last_four VARCHAR(4),  -- Solo últimos 4 dígitos en claro
  card_brand VARCHAR(50),      -- Visa, Mastercard, etc.
  card_expiry_month VARCHAR(2),
  card_expiry_year VARCHAR(4),
  cvv_encrypted TEXT,          -- Encriptado
  
  -- Datos de cuenta bancaria (ENCRIPTADOS)
  account_holder_name TEXT,
  account_type VARCHAR(50),    -- checking, savings
  account_number_encrypted TEXT,  -- Encriptado
  account_last_four VARCHAR(4),   -- Solo últimos 4 dígitos
  routing_number_encrypted TEXT,  -- Encriptado
  bank_name TEXT,
  
  -- Frecuencia de pago
  payment_frequency VARCHAR(50) DEFAULT 'monthly',
  desired_draft_date INTEGER,
  
  -- Metadata
  is_current BOOLEAN DEFAULT true,
  replaced_by UUID REFERENCES application_payment_info(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices
CREATE INDEX idx_payment_info_application ON application_payment_info(application_id);
CREATE INDEX idx_payment_info_current ON application_payment_info(application_id, is_current) 
  WHERE is_current = true;

-- Índice único parcial: Solo un método de pago actual por application
CREATE UNIQUE INDEX idx_one_current_payment_per_app ON application_payment_info(application_id) 
  WHERE is_current = true;

-- RLS
ALTER TABLE application_payment_info ENABLE ROW LEVEL SECURITY;

-- Políticas: Solo admins y el dueño pueden ver
CREATE POLICY "payment_info_select_own" ON application_payment_info
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = application_payment_info.application_id 
        AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "payment_info_select_admins" ON application_payment_info
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
        AND users.role IN ('super_admin', 'admin', 'agent')
    )
  );

-- Políticas de inserción: admins/agents Y clientes dueños de la aplicación
CREATE POLICY "payment_info_insert_admins" ON application_payment_info
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
        AND users.role IN ('super_admin', 'admin', 'agent')
    )
  );

CREATE POLICY "payment_info_insert_own" ON application_payment_info
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = application_payment_info.application_id 
        AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "payment_info_update_admins" ON application_payment_info
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
        AND users.role IN ('super_admin', 'admin', 'agent')
    )
  );

-- Trigger para updated_at
CREATE TRIGGER update_payment_info_updated_at
  BEFORE UPDATE ON application_payment_info
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentarios
COMMENT ON TABLE application_payment_info IS 'Información de pago encriptada para applications';
COMMENT ON COLUMN application_payment_info.card_number_encrypted IS 'Número de tarjeta encriptado con AES-256';
COMMENT ON COLUMN application_payment_info.cvv_encrypted IS 'CVV encriptado, se eliminará después de envío exitoso';
COMMENT ON COLUMN application_payment_info.account_number_encrypted IS 'Número de cuenta bancaria encriptado';

