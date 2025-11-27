-- ==================================================
-- ASIGNAR AGENTE AL USUARIO ESPECÍFICO QUE ACABAMOS DE CREAR
-- ==================================================
-- Este script asigna el agente al usuario que acabas de crear

UPDATE public.users
SET agent_id = (
  SELECT id 
  FROM agents 
  WHERE agent_code = 'DEFAULT-ALLSTATE' 
    AND is_active = true 
  LIMIT 1
)
WHERE id = '3bb6b2c4-7066-48ee-ac59-0da4b704a91e'
  AND role = 'client'
  AND agent_id IS NULL;

-- Verificar que se asignó
SELECT 
  id,
  email,
  role,
  agent_id,
  created_via
FROM users
WHERE id = '3bb6b2c4-7066-48ee-ac59-0da4b704a91e';

