-- =====================================================
-- Seed: Oficios históricos CNBV 2026
-- Fuente: Requerimientos CNBV 2026.xlsx (hoja "2026")
-- Fechas calculadas con WORKDAY + festivos del archivo
-- =====================================================

-- Las fechas de vencimiento se calcularon así:
--   efectos        = WORKDAY(fecha_recepcion, 1, festivos)
--   vencimiento    = WORKDAY(efectos, plazo_dias + prorroga, festivos)
-- Filas 1–3 son notificaciones internas sin oficio CNBV formal

INSERT INTO oficios (
  numero_oficio,
  titulo,
  fecha_recepcion,
  fecha_efectos,
  plazo_dias_habiles,
  prorroga_dias,
  fecha_vencimiento,
  estatus,
  resumen_ia,
  datos_extraidos_ia
) VALUES

  -- Fila 1: Solicitud de autorización LEB (interna, cumplida)
  -- fecha_recepcion = fecha en que la CNBV la recibió (notificación interna, sin plazo formal)
  (
    'LEB-2026-01',
    'Solicitud de autorización LEB',
    '2026-02-06',
    '2026-02-06',
    0,
    0,
    NULL,
    'cumplido',
    'Solicitud de autorización para la figura de Liquidador de Entidades Bursátiles presentada ante la CNBV. Enviada y recibida el 6 de febrero de 2026.',
    '{"responsable":"Libertad","fecha_certifica":"2026-01-28","fecha_envio_cnbv":"2026-02-06","fecha_recepcion_cnbv":"2026-02-06"}'
  ),

  -- Fila 2: Notificación de Modificaciones a Manuales (interna, cumplida)
  (
    'MOD-MANUALES-2026',
    'Notificación de Modificaciones a Manuales, Guía y Reglamento',
    '2026-02-06',
    '2026-02-06',
    0,
    0,
    NULL,
    'cumplido',
    'Notificación a la CNBV sobre modificaciones realizadas a los manuales operativos, guía de certificación y reglamento interno de la AMIB. Enviada y recibida el 6 de febrero de 2026.',
    '{"responsable":"Libertad","fecha_certifica":"2026-01-28","fecha_envio_cnbv":"2026-02-06","fecha_recepcion_cnbv":"2026-02-06"}'
  ),

  -- Fila 3: Integración del Comité de Certificación (interna, cumplida)
  (
    'COM-CERT-2026',
    'Integración del Comité de Certificación',
    '2026-03-09',
    '2026-03-10',
    0,
    0,
    NULL,
    'cumplido',
    'Notificación a la CNBV sobre la integración y conformación del Comité de Certificación de la AMIB para el ejercicio 2026. Enviada y recibida en marzo de 2026.',
    '{"responsable":"Libertad","fecha_c_directivo":"2026-02-24","fecha_certifica":"2026-02-25","fecha_envio_cnbv":"2026-03-09","fecha_recepcion_cnbv":"2026-03-10"}'
  ),

  -- Fila 4: Oficio 155-1/707691/2026 — Liquidador de Entidades Bursátiles (CUMPLIDO)
  -- efectos = WORKDAY(2026-03-06, 1) = 2026-03-09 (lunes, saltando fin de semana)
  -- vencimiento = WORKDAY(2026-03-09, 20) = 2026-04-08
  --   semana 1: 9,10,11,12,13 (5) | semana 2: 17,18,19,20,21 (10, saltando festivo 16-mar)
  --   semana 3: 24,25,26,27,28 (15) | semana 4: 31-mar, 01-abr (17), saltando 02 y 03 (Semana Santa)
  --   06-abr(18), 07-abr(19), 08-abr(20) ← vencimiento
  (
    '155-1/707691/2026',
    'Requerimiento Liquidador de Entidades Bursátiles',
    '2026-03-06',
    '2026-03-09',
    20,
    0,
    '2026-04-08',
    'cumplido',
    'La CNBV requirió a la AMIB información y documentación relacionada con el proceso de autorización para la figura de Liquidador de Entidades Bursátiles (LEB). El oficio fue atendido dentro del plazo de 20 días hábiles y recibido por la CNBV el 8 de abril de 2026.',
    '{"responsable":"Libertad","fecha_certifica":"2026-03-25","fecha_t10":"2026-04-07","fecha_envio_juridico":"2026-04-06","fecha_envio_cnbv":"2026-04-06","fecha_recepcion_cnbv":"2026-04-08"}'
  ),

  -- Fila 5: Oficio 155-1/707890/2026 — Notificación Requerimiento Certificaciones (EN PROCESO)
  -- efectos = WORKDAY(2026-04-08, 1) = 2026-04-09
  -- vencimiento = WORKDAY(2026-04-09, 10):
  --   10,13,14,15,16,17,20,21,22,23 (10) ← vencimiento 2026-04-23
  (
    '155-1/707890/2026',
    'AMIB Notificación Requerimiento Certificaciones',
    '2026-04-08',
    '2026-04-09',
    10,
    0,
    '2026-04-23',
    'en_proceso',
    'La CNBV notificó a la AMIB un requerimiento relacionado con el proceso de certificación de figuras del mercado de valores. El oficio fue enviado a la CNBV el 23 de abril de 2026, pendiente de confirmación de recepción.',
    '{"responsable":"Marisol","fecha_envio_juridico":"2026-04-20","fecha_envio_cnbv":"2026-04-23","fecha_recepcion_cnbv":null}'
  ),

  -- Fila 6: Oficio 155-1/707894/2026 — Comité de Certificación (EN PROCESO)
  -- efectos = WORKDAY(2026-04-10, 1) = 2026-04-13 (lunes)
  -- vencimiento = WORKDAY(2026-04-13, 20):
  --   14,15,16,17(4) | 20,21,22,23,24(9) | 27,28,29,30(13), saltando 01-may(festivo)
  --   04,05,06,07,08-may(18) | 11,12-may(20) ← vencimiento 2026-05-12
  (
    '155-1/707894/2026',
    'Comité de Certificación — Requerimiento CNBV',
    '2026-04-10',
    '2026-04-13',
    20,
    0,
    '2026-05-12',
    'en_proceso',
    'La CNBV emitió un requerimiento dirigido al Comité de Certificación de la AMIB solicitando información y documentación sobre sus integrantes y procesos. Plazo de 20 días hábiles a partir del 13 de abril de 2026.',
    '{"responsable":"Libertad","fecha_envio_juridico":"2026-04-20","fecha_envio_cnbv":null,"fecha_recepcion_cnbv":null}'
  ),

  -- Fila 7: Oficio 155-1/707906/2026 — Programa de Autocorrección (VENCIDO)
  -- efectos = WORKDAY(2026-04-15, 0) = 2026-04-15 (mismo día)
  -- vencimiento = WORKDAY(2026-04-15, 5+5=10):
  --   16,17(2) | 20,21,22,23,24(7) | 27,28,29(10) ← vencimiento 2026-04-29
  -- Hoy es 2026-04-30, está 1 día vencido
  (
    '155-1/707906/2026',
    'Solicitud de Información — Programa de Autocorrección',
    '2026-04-15',
    '2026-04-15',
    5,
    5,
    '2026-04-29',
    'en_proceso',
    'La CNBV solicitó a la AMIB información detallada sobre el Programa de Autocorrección, incluyendo evidencia de remediación de inconsistencias operativas y controles internos. Plazo original de 5 días hábiles con prórroga de 5 días adicionales. Vencimiento: 29 de abril de 2026.',
    '{"responsable":"Marisol","prorroga_dias":5,"fecha_envio_juridico":null,"fecha_envio_cnbv":null,"fecha_recepcion_cnbv":null}'
  );
