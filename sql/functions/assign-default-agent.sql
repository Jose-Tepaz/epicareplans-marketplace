-- Función para asignar agente por defecto a nuevos usuarios
CREATE OR REPLACE FUNCTION assign_default_agent_to_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_agent_id UUID;
BEGIN
  -- Solo aplicar a usuarios con role='client' y sin agente asignado
  IF NEW.role = 'client' AND NEW.agent_id IS NULL THEN
    -- Obtener el agente por defecto de Allstate
    SELECT id INTO default_agent_id
    FROM agents
    WHERE agent_code = 'DEFAULT-ALLSTATE'
      AND is_active = true
    LIMIT 1;
    
    IF default_agent_id IS NOT NULL THEN
      NEW.agent_id := default_agent_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
DROP TRIGGER IF EXISTS assign_default_agent ON public.users;
CREATE TRIGGER assign_default_agent
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION assign_default_agent_to_new_user();

