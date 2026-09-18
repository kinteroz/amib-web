-- Registra dispositivo y acción (vista de página o descarga de vCard) en cada visita.
ALTER TABLE encuentro_visitas
  ADD COLUMN IF NOT EXISTS dispositivo text,
  ADD COLUMN IF NOT EXISTS accion text NOT NULL DEFAULT 'vista';

DROP FUNCTION IF EXISTS encuentro_registrar_visita(text, text);

CREATE OR REPLACE FUNCTION encuentro_registrar_visita(p_token text, p_user_agent text, p_dispositivo text, p_accion text)
RETURNS SETOF encuentro_asistentes
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id uuid;
BEGIN
  UPDATE encuentro_asistentes
     SET visitas = visitas + 1,
         primera_visita = COALESCE(primera_visita, now()),
         ultima_visita = now()
   WHERE token = p_token
   RETURNING id INTO v_id;

  IF v_id IS NULL THEN RETURN; END IF;

  INSERT INTO encuentro_visitas (asistente_id, user_agent, dispositivo, accion)
  VALUES (v_id, left(p_user_agent, 300), p_dispositivo, p_accion);
  RETURN QUERY SELECT * FROM encuentro_asistentes WHERE id = v_id;
END $$;

REVOKE ALL ON FUNCTION encuentro_registrar_visita(text, text, text, text) FROM PUBLIC, anon, authenticated;
