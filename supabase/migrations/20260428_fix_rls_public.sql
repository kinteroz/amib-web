-- Permitir lectura pública (anon) para mostrar las Cátedras en la Landing Page

CREATE POLICY "Lectura publica de instituciones" ON public.instituciones_educativas FOR SELECT USING (true);
CREATE POLICY "Lectura publica de profesores" ON public.profesores FOR SELECT USING (true);
CREATE POLICY "Lectura publica de catedras" ON public.catedras FOR SELECT USING (true);
