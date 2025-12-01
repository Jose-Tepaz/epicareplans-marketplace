-- Agregar columna metadata a coverages
ALTER TABLE public.coverages
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Índice para búsquedas en metadata
CREATE INDEX IF NOT EXISTS idx_coverages_metadata 
ON public.coverages USING gin(metadata);

-- Comentario
COMMENT ON COLUMN public.coverages.metadata IS 'Información adicional del plan para visualización en dashboard (nombre, beneficios, brochure, etc.)';

