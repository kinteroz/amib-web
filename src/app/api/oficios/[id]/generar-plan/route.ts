import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export const runtime = 'nodejs';

export interface PasoSugerido {
  orden: number;
  descripcion: string;
  entregable: string | null;
  dias_estimados: number;
  responsable_nombre: string;
}

export interface PlanTareaGenerado {
  tarea_id: string;
  pasos: PasoSugerido[];
}

export interface PlanGeneral {
  resumen_ejecutivo: string;
  areas_involucradas: string[];
  cronograma: { semana: number; hito: string; areas: string[] }[];
  riesgos: string[];
}

export interface PlanGenerado {
  plan_general: PlanGeneral;
  tareas: PlanTareaGenerado[];
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'ANTHROPIC_API_KEY no configurada.' }, { status: 500 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return Response.json({ error: 'Variables de Supabase no configuradas.' }, { status: 500 });
    }

    const supabase = createClient<Database>(supabaseUrl, serviceKey);

    console.log('[generar-plan] buscando oficio', id);
    const { data: oficio, error: ofError } = await supabase
      .from('oficios')
      .select('*')
      .eq('id', id)
      .single();

    if (ofError || !oficio) {
      console.error('[generar-plan] oficio no encontrado', ofError);
      return Response.json({ error: 'Oficio no encontrado.', detalle: ofError?.message }, { status: 404 });
    }

    console.log('[generar-plan] buscando tareas');
    const { data: tareas, error: tareasError } = await supabase
      .from('oficio_tareas')
      .select('id, numero, descripcion, area_responsable, detalle')
      .eq('oficio_id', id)
      .order('orden');

    if (tareasError) console.error('[generar-plan] error tareas', tareasError);

    if (!tareas || tareas.length === 0) {
      return Response.json({ error: 'El oficio no tiene tareas. Agrega tareas primero.' }, { status: 422 });
    }

    console.log('[generar-plan] llamando a Claude con', tareas.length, 'tareas');
    const client = new Anthropic({ apiKey });

    const contexto = {
      numero_oficio: oficio.numero_oficio,
      titulo: oficio.titulo,
      resumen: oficio.resumen_ia,
      plazo_dias_habiles: oficio.plazo_dias_habiles,
      fecha_vencimiento: oficio.fecha_vencimiento,
      datos_extraidos: oficio.datos_extraidos_ia,
    };

    // Streaming obligatorio para respuestas largas (>10 min)
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 64000,
      system: `Eres un experto en gestión de cumplimiento regulatorio para instituciones bursátiles mexicanas.
Tu tarea es generar planes de trabajo detallados y accionables para atender oficios de la CNBV.
Los planes deben ser realistas, específicos y orientados al cumplimiento dentro del plazo establecido.
Responde SOLO con JSON válido, sin texto adicional ni bloques markdown.`,
      messages: [{
        role: 'user',
        content: `Genera un plan de trabajo completo para el siguiente oficio de la CNBV:

<oficio>
${JSON.stringify(contexto, null, 2)}
</oficio>

<tareas>
${JSON.stringify(tareas, null, 2)}
</tareas>

Devuelve exactamente este JSON (sin texto adicional):
{
  "plan_general": {
    "resumen_ejecutivo": "2-3 oraciones describiendo el plan de atención y los compromisos clave",
    "areas_involucradas": ["lista de áreas que participan en la atención del oficio"],
    "cronograma": [
      { "semana": 1, "hito": "descripción concreta del hito clave de esa semana", "areas": ["áreas responsables del hito"] }
    ],
    "riesgos": ["riesgo que podría retrasar el cumplimiento", "otro riesgo"]
  },
  "tareas": [
    {
      "tarea_id": "uuid de la tarea tal como viene en el input",
      "pasos": [
        {
          "orden": 1,
          "descripcion": "paso concreto y accionable (verbo en infinitivo)",
          "entregable": "documento o resultado tangible que evidencia el cumplimiento, o null si no aplica",
          "dias_estimados": 3,
          "responsable_nombre": "área o rol responsable de ejecutar este paso"
        }
      ]
    }
  ]
}`,
      }],
    });

    const message = await stream.finalMessage();
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    console.log('[generar-plan] Claude respondió —', message.usage.output_tokens, 'tokens output, stop_reason:', message.stop_reason);
    const jsonStr = extraerJSON(responseText);
    if (!jsonStr) {
      console.error('[generar-plan] JSON no extraído, respuesta raw:', responseText.slice(0, 500));
      return Response.json({ error: 'La IA no devolvió un JSON válido. Intenta de nuevo.' }, { status: 500 });
    }

    const plan: PlanGenerado = JSON.parse(jsonStr);
    console.log('[generar-plan] plan generado, guardando en DB');

    // Guardar plan_general en el oficio
    const { error: updateError } = await supabase
      .from('oficios')
      .update({ plan_general: plan.plan_general as any })
      .eq('id', id);

    if (updateError) console.error('[generar-plan] error actualizando plan_general:', updateError.message);

    // Por cada tarea: reemplazar pasos anteriores con los nuevos
    for (const t of plan.tareas) {
      const { error: delError } = await supabase
        .from('oficio_tarea_pasos')
        .delete()
        .eq('tarea_id', t.tarea_id);

      if (delError) console.error('[generar-plan] error borrando pasos:', delError.message);

      if (t.pasos.length > 0) {
        const { error: insError } = await supabase.from('oficio_tarea_pasos').insert(
          t.pasos.map(p => ({
            tarea_id:           t.tarea_id,
            orden:              p.orden,
            descripcion:        p.descripcion,
            entregable:         p.entregable ?? null,
            dias_estimados:     p.dias_estimados,
            responsable_nombre: p.responsable_nombre,
          }))
        );
        if (insError) console.error('[generar-plan] error insertando pasos:', insError.message);
      }
    }

    console.log('[generar-plan] listo');
    return Response.json({ success: true, plan });

  } catch (err: any) {
    console.error('[generar-plan] ERROR:', err?.message ?? err);
    return Response.json({ error: err?.message ?? 'Error interno del servidor.' }, { status: 500 });
  }
}

function extraerJSON(texto: string): string | null {
  const limpio = texto.replace(/^```(?:json)?\s*/m, '').replace(/```\s*$/m, '').trim();
  try { JSON.parse(limpio); return limpio; } catch {}

  const inicio = texto.indexOf('{');
  if (inicio === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = inicio; i < texto.length; i++) {
    const c = texto[i];
    if (escape)                  { escape = false; continue; }
    if (c === '\\' && inString)  { escape = true;  continue; }
    if (c === '"')               { inString = !inString; continue; }
    if (inString)                continue;
    if (c === '{')               depth++;
    else if (c === '}')          { depth--; if (depth === 0) return texto.slice(inicio, i + 1); }
  }
  return null;
}
