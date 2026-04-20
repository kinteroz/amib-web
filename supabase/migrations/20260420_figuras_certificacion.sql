-- Insertar las 3 Figuras de Certificación como documentos indexados
-- Estos serán encontrados automáticamente por el RAG cuando pregunten por las figuras

INSERT INTO documents (content, metadata) VALUES
(
  'Figura 1 - Asesor/Promotor de Fondos de Inversión: Certificación enfocada en la comercialización de fondos de inversión al público inversionista. Los profesionales certificados en esta figura pueden ofrecer, vender y promocionar fondos de inversión a inversionistas individuales e institucionales. Es esencial para trabajar en fondos mutuos, fondos de pensión y productos similares.',
  '{"tipo": "figura_certificacion", "numero": 1, "titulo": "Asesor/Promotor de Fondos de Inversión"}'::jsonb
),
(
  'Figura 2 - Promotor de Valores: Certificación centrada en la promoción y venta de valores en casas de bolsa o bancos. Permite a los profesionales negociar, promocionar y vender instrumentos bursátiles directamente con clientes, incluyendo acciones, bonos, títulos de deuda y otros valores en el mercado de capitales.',
  '{"tipo": "figura_certificacion", "numero": 2, "titulo": "Promotor de Valores"}'::jsonb
),
(
  'Figura 3 - Asesor en Estrategias de Inversión: Es la certificación de mayor nivel, esencial para gestionar carteras y brindar asesoría avanzada. Los profesionales pueden desarrollar estrategias personalizadas, gestionar portafolios complejos, realizar análisis profundos de inversión y asesorar sobre asignación de activos. Requiere dominio profundo del mercado y experiencia considerable.',
  '{"tipo": "figura_certificacion", "numero": 3, "titulo": "Asesor en Estrategias de Inversión"}'::jsonb
);

-- Crear índice full-text para búsquedas rápidas de figuras
CREATE INDEX IF NOT EXISTS idx_documents_figura ON documents USING GIN(metadata)
WHERE metadata->>'tipo' = 'figura_certificacion';
