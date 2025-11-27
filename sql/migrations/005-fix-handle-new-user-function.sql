-- ==================================================
-- ARREGLAR FUNCIÓN handle_new_user PARA ESTABLECER ROLE
-- ==================================================
-- Esta función se ejecuta cuando se crea un nuevo usuario en auth.users
-- Necesita establecer role='client' y created_via='marketplace' para que
-- el trigger assign_default_agent_to_new_user funcione correctamente

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insertar usuario en public.users con role='client' y created_via='marketplace'
  -- El trigger assign_default_agent_insert asignará el agente automáticamente
  -- Usar ON CONFLICT DO NOTHING para evitar errores si el usuario ya existe
  INSERT INTO public.users (id, email, role, created_via)
  VALUES (NEW.id, NEW.email, 'client', 'marketplace')
  ON CONFLICT (id) DO NOTHING; -- Si ya existe, no hacer nada (el callback lo manejará)
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Si hay algún error, loguearlo pero no fallar el registro del usuario
    -- El usuario se creará sin agente y se puede asignar después
    RAISE WARNING 'Error en handle_new_user para usuario %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION public.handle_new_user() IS 
  'Crea automáticamente un registro en public.users cuando se crea un nuevo usuario en auth.users. Establece role=client y created_via=marketplace por defecto.';

