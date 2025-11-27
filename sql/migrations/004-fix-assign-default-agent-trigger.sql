-- ==================================================
-- ARREGLAR TRIGGER PARA ASIGNAR AGENTE POR DEFECTO
-- ==================================================
-- Este trigger ahora funciona tanto en INSERT como en UPDATE
-- para asegurar que los usuarios nuevos del marketplace tengan agente asignado

-- Actualizar la función para que también funcione en UPDATE
CREATE OR REPLACE FUNCTION assign_default_agent_to_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_agent_id UUID;
BEGIN
  -- Solo aplicar a usuarios con role='client' y sin agente asignado
  -- Funciona tanto en INSERT como en UPDATE
  IF NEW.role = 'client' AND NEW.agent_id IS NULL THEN
    -- En UPDATE, también verificar que OLD.agent_id sea NULL para evitar sobrescribir agentes ya asignados
    IF TG_OP = 'UPDATE' THEN
      IF OLD.agent_id IS NOT NULL THEN
        RETURN NEW; -- Ya tiene agente asignado, no cambiar
      END IF;
      -- Si el role cambió a 'client' o se está actualizando un usuario con role='client' sin agente
      IF OLD.role IS DISTINCT FROM NEW.role OR (OLD.role = 'client' AND OLD.agent_id IS NULL) THEN
        -- Continuar para asignar agente
      ELSE
        RETURN NEW; -- No hay cambios relevantes
      END IF;
    END IF;
    
    BEGIN
      -- Obtener el agente por defecto de Allstate
      SELECT id INTO default_agent_id
      FROM agents
      WHERE agent_code = 'DEFAULT-ALLSTATE'
        AND is_active = true
      LIMIT 1;
      
      IF default_agent_id IS NOT NULL THEN
        NEW.agent_id := default_agent_id;
        RAISE NOTICE '✅ Agente por defecto asignado (operación: %): %', TG_OP, default_agent_id;
      ELSE
        -- Si no se encuentra el agente, solo mostrar warning pero no fallar
        -- El usuario se creará sin agente y se puede asignar después
        RAISE WARNING '⚠️ No se encontró agente por defecto DEFAULT-ALLSTATE. El usuario se creará sin agente asignado.';
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- Si hay algún error al buscar el agente, no fallar el INSERT/UPDATE
        -- Solo loguear el error y continuar
        RAISE WARNING '⚠️ Error al buscar agente por defecto: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Eliminar triggers anteriores si existen
DROP TRIGGER IF EXISTS assign_default_agent ON public.users;
DROP TRIGGER IF EXISTS assign_default_agent_insert ON public.users;
DROP TRIGGER IF EXISTS assign_default_agent_update ON public.users;

-- Crear trigger para INSERT
CREATE TRIGGER assign_default_agent_insert
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION assign_default_agent_to_new_user();

-- Crear trigger para UPDATE
CREATE TRIGGER assign_default_agent_update
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  WHEN (NEW.role = 'client')
  EXECUTE FUNCTION assign_default_agent_to_new_user();

-- Comentarios
COMMENT ON FUNCTION assign_default_agent_to_new_user() IS 
  'Asigna automáticamente el agente por defecto (DEFAULT-ALLSTATE) a usuarios con role=client que no tengan agente asignado';

