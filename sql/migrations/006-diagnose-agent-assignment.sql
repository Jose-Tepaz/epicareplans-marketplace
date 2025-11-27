-- ==================================================
-- SCRIPT DE DIAGNÓSTICO: Verificar asignación de agentes
-- ==================================================
-- Este script ayuda a diagnosticar por qué los usuarios no tienen agent_id asignado

-- 1. Verificar que el agente DEFAULT-ALLSTATE existe
SELECT 
  'Agente DEFAULT-ALLSTATE' as check_name,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ EXISTE'
    ELSE '❌ NO EXISTE'
  END as status,
  COUNT(*) as count,
  string_agg(id::text, ', ') as agent_ids
FROM agents
WHERE agent_code = 'DEFAULT-ALLSTATE'
  AND is_active = true;

-- 2. Verificar usuarios sin agente asignado
SELECT 
  'Usuarios sin agente' as check_name,
  COUNT(*) as count,
  string_agg(id::text, ', ') as user_ids
FROM users
WHERE role = 'client'
  AND agent_id IS NULL;

-- 3. Verificar usuarios con agente asignado
SELECT 
  'Usuarios con agente' as check_name,
  COUNT(*) as count
FROM users
WHERE role = 'client'
  AND agent_id IS NOT NULL;

-- 4. Verificar que los triggers existen
SELECT 
  'Triggers de asignación de agente' as check_name,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND trigger_name LIKE '%agent%'
ORDER BY trigger_name;

-- 5. Verificar función handle_new_user
SELECT 
  'Función handle_new_user' as check_name,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ EXISTE'
    ELSE '❌ NO EXISTE'
  END as status
FROM pg_proc
WHERE proname = 'handle_new_user';

-- 6. Verificar función assign_default_agent_to_new_user
SELECT 
  'Función assign_default_agent_to_new_user' as check_name,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ EXISTE'
    ELSE '❌ NO EXISTE'
  END as status
FROM pg_proc
WHERE proname = 'assign_default_agent_to_new_user';

-- 7. Mostrar algunos usuarios recientes sin agente
SELECT 
  id,
  email,
  role,
  agent_id,
  created_via,
  created_at
FROM users
WHERE role = 'client'
  AND agent_id IS NULL
ORDER BY created_at DESC
LIMIT 10;

