-- Migration: 2 noticias adicionales para el portal AMIB
-- Date: 2026-04-22
-- NOTA: Se usa $$ dollar-quoting para preservar saltos de línea reales en el contenido.

INSERT INTO public.noticias (titulo, resumen, contenido, categoria, imagen_url, video_url, slug, publicado, destacado, fecha_publicacion)
VALUES
(
  'Reforma al Marco Normativo de Fondos de Inversión 2026',
  'La CNBV y la AMIB presentan actualizaciones al marco regulatorio que moderniza la operación de fondos de inversión en México, fortaleciendo la protección al inversionista.',
  $contenido$# Un Nuevo Capítulo Regulatorio

En un esfuerzo conjunto, la **Comisión Nacional Bancaria y de Valores (CNBV)** y la **AMIB** han publicado las reformas que actualizan la Ley de Fondos de Inversión para alinearse con los estándares internacionales de la IOSCO.

## Principales Cambios

* **Transparencia de comisiones**: Obligatoriedad de reportar el Ratio de Gastos Totales (RGT) en formato estandarizado.
* **Gobierno corporativo**: Fortalecimiento del papel del Comité de Auditoría y del Representante Común.
* **Clasificación de riesgo**: Nuevo sistema de categorización por perfil de riesgo-rendimiento basado en KIID europeo.
* **Información periódica**: Reducción de plazos para reporte de hechos relevantes de 5 a 2 días hábiles.

![Fondos de inversión](https://images.unsplash.com/photo-1611974714024-463ef9c742f9?q=80&w=2070&auto=format&fit=crop)

## Calendario de Implementación

Las nuevas disposiciones entrarán en vigor de forma escalonada:

1. **Mayo 2026**: Publicación en el Diario Oficial de la Federación.
2. **Julio 2026**: Periodo de adecuación para operadoras existentes.
3. **Enero 2027**: Vigencia plena y aplicación de sanciones.

> "Esta reforma coloca a México en la vanguardia regulatoria de América Latina, con un marco que protege al inversionista sin sacrificar la competitividad del sector." — Presidente del Consejo AMIB

## Impacto en el Mercado

Se estima que la reforma beneficiará directamente a más de **2.8 millones de inversionistas** que actualmente tienen recursos en fondos de inversión, con mayor claridad sobre los costos reales de administración y un mejor acceso a información de desempeño ajustado por riesgo.$contenido$,
  'INSTITUCIONAL',
  'https://images.unsplash.com/photo-1611974714024-463ef9c742f9?q=80&w=2070&auto=format&fit=crop',
  NULL,
  'reforma-marco-normativo-fondos-inversion-2026',
  true,
  true,
  '2026-04-19'
),
(
  'Tecnología Blockchain en el Mercado de Valores Mexicano: Oportunidades y Retos',
  'Análisis de cómo la tecnología de registros distribuidos está transformando la liquidación de operaciones bursátiles en México y los desafíos regulatorios que enfrenta su adopción masiva.',
  $contenido$# La Revolución Silenciosa de los Mercados

Mientras el debate público se centra en criptomonedas, el sector bursátil institucional avanza silenciosamente en la adopción de **tecnología blockchain** para eficientar procesos que hoy toman días en completarse.

## Estado Actual en México

El **INDEVAL** (Institución para el Depósito de Valores) inició en 2025 un proyecto piloto para liquidación de valores en **T+1** —reduciendo el ciclo actual de T+2— utilizando una red blockchain permisionada basada en Hyperledger Fabric.

![Blockchain finanzas](https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2070&auto=format&fit=crop)

## Casos de Uso Identificados

### 1. Liquidación Acelerada (T+0)
Permite cerrar el ciclo de liquidación el mismo día de la operación, reduciendo el riesgo de contraparte y liberando capital para nuevas operaciones.

### 2. Smart Contracts para Derivados
Automatización de pagos de margen y liquidación de contratos de futuros y opciones listados en MexDer, eliminando procesos manuales propensos a error.

### 3. Tokenización de Activos
Representación digital de activos como CKDs (Certificados de Capital de Desarrollo) e instrumentos de deuda privada, abriendo la puerta a fraccionalización y mayor liquidez.

### 4. Identidad Digital del Inversionista
Sistema KYC/AML unificado basado en identidad soberana, evitando la duplicación de procesos entre diferentes intermediarios.

## Retos Regulatorios

* **Marco legal**: La Ley del Mercado de Valores no contempla explícitamente activos tokenizados como valores.
* **Interoperabilidad**: Coordinación necesaria entre BMV, BIVA, INDEVAL y custodios internacionales.
* **Ciberseguridad**: Nuevos vectores de ataque en nodos de la red distribuida.
* **Privacidad de datos**: Tensión entre la inmutabilidad del blockchain y el derecho al olvido del GDPR/LFPDPPP.

## Perspectivas 2027

De acuerdo con el estudio de la AMIB *"Mercados 4.0"*, para 2027 se espera que al menos el **40% de las operaciones de renta fija** en México se liquiden en infraestructura DLT, generando ahorros operativos estimados en **USD 85 millones anuales** para el sistema en su conjunto.$contenido$,
  'MERCADOS',
  'https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2070&auto=format&fit=crop',
  'https://www.youtube.com/watch?v=SSo_EIwHSd4',
  'blockchain-mercado-valores-mexicano-oportunidades-retos',
  true,
  false,
  '2026-04-18'
)
ON CONFLICT (slug) DO UPDATE SET
  contenido = EXCLUDED.contenido,
  resumen   = EXCLUDED.resumen,
  imagen_url = EXCLUDED.imagen_url,
  video_url  = EXCLUDED.video_url,
  publicado  = EXCLUDED.publicado,
  destacado  = EXCLUDED.destacado;
