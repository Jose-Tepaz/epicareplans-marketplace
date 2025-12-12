-- ============================================================
-- REMOVER TRIGGER DE ASIGNACIÓN DE AGENTE
-- ============================================================
-- Este trigger estaba causando un error 400 en cada UPDATE de users
-- porque intenta acceder a campos agent_id que no existen en la tabla
-- 
-- Error: "record 'new' has no field 'agent_id'"
--
-- EJECUTAR ESTE SCRIPT EN SUPABASE SQL EDITOR
-- ============================================================

-- 1. Eliminar los triggers
DROP TRIGGER IF EXISTS assign_default_agent_insert ON public.users;
DROP TRIGGER IF EXISTS assign_default_agent_update ON public.users;
DROP TRIGGER IF EXISTS assign_default_agent ON public.users;

-- 2. Eliminar la función
DROP FUNCTION IF EXISTS assign_default_agent_to_new_user();

-- 3. Verificar que se eliminaron correctamente
SELECT 
  'Triggers eliminados correctamente' as status,
  COUNT(*) as triggers_restantes
FROM information_schema.triggers
WHERE trigger_name LIKE '%assign%agent%'
  AND event_object_table = 'users';

-- Nota: Si la tabla users del marketplace necesita soporte de agentes en el futuro,
-- primero agregar la columna agent_id:
--
-- ALTER TABLE public.users ADD COLUMN agent_id UUID REFERENCES agents(id);
--
-- Y luego recrear el trigger.
