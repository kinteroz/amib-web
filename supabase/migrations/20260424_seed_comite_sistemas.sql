-- ============================================================
-- Seed: Comité de Sistemas Completo
-- Responsable: Ángel Arellano (aarellano@amib.com.mx)
-- Fecha: 2026-04-24
-- ============================================================
-- INSTRUCCIONES:
-- 1. Ejecuta este script en el SQL Editor de Supabase.
-- 2. Supabase creará al usuario y todos los datos de ejemplo.
-- ============================================================

-- ── PASO 1: Crear usuario Ángel Arellano ─────────────────────

DO $$
DECLARE
  angel_id UUID;
BEGIN
  -- Verificar si el usuario ya existe
  SELECT id INTO angel_id FROM auth.users WHERE email = 'aarellano@amib.com.mx';

  -- Si no existe, crearlo
  IF angel_id IS NULL THEN
    angel_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      raw_app_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change,
      email_change_token_new,
      email_change_token_current,
      phone,
      phone_change,
      phone_change_token,
      is_super_admin
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      angel_id,
      'authenticated',
      'authenticated',
      'aarellano@amib.com.mx',
      crypt('Amib2026!', gen_salt('bf')), -- Contraseña temporal
      now(),
      jsonb_build_object(
        'nombre', 'Ángel Arellano',
        'role',   'responsable_comite',
        'area',   'Dirección de Sistemas'
      ),
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
      now(),
      now(),
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      false
    );
    -- Registrar identidad de email (requerida por GoTrue para autenticación por contraseña)
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      angel_id,
      jsonb_build_object('sub', angel_id::text, 'email', 'aarellano@amib.com.mx'),
      'email',
      'aarellano@amib.com.mx',
      now(),
      now(),
      now()
    );
    RAISE NOTICE 'Usuario Ángel Arellano e identidad creados con ID: %', angel_id;
  ELSE
    -- Si existe, actualizar su rol
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data ||
      jsonb_build_object('role', 'responsable_comite', 'nombre', 'Ángel Arellano')
    WHERE id = angel_id;

    -- Verificar si le falta la identidad y crearla si es necesario
    IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = angel_id) THEN
      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        angel_id,
        jsonb_build_object('sub', angel_id::text, 'email', 'aarellano@amib.com.mx'),
        'email',
        'aarellano@amib.com.mx',
        now(),
        now(),
        now()
      );
      RAISE NOTICE 'Identidad faltante creada para Ángel Arellano. ID: %', angel_id;
    ELSE
      RAISE NOTICE 'Usuario Ángel Arellano ya existía con identidad. ID: %', angel_id;
    END IF;
  END IF;
END $$;


-- ── PASO 2: Crear el Comité Maestro (Idempotente) ───────────

DO $$
DECLARE
  angel_id        UUID;
  comite_id       UUID;
  sesion1_id      UUID;
  sesion2_id      UUID;
  sesion3_id      UUID;
  minuta1_id      UUID;
  minuta2_id      UUID;
