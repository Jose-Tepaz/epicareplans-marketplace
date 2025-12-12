-- =====================================================
-- MIGRACIÓN: Crear tabla user_beneficiaries
-- Permite a usuarios guardar beneficiarios para reutilizar en futuros enrollments
-- =====================================================

-- 1. Crear tabla de beneficiarios guardados del usuario
CREATE TABLE IF NOT EXISTS public.user_beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Información personal
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  
  -- Dirección (JSONB para flexibilidad)
  addresses JSONB DEFAULT '[]'::jsonb,
  
  -- Teléfonos (JSONB para flexibilidad)
  phone_numbers JSONB DEFAULT '[]'::jsonb,
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Crear índices
CREATE INDEX IF NOT EXISTS idx_user_beneficiaries_user ON public.user_beneficiaries(user_id);
CREATE INDEX IF NOT EXISTS idx_user_beneficiaries_active ON public.user_beneficiaries(user_id, is_active) WHERE is_active = true;

-- 3. Habilitar RLS
ALTER TABLE public.user_beneficiaries ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS - Usuarios solo pueden gestionar sus propios beneficiarios
DROP POLICY IF EXISTS "users_manage_own_beneficiaries" ON public.user_beneficiaries;
CREATE POLICY "users_manage_own_beneficiaries" ON public.user_beneficiaries
  FOR ALL USING (auth.uid() = user_id);

-- 5. Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_user_beneficiaries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_beneficiaries_updated_at ON public.user_beneficiaries;
CREATE TRIGGER trigger_update_user_beneficiaries_updated_at
  BEFORE UPDATE ON public.user_beneficiaries
  FOR EACH ROW
  EXECUTE FUNCTION update_user_beneficiaries_updated_at();

-- 6. Agregar columna de referencia a beneficiaries (para enlazar con beneficiario guardado)
ALTER TABLE public.beneficiaries 
  ADD COLUMN IF NOT EXISTS user_beneficiary_id UUID REFERENCES public.user_beneficiaries(id);

-- 7. Comentarios para documentación
COMMENT ON TABLE public.user_beneficiaries IS 'Beneficiarios guardados del usuario para reutilizar en futuros enrollments';
COMMENT ON COLUMN public.user_beneficiaries.user_id IS 'Usuario propietario del beneficiario guardado';
COMMENT ON COLUMN public.user_beneficiaries.addresses IS 'Array JSON de direcciones del beneficiario';
COMMENT ON COLUMN public.user_beneficiaries.phone_numbers IS 'Array JSON de teléfonos del beneficiario';
COMMENT ON COLUMN public.user_beneficiaries.is_active IS 'Soft delete - false cuando el beneficiario es eliminado';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Para verificar que todo se creó correctamente:
-- SELECT * FROM public.user_beneficiaries;
-- \d public.user_beneficiaries
-- SELECT * FROM pg_policies WHERE tablename = 'user_beneficiaries';

