-- ============================================
-- AGREGAR ESTADO 'submission_failed' AL ENUM
-- ============================================
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================

-- PASO 1: Agregar nuevo estado al enum application_status
-- IMPORTANTE: Este comando debe ejecutarse SOLO, sin otros comandos
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'submission_failed';

-- ============================================
-- NOTA: Después de ejecutar el ALTER TYPE anterior,
-- ejecuta los siguientes comandos EN UNA NUEVA CONSULTA:
-- ============================================

-- PASO 2: Verificar que se agregó correctamente (ejecutar en nueva consulta)
-- SELECT enum_range(NULL::application_status);

-- PASO 3: Agregar comentario (ejecutar en nueva consulta)
-- COMMENT ON TYPE application_status IS 'Estados de aplicación: draft, submission_failed, submitted, pending_approval, approved, rejected, active, cancelled';
