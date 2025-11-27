-- ==================================================
-- PERMITIR LECTURA DEL AGENTE POR DEFECTO (RLS)
-- ==================================================
-- Esta migración permite que los usuarios autenticados puedan leer
-- la información del agente por defecto, necesario para el callback

-- Política para ver el agente por defecto
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'agents' 
    AND policyname = 'Allow read default agent'
  ) THEN
    CREATE POLICY "Allow read default agent" ON public.agents
      FOR SELECT
      USING (agent_code = 'DEFAULT-ALLSTATE' AND is_active = true);
      
    RAISE NOTICE '✅ Política "Allow read default agent" creada';
  ELSE
    RAISE NOTICE 'ℹ️ Política "Allow read default agent" ya existe';
  END IF;
END $$;

-- Asegurarse que RLS está habilitado
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Verificar permisos
SELECT * FROM public.agents WHERE agent_code = 'DEFAULT-ALLSTATE';

