-- ============================================================
-- CERTIFICACIÓN CMS: examenes, documentos, micrositios
-- ============================================================

-- 1. Calendario de Exámenes (CMS-managed)
CREATE TABLE IF NOT EXISTS public.examenes_certificacion (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo        text        NOT NULL,
  descripcion   text,
  fecha         date        NOT NULL,
  hora          time,
  modalidad     text        NOT NULL DEFAULT 'presencial'
                            CHECK (modalidad IN ('presencial', 'distancia', 'ambas')),
  sede          text,
  cupo_maximo   integer,
  url_registro  text,
  certificacion_id uuid     REFERENCES public.certificaciones(id) ON DELETE SET NULL,
  activo        boolean     DEFAULT true,
  notas         text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- 2. Biblioteca de Documentos / PDFs
CREATE TABLE IF NOT EXISTS public.documentos_cert (
  id                uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo            text        NOT NULL,
  descripcion       text,
  categoria         text        NOT NULL DEFAULT 'otro'
                                CHECK (categoria IN ('guia','manual','formato','comunicado','tarifa','reglamento','otro')),
  subcategoria      text,
  tipo_perfil       text        DEFAULT 'general'
                                CHECK (tipo_perfil IN ('independiente','institucion','consar','general')),
  storage_path      text,
  url_publica       text,
  orden             integer     DEFAULT 0,
  activo            boolean     DEFAULT true,
  fecha_publicacion date        DEFAULT CURRENT_DATE,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- 3. Micrositios (páginas generadas desde contenido PDF/CMS)
CREATE TABLE IF NOT EXISTS public.micrositios_cert (
  id                   uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug                 text        NOT NULL UNIQUE,
  titulo               text        NOT NULL,
  subtitulo            text,
  descripcion          text,
  tipo                 text        NOT NULL DEFAULT 'proceso'
                                   CHECK (tipo IN ('proceso','guia','faq','referencia')),
  perfil_objetivo      text        NOT NULL DEFAULT 'general'
                                   CHECK (perfil_objetivo IN ('independiente','institucion','consar','general')),
  contenido_json       jsonb       DEFAULT '{"secciones":[]}',
  documento_origen_id  uuid        REFERENCES public.documentos_cert(id) ON DELETE SET NULL,
  imagen_cover         text,
  color_acento         text        DEFAULT 'gold',
  icono                text        DEFAULT '🎓',
  activo               boolean     DEFAULT true,
  orden                integer     DEFAULT 0,
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.examenes_certificacion  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_cert         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.micrositios_cert        ENABLE ROW LEVEL SECURITY;

-- Lectura pública (contenido activo)
CREATE POLICY "examenes_public_read"   ON public.examenes_certificacion  FOR SELECT USING (activo = true);
CREATE POLICY "documentos_public_read" ON public.documentos_cert         FOR SELECT USING (activo = true);
CREATE POLICY "micrositios_public_read" ON public.micrositios_cert       FOR SELECT USING (activo = true);

-- Escritura sólo para service_role (admin / CMS)
CREATE POLICY "examenes_admin_all"    ON public.examenes_certificacion
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "documentos_admin_all"  ON public.documentos_cert
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "micrositios_admin_all" ON public.micrositios_cert
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_examenes_fecha    ON public.examenes_certificacion (fecha);
CREATE INDEX IF NOT EXISTS idx_documentos_cat    ON public.documentos_cert (categoria, tipo_perfil);
CREATE INDEX IF NOT EXISTS idx_micrositios_slug  ON public.micrositios_cert (slug);
CREATE INDEX IF NOT EXISTS idx_micrositios_perfil ON public.micrositios_cert (perfil_objetivo);

-- ============================================================
-- DATOS SEMILLA — Micrositios
-- ============================================================
INSERT INTO public.micrositios_cert (slug, titulo, subtitulo, descripcion, tipo, perfil_objetivo, icono, color_acento, orden, contenido_json) VALUES

('independientes',
 'Certificación para Candidatos Independientes',
 'Certifícate por tu cuenta en cualquiera de las figuras AMIB',
 'Proceso completo para personas físicas que desean obtener su certificación de manera independiente, sin el respaldo de una institución.',
 'proceso', 'independiente', '👤', 'gold', 1,
 '{
   "secciones": [
     {
       "tipo": "intro",
       "titulo": "¿Qué es la certificación independiente?",
       "contenido": "La certificación independiente AMIB te permite acreditar tu conocimiento y competencia en el mercado bursátil mexicano sin necesidad de estar contratado en una institución. Es ideal para asesores financieros independientes, consultores y profesionales en transición."
     },
     {
       "tipo": "pasos",
       "titulo": "Proceso paso a paso",
       "pasos": [
         {
           "numero": 1,
           "titulo": "Elige tu figura",
           "descripcion": "Selecciona la figura de certificación que corresponde a tu perfil profesional: Asesor/Promotor de Fondos (F1), Promotor de Valores (F2) o Asesor en Estrategias de Inversión (F3).",
           "icono": "🎯"
         },
         {
           "numero": 2,
           "titulo": "Llena tu solicitud",
           "descripcion": "Completa el formulario de solicitud independiente. Descarga el formato correspondiente y reúne la documentación requerida: identificación oficial, comprobante de estudios y experiencia profesional.",
           "icono": "📋"
         },
         {
           "numero": 3,
           "titulo": "Pago de derechos",
           "descripcion": "Realiza el pago de los derechos de examen según la tarifa vigente. Puedes consultar el tabulador en la sección de Tarifas. El pago se acredita en un plazo de 3 a 5 días hábiles.",
           "icono": "💳"
         },
         {
           "numero": 4,
           "titulo": "Programa tu examen",
           "descripcion": "Una vez confirmado tu pago, recibirás un correo para programar tu fecha de examen. Elige entre modalidad presencial en sede AMIB o examen a distancia con navegador seguro.",
           "icono": "📅"
         },
         {
           "numero": 5,
           "titulo": "Presenta tu examen",
           "descripcion": "El examen consta de preguntas de opción múltiple. Tienes acceso al simulador de examen y a las guías de estudio para prepararte con anticipación.",
           "icono": "✍️"
         },
         {
           "numero": 6,
           "titulo": "Obtén tu certificado",
           "descripcion": "Al aprobar, recibirás tu certificado AMIB con vigencia de 36 meses (3 años). Quedas registrado en el Padrón de Personal Certificado consultable públicamente.",
           "icono": "🏅"
         }
       ]
     },
     {
       "tipo": "requisitos",
       "titulo": "Documentación requerida",
       "items": [
         "Identificación oficial vigente (INE/pasaporte)",
         "CURP",
         "Comprobante de estudios (título o cédula profesional)",
         "Carta de experiencia profesional (si aplica para F3)",
         "Fotografía tamaño credencial fondo blanco",
         "Formato de solicitud independiente firmado"
       ]
     },
     {
       "tipo": "faq",
       "titulo": "Preguntas frecuentes",
       "preguntas": [
         {
           "pregunta": "¿Cuánto tiempo tarda el proceso completo?",
           "respuesta": "Desde la entrega de documentos hasta la fecha de examen, el proceso toma entre 2 y 4 semanas dependiendo de la disponibilidad de fechas."
         },
         {
           "pregunta": "¿Puedo certificarme sin trabajar en una casa de bolsa?",
           "respuesta": "Sí. La certificación independiente está diseñada precisamente para profesionales que no están adscritos a una institución financiera."
         },
         {
           "pregunta": "¿Qué pasa si repruebo el examen?",
           "respuesta": "Puedes volver a programar tu examen después de 30 días. Deberás cubrir nuevamente los derechos de examen."
         },
         {
           "pregunta": "¿La certificación tiene vigencia?",
           "respuesta": "Sí, la certificación tiene una vigencia de 36 meses (3 años). Puedes renovarla mediante el esquema de actualización por puntos o presentando nuevamente el examen."
         }
       ]
     }
   ]
 }'::jsonb
),

('instituciones',
 'Autorización Institucional ante CNBV',
 'Proceso de certificación y autorización para instituciones financieras',
 'Guía completa para Casas de Bolsa, Operadoras de Fondos y demás instituciones que requieren gestionar la certificación de su personal ante AMIB y la CNBV.',
 'proceso', 'institucion', '🏛️', 'blue', 2,
 '{
   "secciones": [
     {
       "tipo": "intro",
       "titulo": "Certificación institucional",
       "contenido": "Las instituciones financieras están obligadas por regulación a mantener su personal certificado en las figuras correspondientes a sus operaciones. AMIB actúa como organismo certificador y también apoya el proceso de Autorización ante la CNBV para figuras que lo requieren."
     },
     {
       "tipo": "pasos",
       "titulo": "Proceso de certificación institucional",
       "pasos": [
         {
           "numero": 1,
           "titulo": "Registro de la institución",
           "descripcion": "La institución debe estar registrada en el Sistema de Gestión Online (SGO) de AMIB. El responsable de certificación (Oficial de Cumplimiento o RRHH) obtiene acceso al portal institucional.",
           "icono": "🔐"
         },
         {
           "numero": 2,
           "titulo": "Captura de candidatos",
           "descripcion": "A través del SGO, la institución registra a los candidatos a certificar, asigna la figura correspondiente y carga la documentación requerida por persona.",
           "icono": "👥"
         },
         {
           "numero": 3,
           "titulo": "Pago institucional",
           "descripcion": "Las instituciones pueden gestionar el pago de derechos de examen de forma grupal. Se emite una factura con el RFC de la institución.",
           "icono": "🧾"
         },
         {
           "numero": 4,
           "titulo": "Programación de exámenes",
           "descripcion": "La institución puede solicitar fechas de examen grupales en sede AMIB o gestionar exámenes a distancia para su personal en sucursales.",
           "icono": "📅"
         },
         {
           "numero": 5,
           "titulo": "Resultados y certificados",
           "descripcion": "Los resultados se notifican al candidato y a la institución. Los certificados se generan automáticamente en el SGO y quedan disponibles para descarga.",
           "icono": "📊"
         }
       ]
     },
     {
       "tipo": "pasos",
       "titulo": "Proceso de autorización ante CNBV",
       "pasos": [
         {
           "numero": 1,
           "titulo": "Verificar figura regulada",
           "descripcion": "Confirma si el puesto del colaborador requiere autorización ante la CNBV (Interventor Gerente, Delegado Fiduciario, Miembro del Consejo Consultivo, entre otros).",
           "icono": "🔍"
         },
         {
           "numero": 2,
           "titulo": "Integrar expediente",
           "descripcion": "Reúne la documentación exigida por la CNBV: solicitud en formato oficial, certificación AMIB vigente, currículum vitae, constancias de no inhabilitación y acreditación de la institución.",
           "icono": "📁"
         },
         {
           "numero": 3,
           "titulo": "Envío a AMIB",
           "descripcion": "La institución envía el expediente a AMIB Certifica. El área de Gestión de Autorizaciones revisa la documentación y canaliza la solicitud ante la CNBV.",
           "icono": "📤"
         },
         {
           "numero": 4,
           "titulo": "Seguimiento y resolución",
           "descripcion": "AMIB da seguimiento ante la CNBV. El tiempo de resolución varía entre 30 y 90 días hábiles según la complejidad. La institución recibe notificación de la resolución.",
           "icono": "🔄"
         }
       ]
     },
     {
       "tipo": "requisitos",
       "titulo": "Figuras que requieren autorización CNBV",
       "items": [
         "Interventor Gerente",
         "Miembro del Consejo Consultivo de Fondos de Inversión",
         "Delegado Fiduciario de Casas de Bolsa",
         "Delegado Fiduciario de Fondos de Inversión",
         "Liquidador de Entidades Bursátiles",
         "Conciliador de Entidades Bursátiles",
         "Síndico de Entidades Bursátiles"
       ]
     },
     {
       "tipo": "faq",
       "titulo": "Preguntas frecuentes",
       "preguntas": [
         {
           "pregunta": "¿Qué pasa si un colaborador pierde su certificación?",
           "respuesta": "La institución tiene un plazo para regularizar la situación. Si el colaborador desempeña funciones reguladas, debe suspenderlas hasta obtener la certificación vigente."
         },
         {
           "pregunta": "¿Cómo gestiono múltiples candidatos al mismo tiempo?",
           "respuesta": "El Sistema de Gestión Online (SGO) permite carga masiva de candidatos mediante plantilla Excel y gestión de grupos de examen."
         },
         {
           "pregunta": "¿La autorización CNBV es distinta a la certificación AMIB?",
           "respuesta": "Sí. La certificación AMIB acredita competencia técnica. La autorización CNBV es el registro regulatorio para ejercer ciertas funciones. Generalmente la certificación AMIB es requisito previo para la autorización."
         }
       ]
     }
   ]
 }'::jsonb
),

('consar',
 'Certificación CONSAR',
 'Certificación para profesionales del sistema de ahorro para el retiro',
 'Todo lo que necesitas saber para certificarte en el ámbito de las AFORE y el sistema de ahorro para el retiro, a través del convenio AMIB-CONSAR.',
 'proceso', 'consar', '🏦', 'teal', 3,
 '{
   "secciones": [
     {
       "tipo": "intro",
       "titulo": "Certificación CONSAR",
       "contenido": "En el marco del convenio entre la AMIB y la CONSAR, los profesionales que laboran en el sistema de ahorro para el retiro (AFORE, Empresas Operadoras de la BD-SAR, distribuidoras) pueden obtener su certificación a través de AMIB Certifica."
     },
     {
       "tipo": "requisitos",
       "titulo": "¿Quién debe certificarse?",
       "items": [
         "Ejecutivos de Atención al Público (EAP) de AFORE",
         "Promotores de AFORE",
         "Personal de Empresas Distribuidoras de Servicios de AFORE",
         "Funcionarios de Empresas Operadoras de BD-SAR"
       ]
     },
     {
       "tipo": "faq",
       "titulo": "Preguntas frecuentes",
       "preguntas": [
         {
           "pregunta": "¿Es obligatoria la certificación CONSAR?",
           "respuesta": "Sí. La normativa CONSAR establece la obligatoriedad de certificación para el personal que atiende o asesora a trabajadores afiliados al sistema de ahorro para el retiro."
         },
         {
           "pregunta": "¿Dónde puedo consultar el calendario de exámenes CONSAR?",
           "respuesta": "Los calendarios de aplicación CONSAR se publican en esta sección. También puedes consultar directamente con AMIB Certifica al correo certifica@amib.com.mx"
         }
       ]
     }
   ]
 }'::jsonb
);

-- ============================================================
-- DATOS SEMILLA — Exámenes de muestra
-- ============================================================
INSERT INTO public.examenes_certificacion (titulo, descripcion, fecha, hora, modalidad, sede, cupo_maximo, url_registro) VALUES
(
  'Examen Figuras 1, 2 y 3 — Mayo 2026',
  'Sesión de exámenes presenciales para candidatos independientes e institucionales.',
  '2026-05-14',
  '09:00',
  'presencial',
  'Sede AMIB — Insurgentes Sur 1605, CDMX',
  60,
  '#'
),
(
  'Examen a Distancia — Figuras 1 y 2',
  'Modalidad en línea con navegador seguro. Requiere equipo propio y conexión estable.',
  '2026-05-21',
  '10:00',
  'distancia',
  NULL,
  80,
  '#'
),
(
  'Examen CONSAR — Junio 2026',
  'Sesión exclusiva para candidatos de certificación CONSAR.',
  '2026-06-04',
  '09:30',
  'ambas',
  'Sede AMIB — Insurgentes Sur 1605, CDMX',
  40,
  '#'
);
