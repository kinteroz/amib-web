-- 20260429_encargado_catedra.sql
-- Agregar perfil "Encargado de Cátedra AMIB" al módulo educativo

-- 1. Agregar encargado_amib_id a cátedras (mismo patrón que comites_maestro.coordinador_amib_id)
ALTER TABLE public.catedras 
  ADD COLUMN IF NOT EXISTS encargado_amib_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Agregar modalidad y enlace a sesiones (presencial vs en línea)
ALTER TABLE public.sesiones_catedra 
  ADD COLUMN IF NOT EXISTS modalidad TEXT DEFAULT 'PRESENCIAL' CHECK (modalidad IN ('PRESENCIAL', 'EN_LINEA')),
  ADD COLUMN IF NOT EXISTS enlace_sesion TEXT,
  ADD COLUMN IF NOT EXISTS nombre_sesion TEXT;

-- 3. Asignar primer usuario como encargado de prueba (dev only)
UPDATE public.catedras 
SET encargado_amib_id = (SELECT id FROM auth.users LIMIT 1)
WHERE encargado_amib_id IS NULL;
