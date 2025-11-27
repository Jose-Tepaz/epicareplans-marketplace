-- ==================================================
-- VERIFICAR COLUMNAS ROLE Y AGENT_ID EN LA TABLA USERS
-- ==================================================
-- Esta migración verifica que las columnas necesarias existan
-- Si ya existen (como en tu caso), solo mostrará mensajes informativos

DO $$
BEGIN
  -- Verificar columna role
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'role'
  ) THEN
    RAISE NOTICE '✅ Columna role existe en users';
  ELSE
    RAISE WARNING '⚠️ Columna role NO existe en users - se requiere para el sistema de agentes';
  END IF;
  
  -- Verificar columna agent_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'agent_id'
  ) THEN
    RAISE NOTICE '✅ Columna agent_id existe en users';
  ELSE
    RAISE WARNING '⚠️ Columna agent_id NO existe en users - se requiere para el sistema de agentes';
  END IF;
  
  -- Verificar columna is_active
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'is_active'
  ) THEN
    RAISE NOTICE '✅ Columna is_active existe en users';
  ELSE
    RAISE WARNING '⚠️ Columna is_active NO existe en users';
  END IF;
  
  -- Verificar columna created_via
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'created_via'
  ) THEN
    RAISE NOTICE '✅ Columna created_via existe en users';
  ELSE
    RAISE WARNING '⚠️ Columna created_via NO existe en users';
  END IF;
  
  -- Verificar índice en agent_id
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND indexname = 'idx_users_agent_id'
  ) THEN
    RAISE NOTICE '✅ Índice idx_users_agent_id existe';
  ELSE
    RAISE NOTICE 'ℹ️ Creando índice idx_users_agent_id...';
    CREATE INDEX IF NOT EXISTS idx_users_agent_id ON public.users(agent_id);
    RAISE NOTICE '✅ Índice idx_users_agent_id creado';
  END IF;
END $$;

