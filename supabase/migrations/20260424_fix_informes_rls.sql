-- Corregir política de Informes (cambiar auth.users por auth.jwt)
DROP POLICY IF EXISTS "Solo admins modifican informes" ON public.informes;
CREATE POLICY "Solo admins modifican informes"
ON public.informes FOR ALL 
TO authenticated
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Corregir política de Minutas (cambiar auth.users por auth.jwt)
DROP POLICY IF EXISTS "Solo admins modifican minutas" ON public.minutas;
CREATE POLICY "Solo admins modifican minutas"
ON public.minutas FOR ALL
TO authenticated
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
