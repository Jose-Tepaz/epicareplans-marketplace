-- ==================================================
-- CREAR AGENTE POR DEFECTO PARA TODAS LAS COMPAÑÍAS
-- ==================================================

-- 1. Crear usuario agente en public.users
DO $$
DECLARE
  v_user_agent_id UUID;
  v_allstate_company_id UUID;
  v_manhattan_company_id UUID;
  v_agent_allstate_id UUID;
  v_agent_manhattan_id UUID;
BEGIN
  -- Crear usuario agente (si no existe)
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    role,
    is_active,
    created_via
  ) VALUES (
    gen_random_uuid(),
    'default-agent@epicare.com',
    'Epicare',
    'Default Agent',
    'agent',
    true,
    'admin_dashboard'
  ) 
  ON CONFLICT (email) DO UPDATE 
  SET role = 'agent'
  RETURNING id INTO v_user_agent_id;

  RAISE NOTICE 'User Agent ID: %', v_user_agent_id;

  -- 2. Obtener IDs de compañías
  SELECT id INTO v_allstate_company_id
  FROM insurance_companies 
  WHERE slug = 'allstate' OR name ILIKE '%allstate%'
  LIMIT 1;

  SELECT id INTO v_manhattan_company_id
  FROM insurance_companies 
  WHERE slug = 'manhattan-life' OR name ILIKE '%manhattan%'
  LIMIT 1;

  RAISE NOTICE 'Allstate Company ID: %', v_allstate_company_id;
  RAISE NOTICE 'Manhattan Company ID: %', v_manhattan_company_id;

  -- 3. Crear registro de agente para ALLSTATE
  IF v_allstate_company_id IS NOT NULL THEN
    INSERT INTO public.agents (
      company_id,
      user_id,
      name,
      email,
      agent_code,
      external_agent_id,
      is_active
    ) VALUES (
      v_allstate_company_id,
      v_user_agent_id,
      'Epicare Default Agent - Allstate',
      'default-agent@epicare.com',
      'DEFAULT-ALLSTATE',
      '159208',
      true
    )
    ON CONFLICT (agent_code) DO UPDATE
    SET is_active = true
    RETURNING id INTO v_agent_allstate_id;

    RAISE NOTICE '✅ Agent Allstate ID: %', v_agent_allstate_id;
  END IF;

  -- 4. Crear registro de agente para MANHATTAN LIFE
  IF v_manhattan_company_id IS NOT NULL THEN
    INSERT INTO public.agents (
      company_id,
      user_id,
      name,
      email,
      agent_code,
      external_agent_id,
      is_active
    ) VALUES (
      v_manhattan_company_id,
      v_user_agent_id,
      'Epicare Default Agent - Manhattan Life',
      'default-agent@epicare.com',
      'DEFAULT-MANHATTAN',
      'PENDING', -- Sustituir con el external_agent_id real cuando lo tengas
      true
    )
    ON CONFLICT (agent_code) DO UPDATE
    SET is_active = true
    RETURNING id INTO v_agent_manhattan_id;

    RAISE NOTICE '✅ Agent Manhattan ID: %', v_agent_manhattan_id;
  END IF;

  -- 5. Asignar agente por defecto a TODOS los usuarios cliente existentes
  IF v_agent_allstate_id IS NOT NULL THEN
    UPDATE public.users
    SET agent_id = v_agent_allstate_id
    WHERE role = 'client' 
      AND agent_id IS NULL;

    RAISE NOTICE '✅ Usuarios actualizados con agent_id';
  END IF;

  -- 6. Mostrar resumen
  RAISE NOTICE '========================================';
  RAISE NOTICE 'IMPORTANTE: Guarda estos IDs:';
  RAISE NOTICE 'DEFAULT_AGENT_ALLSTATE_ID=%', v_agent_allstate_id;
  RAISE NOTICE 'DEFAULT_AGENT_MANHATTAN_ID=%', v_agent_manhattan_id;
  RAISE NOTICE '========================================';
END $$;

-- 7. Verificar creación
SELECT 
  a.id,
  a.agent_code,
  a.external_agent_id,
  ic.name as company_name,
  u.email as agent_user_email
FROM agents a
JOIN insurance_companies ic ON ic.id = a.company_id
JOIN users u ON u.id = a.user_id
WHERE a.agent_code LIKE 'DEFAULT%';