BEGIN

  -- Obtener ID del usuario
  SELECT id INTO angel_id FROM auth.users WHERE email = 'aarellano@amib.com.mx';

  -- Verificar si el comité ya existe
  SELECT id INTO comite_id FROM public.comites_maestro 
  WHERE nombre = 'Comité de Sistemas e Innovación Tecnológica';

  IF comite_id IS NULL THEN
    INSERT INTO public.comites_maestro
      (id, nombre, coordinador_amib_id, area_responsable, objetivo, activo)
    VALUES
      (gen_random_uuid(), 'Comité de Sistemas e Innovación Tecnológica', angel_id,
       'Dirección de Sistemas y Tecnología',
       'Supervisar la infraestructura tecnológica de AMIB, garantizar la continuidad operativa de los sistemas de certificación, evaluar nuevas iniciativas de digitalización y definir los estándares de ciberseguridad del sector bursátil.',
       true)
    RETURNING id INTO comite_id;

    RAISE NOTICE 'Comité creado con ID: %', comite_id;

    -- ── PASO 3: Agregar Miembros del Comité ──────────────────
    INSERT INTO public.comites_miembros (comite_id, usuario_id, rol_comite)
    VALUES (comite_id, angel_id, 'secretario');


    -- ── PASO 4: Crear 3 Sesiones ─────────────────────────────

    -- Sesión 1 — Realizada (con minuta)
    INSERT INTO public.comites_sesiones
      (id, comite_id, nombre, tipo, fecha, hora_inicio, hora_fin, estado, ubicacion,
       rol_asociado, es_publica, riesgos_identificados)
    VALUES
      (gen_random_uuid(), comite_id,
       'Sesión Ordinaria Q1 2026 — Infraestructura y Continuidad',
       'regular', '2026-02-20', '09:00', '11:30', 'realizada', 'Sala Cómputo A-204',
       'vocal', true,
       'Posible migración de servidores durante periodo de alta demanda de certificaciones.')
    RETURNING id INTO sesion1_id;

    -- Sesión 2 — Realizada (con minuta pendiente de firmas)
    INSERT INTO public.comites_sesiones
      (id, comite_id, nombre, tipo, fecha, hora_inicio, hora_fin, estado, ubicacion,
       rol_asociado, es_publica, riesgos_identificados)
    VALUES
      (gen_random_uuid(), comite_id,
       'Sesión Extraordinaria — Evaluación de Ciberseguridad',
       'extraordinaria', '2026-03-28', '14:00', '16:30', 'realizada',
       'https://meet.google.com/amib-sistemas-2026',
       'vocal', true,
       'Vulnerabilidad detectada en módulo de autenticación legado. Requiere atención prioritaria.')
    RETURNING id INTO sesion2_id;

    -- Sesión 3 — Programada (sin minuta aún)
    INSERT INTO public.comites_sesiones
      (id, comite_id, nombre, tipo, fecha, hora_inicio, hora_fin, estado, ubicacion,
       rol_asociado, es_publica, riesgos_identificados)
    VALUES
      (gen_random_uuid(), comite_id,
       'Sesión Ordinaria Q2 2026 — Plataforma AMIB Digital',
       'regular', '2026-05-15', '10:00', '12:30', 'programada', 'Sala Cómputo A-204',
       'vocal', true,
       'Definición de roadmap tecnológico para el segundo semestre.')
    RETURNING id INTO sesion3_id;


    -- ── PASO 5: Crear Minutas ─────────────────────────────────

    -- Minuta 1 — Completada / Firmada
    INSERT INTO public.minutas
      (id, sesion_id, titulo, cuerpo_minuta, archivo_url, estado_firma, fecha_subida)
    VALUES (
      gen_random_uuid(), sesion1_id,
      'Minuta — Sesión Ordinaria Q1 2026',
      jsonb_build_object('texto',
  'ACTA DE SESIÓN ORDINARIA — COMITÉ DE SISTEMAS E INNOVACIÓN TECNOLÓGICA
  Fecha: 20 de febrero de 2026 | Hora: 09:00 – 11:30 hrs | Lugar: Sala Cómputo A-204

  ASISTENTES:
  • Ángel Arellano (Secretario / Coordinador)
  • Representantes de Casas de Bolsa participantes

  PUNTOS DE LA AGENDA:
  1. Revisión del estado de los servidores de certificación (uptime 99.7%)
  2. Presentación del plan de migración a infraestructura en la nube (AWS GovCloud)
  3. Estatus del proyecto de autenticación MFA para el portal de asociados
  4. Análisis de incidentes de seguridad Q4 2025

  RESOLUCIONES:
  El comité aprobó por unanimidad iniciar la fase piloto de migración a la nube durante el periodo vacacional de Semana Santa 2026, designando un equipo de guardia para monitoreo 24/7.

  Se instruyó al área de sistemas implementar autenticación de dos factores antes del 30 de abril de 2026.'),
      '#',
      'completada',
      '2026-02-22 10:00:00+00'
    ) RETURNING id INTO minuta1_id;

    -- Minuta 2 — Pendiente de Firmas (visible para asociados)
    INSERT INTO public.minutas
      (id, sesion_id, titulo, cuerpo_minuta, archivo_url, estado_firma, fecha_subida)
    VALUES (
      gen_random_uuid(), sesion2_id,
      'Minuta — Sesión Extraordinaria de Ciberseguridad',
      jsonb_build_object('texto',
  'ACTA DE SESIÓN EXTRAORDINARIA — COMITÉ DE SISTEMAS
  Fecha: 28 de marzo de 2026 | Hora: 14:00 – 16:30 hrs | Modalidad: Videollamada

  CONTEXTO:
  Se convocó esta sesión extraordinaria ante el hallazgo de una vulnerabilidad en el módulo de autenticación del sistema legado de certificaciones AMIB, detectada durante una auditoría de seguridad interna.

  PUNTOS TRATADOS:
  1. Presentación del reporte de vulnerabilidad (CVE interno AMIB-2026-003)
  2. Evaluación del impacto: 0 brechas confirmadas, riesgo potencial medio-alto
  3. Plan de remediación inmediata: parche de seguridad y rotación de credenciales
  4. Protocolo de comunicación a los asociados afectados

  RESOLUCIONES:
  El comité instruyó aplicar el parche de seguridad en un plazo máximo de 10 días hábiles, realizar una auditoría externa de penetración antes del cierre de Q2, y establecer un protocolo de respuesta a incidentes documentado.

  Todos los acuerdos fueron aprobados por unanimidad.'),
      '#',
      'pendiente_firmas',
      '2026-03-30 09:00:00+00'
    ) RETURNING id INTO minuta2_id;

    RAISE NOTICE 'Minutas creadas: %, %', minuta1_id, minuta2_id;


    -- ── PASO 6: Crear Acuerdos ───────────────────────────────

    -- Acuerdos de la Minuta 1 (cerrados)
    INSERT INTO public.comites_acuerdos
      (minuta_id, descripcion, responsable_id, fecha_limite, estado)
    VALUES
      (minuta1_id,
       'Conformar equipo de guardia 24/7 para monitoreo durante migración a la nube en Semana Santa 2026.',
       angel_id, '2026-03-25', 'cerrado'),
      (minuta1_id,
       'Implementar autenticación de dos factores (MFA) en el portal de asociados.',
       angel_id, '2026-04-30', 'en_proceso'),
      (minuta1_id,
       'Elaborar y entregar reporte técnico de uptime Q1 2026 al Director General.',
       angel_id, '2026-03-15', 'cerrado');

    -- Acuerdos de la Minuta 2 (pendiente de firmas — abiertos)
    INSERT INTO public.comites_acuerdos
      (minuta_id, descripcion, responsable_id, fecha_limite, estado)
    VALUES
      (minuta2_id,
       'Aplicar parche de seguridad al módulo de autenticación legado (CVE AMIB-2026-003) en máximo 10 días hábiles.',
       angel_id, '2026-04-11', 'cerrado'),
      (minuta2_id,
       'Contratar y ejecutar auditoría externa de penetración (pentesting) antes del cierre de Q2 2026.',
       angel_id, '2026-06-30', 'abierto'),
      (minuta2_id,
       'Documentar y publicar el Protocolo de Respuesta a Incidentes de Ciberseguridad en el portal interno.',
       angel_id, '2026-05-31', 'en_proceso'),
      (minuta2_id,
       'Realizar rotación de credenciales administrativas en todos los servidores de producción.',
       angel_id, '2026-04-05', 'cerrado');

    RAISE NOTICE '✅ Comité de Sistemas creado exitosamente con sesiones, minutas y acuerdos.';
  ELSE
    RAISE NOTICE 'El Comité de Sistemas ya existe. Saltando creación de datos duplicados.';
  END IF;

  RAISE NOTICE 'Credenciales de Ángel Arellano → Email: aarellano@amib.com.mx | Contraseña temporal: Amib2026!';
END $$;
