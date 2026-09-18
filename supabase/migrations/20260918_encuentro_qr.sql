-- Encuentro AMIB 2026: asistentes con QR y bitácora de visitas.
-- Solo se accede con service_role (páginas del servidor). RLS activo sin políticas = cerrado al cliente.

CREATE TABLE IF NOT EXISTS encuentro_asistentes (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token          text NOT NULL UNIQUE,
  email          text NOT NULL UNIQUE,
  nombre         text NOT NULL,
  apellido_p     text NOT NULL,
  apellido_m     text,
  puesto         text,
  institucion    text,
  telefono       text,
  celular        text,
  visitas        integer NOT NULL DEFAULT 0,
  primera_visita timestamptz,
  ultima_visita  timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS encuentro_visitas (
  id            bigserial PRIMARY KEY,
  asistente_id  uuid NOT NULL REFERENCES encuentro_asistentes(id) ON DELETE CASCADE,
  visitado_at   timestamptz NOT NULL DEFAULT now(),
  user_agent    text
);

CREATE INDEX IF NOT EXISTS encuentro_visitas_asistente_idx ON encuentro_visitas(asistente_id, visitado_at DESC);

ALTER TABLE encuentro_asistentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE encuentro_visitas    ENABLE ROW LEVEL SECURITY;

-- Registra una visita de forma atómica y devuelve al asistente (NULL si el token no existe).
CREATE OR REPLACE FUNCTION encuentro_registrar_visita(p_token text, p_user_agent text)
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

  INSERT INTO encuentro_visitas (asistente_id, user_agent) VALUES (v_id, left(p_user_agent, 300));
  RETURN QUERY SELECT * FROM encuentro_asistentes WHERE id = v_id;
END $$;

REVOKE ALL ON FUNCTION encuentro_registrar_visita(text, text) FROM PUBLIC, anon, authenticated;
