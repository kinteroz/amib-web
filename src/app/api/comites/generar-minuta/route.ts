import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export interface MinutaGenerada {
  titulo: string;
  cuerpo: string;
  acuerdos_sugeridos: AcuerdoSugerido[];
}

export interface AcuerdoSugerido {
  descripcion: string;
  area_o_responsable: string;
  fecha_limite_sugerida: string | null;
}

const SYSTEM_PROMPT = `Eres el secretario técnico de los comités de la AMIB (Asociación Mexicana de Instituciones Bursátiles). Redactas minutas formales de gobierno corporativo en español de México.

Reglas:
- Redacta la minuta con estructura formal: asistencia/quórum (si se menciona), orden del día, desarrollo de la sesión por puntos, y resoluciones.
- Tono institucional, tercera persona, sin adornos.
- Detecta TODOS los acuerdos y compromisos mencionados en las notas (frases como "se acordó", "queda pendiente", "X se compromete a", "para la próxima sesión").
- No inventes datos que no estén en las notas.
- Responde SOLO con JSON válido, sin texto adicional ni bloques markdown.`;

const USER_PROMPT = (notas: string, contexto: string) => `Con las siguientes notas de la sesión, redacta la minuta formal y extrae los acuerdos.

${contexto}

<notas>
${notas}
</notas>

Devuelve este JSON exacto (sin texto adicional):
{
  "titulo": "título formal de la minuta (máx 90 caracteres)",
  "cuerpo": "texto completo de la minuta formal, con saltos de línea entre secciones",
  "acuerdos_sugeridos": [
    {
      "descripcion": "acuerdo o compromiso concreto",
      "area_o_responsable": "quién quedó responsable según las notas, o 'Por definir'",
      "fecha_limite_sugerida": "YYYY-MM-DD o null si no se mencionó fecha"
    }
  ]
}`;

export async function POST(req: NextRequest) {
  try {
    // Solo coordinadores y admins pueden generar minutas
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const role = (user?.user_metadata as { role?: string } | undefined)?.role;
    if (!user || !['admin', 'responsable_comite'].includes(role ?? '')) {
      return Response.json({ error: 'No autorizado.' }, { status: 403 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'ANTHROPIC_API_KEY no configurada en el servidor.' }, { status: 500 });
    }

    const { notas, comite_nombre, sesion_nombre, fecha } = await req.json();
    if (!notas || typeof notas !== 'string' || notas.trim().length < 30) {
      return Response.json({ error: 'Escribe las notas de la sesión (mínimo unas líneas).' }, { status: 400 });
    }

    const contexto = [
      comite_nombre ? `Comité: ${comite_nombre}` : null,
      sesion_nombre ? `Sesión: ${sesion_nombre}` : null,
      fecha ? `Fecha de la sesión: ${fecha}` : null,
    ].filter(Boolean).join('\n');

    const anthropic = new Anthropic({ apiKey });
    const respuesta = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: USER_PROMPT(notas.slice(0, 30000), contexto) }],
    });

    const texto = respuesta.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { text: string }).text)
      .join('');

    let minuta: MinutaGenerada;
    try {
      // Tolerar que el modelo envuelva el JSON en ```json ... ```
      const jsonLimpio = texto.replace(/^```(json)?/m, '').replace(/```\s*$/m, '').trim();
      minuta = JSON.parse(jsonLimpio);
    } catch {
      return Response.json({ error: 'La IA devolvió una respuesta inesperada. Intenta de nuevo.' }, { status: 502 });
    }

    if (!minuta.titulo || !minuta.cuerpo) {
      return Response.json({ error: 'La IA devolvió una minuta incompleta. Intenta de nuevo.' }, { status: 502 });
    }
    minuta.acuerdos_sugeridos = Array.isArray(minuta.acuerdos_sugeridos) ? minuta.acuerdos_sugeridos : [];

    return Response.json(minuta);
  } catch (err) {
    console.error('[generar-minuta]', err);
    return Response.json({ error: 'Error al generar la minuta.' }, { status: 500 });
  }
}
