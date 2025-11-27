-- ==================================================
-- ASIGNAR AGENTE POR DEFECTO A USUARIOS EXISTENTES
-- ==================================================
-- Este script asigna el agente DEFAULT-ALLSTATE a todos los usuarios
-- con role='client' que no tengan agente asignado

DO $$
DECLARE
  default_agent_id UUID;
  users_updated INTEGER;
BEGIN
  -- Obtener el agente por defecto
  SELECT id INTO default_agent_id
  FROM agents
  WHERE agent_code = 'DEFAULT-ALLSTATE'
    AND is_active = true
  LIMIT 1;
  
  IF default_agent_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró agente por defecto DEFAULT-ALLSTATE. Ejecuta primero la migración 001-create-default-agent.sql';
  END IF;
  
  RAISE NOTICE 'Agente por defecto encontrado: %', default_agent_id;
  
  -- Asignar agente a usuarios sin agente
  UPDATE public.users
  SET agent_id = default_agent_id
  WHERE role = 'client'
    AND agent_id IS NULL;
  
  GET DIAGNOSTICS users_updated = ROW_COUNT;
  
  RAISE NOTICE '✅ Usuarios actualizados: %', users_updated;
  
  -- Mostrar resumen
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Resumen:';
  RAISE NOTICE '  - Agente asignado: %', default_agent_id;
  RAISE NOTICE '  - Usuarios actualizados: %', users_updated;
  RAISE NOTICE '========================================';
END $$;

-- Verificar resultado
SELECT 
  'Usuarios con agente asignado' as status,
  COUNT(*) as count
FROM users
WHERE role = 'client'
  AND agent_id IS NOT NULL;

SELECT 
  'Usuarios sin agente asignado' as status,
  COUNT(*) as count
FROM users
WHERE role = 'client'
  AND agent_id IS NULL;

