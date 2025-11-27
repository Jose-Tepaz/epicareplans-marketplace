-- Add included_in_quote column to family_members table
ALTER TABLE public.family_members
ADD COLUMN IF NOT EXISTS included_in_quote boolean DEFAULT true;

-- Update RLS policies if needed (usually not needed for adding a column if existing policies cover UPDATE)
-- Ensure the new column is included in any existing types or views if applicable

