-- Add usuario_id to profesores to securely link auth accounts without overriding primary keys
ALTER TABLE public.profesores 
ADD COLUMN usuario_id UUID;

-- Optional: You could add a foreign key if auth schema is exposed, but usually it's better to just leave it as UUID.
-- ALTER TABLE public.profesores ADD CONSTRAINT fk_usuario_id FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE SET NULL;
