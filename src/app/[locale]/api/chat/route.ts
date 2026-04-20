import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

if (!process.env.GEMINI_API_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing env vars: GEMINI_API_KEY, NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();

        if (!message) {
            return new Response(JSON.stringify({ error: "El mensaje está vacío" }), { status: 400 });
        }

        // 1. Full Text Search in Supabase (no embeddings required)
        const { data: documents, error } = await supabase.rpc('search_chunks', {
            query_text: message,
            match_count: 5
        });

        if (error) {
            console.error("Supabase search_chunks error:", error);
            // Continue without context if search fails
        }

        // 2. Build context from retrieved chunks
        let contextText = "";
        if (documents && documents.length > 0) {
            contextText = documents.map((doc: any) => doc.content).join("\n\n---\n\n");
        }

        const systemInstruction = `Eres 'AMIB IA', el asistente virtual oficial de la Asociación Mexicana de Instituciones Bursátiles (AMIB).
Eres experto en certificaciones del mercado de valores mexicano. Responde de forma clara, concisa y profesional en español.

Cuando respondas:
- Basa tus respuestas ESTRICTAMENTE en el contexto provisto abajo.
- Si la información no está en el contexto, di: "No encontré esa información específica en la Guía de Certificación actual. Te recomiendo consultar directamente con AMIB."
- NUNCA inventes reglas, artículos, fechas o requisitos.
- Puedes recomendar eventos o recursos del portal AMIB cuando sea relevante.
- Sé conciso pero completo.

Contexto de la Guía de Certificación:
<contexto>
${contextText || "No se encontraron fragmentos relevantes para esta consulta. Responde de manera general sobre el tema si puedes."}
</contexto>`;

        // 3. Build conversation history for Gemini
        const contents = [
            ...(history || []).map((msg: any) => ({
                role: msg.role === 'user' ? 'user' as const : 'model' as const,
                parts: [{ text: msg.content }]
            })),
            { role: 'user' as const, parts: [{ text: message }] }
        ];

        // 4. Generate response with Gemini 2.0 Flash
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents,
            config: {
                systemInstruction,
                maxOutputTokens: 1024,
            }
        });

        return new Response(JSON.stringify({
            response: response.text,
            sources: documents?.map((d: any) => d.metadata) || []
        }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        });

    } catch (e: any) {
        console.error("Error en chat endpoint:", e);
        return new Response(JSON.stringify({ error: e.message || "Error interno del asistente" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
