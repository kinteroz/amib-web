import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';

export interface OficioExtraido {
  numero_oficio: string;
  titulo: string;
  fecha_recepcion: string;
  fecha_efectos: string | null;
  plazo_dias_habiles: number;
  criticidad: 'alta' | 'media' | 'baja';
  resumen: string;
  tareas_sugeridas: TareaSugerida[];
}

export interface TareaSugerida {
  numero: number;
  descripcion: string;
  area_responsable: string;
  dias_planeados: number;
}

const SYSTEM_PROMPT = `Eres un experto en análisis de oficios regulatorios de la CNBV (Comisión Nacional Bancaria y de Valores) dirigidos a la AMIB (Asociación Mexicana de Intermediarios Bursátiles).

Tu tarea es extraer información estructurada de oficios y proponer un plan de atención claro.

Reglas:
- Extrae ÚNICAMENTE datos que estén explícitos en el texto del oficio.
- Si un dato no aparece claramente, usa un valor razonable por defecto o null.
- El plazo_dias_habiles por defecto es 20 si no se especifica.
- Las tareas_sugeridas deben cubrir todos los requerimientos del oficio.
- Responde SOLO con JSON válido, sin texto adicional ni bloques markdown.`;

const USER_PROMPT = (texto: string) => `Analiza el siguiente oficio de la CNBV y extrae los datos en JSON:

<oficio>
${texto}
</oficio>

Devuelve este JSON exacto (sin texto adicional):
{
  "numero_oficio": "número oficial completo del oficio",
  "titulo": "título descriptivo del tema principal (máx 80 caracteres)",
  "fecha_recepcion": "YYYY-MM-DD",
  "fecha_efectos": "YYYY-MM-DD o null si no aplica",
  "plazo_dias_habiles": número entero,
  "criticidad": "alta" o "media" o "baja",
  "resumen": "2-3 oraciones que expliquen qué solicita la CNBV y por qué",
  "tareas_sugeridas": [
    {
      "numero": 1,
      "descripcion": "acción concreta que debe realizarse",
      "area_responsable": "área o departamento que debe ejecutarla",
      "dias_planeados": días hábiles sugeridos para completarla
    }
  ]
}`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('pdf') as File | null;

    if (!file || file.type !== 'application/pdf') {
      return Response.json({ error: 'Se requiere un archivo PDF válido.' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'ANTHROPIC_API_KEY no configurada en el servidor.' }, { status: 500 });
    }

    // Extraer texto del PDF
    // Importamos el módulo interno para evitar el check de module.parent que dispara
    // modo debug y falla buscando archivos de test en el directorio del proyecto.
    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
    const { text } = await pdfParse(buffer);

    if (!text?.trim()) {
      return Response.json({ error: 'No se pudo extraer texto del PDF. Verifica que el archivo no esté protegido.' }, { status: 422 });
    }

    // Llamar a Claude para extraer datos estructurados
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: USER_PROMPT(text) }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    const jsonStr = extraerJSONRaiz(responseText);
    if (!jsonStr) {
      return Response.json({ error: 'La IA no devolvió un JSON válido. Intenta de nuevo.' }, { status: 500 });
    }

    const extraido: OficioExtraido = JSON.parse(jsonStr);

    return Response.json({ success: true, data: extraido });

  } catch (err: any) {
    console.error('[/api/oficios/procesar]', err);
    if (err instanceof SyntaxError) {
      return Response.json({ error: 'Error al parsear la respuesta de la IA.' }, { status: 500 });
    }
    return Response.json({ error: err.message ?? 'Error interno del servidor.' }, { status: 500 });
  }
}

// Encuentra el objeto JSON raíz respetando depth y strings,
// evitando que un regex greedy capture texto extra fuera del objeto.
function extraerJSONRaiz(texto: string): string | null {
  // Intentar parseo directo primero (respuesta limpia)
  const limpio = texto.replace(/^```(?:json)?\s*/m, '').replace(/```\s*$/m, '').trim();
  try { JSON.parse(limpio); return limpio; } catch {}

  const inicio = texto.indexOf('{');
  if (inicio === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = inicio; i < texto.length; i++) {
    const c = texto[i];
    if (escape)              { escape = false; continue; }
    if (c === '\\' && inString) { escape = true; continue; }
    if (c === '"')           { inString = !inString; continue; }
    if (inString)            { continue; }
    if (c === '{')           { depth++; }
    else if (c === '}')      { depth--; if (depth === 0) return texto.slice(inicio, i + 1); }
  }
  return null;
}
