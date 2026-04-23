-- Eliminar figura Funcionario de Cumplimiento (código FC)
DELETE FROM public.certificaciones
WHERE codigo = 'FC';

-- Fijar vigencia en 36 meses (3 años) para todas las figuras restantes
UPDATE public.certificaciones
SET vigencia_meses = 36,
    updated_at     = now();
