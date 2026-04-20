import { NextRequest } from 'next/server';
import Groq from 'groq-sdk';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
    try {
        const { message, history } = await req.json();

        if (!message) {
            return new Response(JSON.stringify({ error: 'Mensaje es requerido' }), { status: 400 });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.error('GROQ_API_KEY no configurada');
            return new Response(JSON.stringify({ error: 'Error de configuración en el servidor' }), { status: 500 });
        }

        // 1. Inicializar Cliente Groq
        const groq = new Groq({ apiKey });

        const SYSTEM_INSTRUCTION = `Eres AMIB IA, asistente experto en la Guía de Certificación del Mercado de Valores.

LAS 3 FIGURAS DE CERTIFICACIÓN:
- **Figura 1**: Asesor/Promotor de Fondos de Inversión — comercialización de fondos
- **Figura 2**: Promotor de Valores — promoción y venta de valores bursátiles
- **Figura 3**: Asesor en Estrategias de Inversión — nivel máximo, asesoría avanzada y gestión de carteras

INSTRUCCIONES:
- Responde SIEMPRE en español, forma clara, profesional y didáctica
- Si preguntan por "figura 1", "figura 2", "figura 3" o cualquier figura: responde con definición precisa
- Para temas complejos, comienza con TL;DR (1-2 líneas)
- Usa viñetas (•) para listas, no números
- Máximo 150 palabras por tema
- Si falta contexto en la guía, menciona "información complementaria"`;

        const supabase = createAdminClient();

        // 2. Búsqueda RAG en Supabase
        const { data: chunks, error: searchError } = await supabase.rpc('search_chunks', {
            query_text: message,
            match_count: 6
        } as any);

        if (searchError) {
            console.error('Error buscando en Supabase:', searchError);
        }

        // 3. Preparar contexto
        const chunksList = (chunks ?? []) as any[];
        const context = chunksList.length > 0
            ? chunksList.map((c: any) => c.content).join('\n\n')
            : '';

        // 4. Formatear historial para Groq
        const formattedHistory = (history || []).map((h: any) => ({
            role: h.role === 'model' ? 'assistant' : 'user',
            content: h.content,
        }));

        // 5. Construir mensaje con contexto RAG
        const contextBlock = context
            ? `**Contexto de la Guía:**\n${context}\n\n---\n\n`
            : '';

        const messages: any[] = [
            { role: 'user', content: SYSTEM_INSTRUCTION },
            { role: 'assistant', content: 'Entendido. Estoy listo para ayudarte con la Guía de Certificación.' },
            ...formattedHistory,
            {
                role: 'user',
                content: `${contextBlock}Pregunta: ${message}`
            }
        ];

        // 6. Streaming con Groq (llama-3.3-70b es el modelo más actual disponible)
        const stream = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages,
            stream: true,
            temperature: 0.7,
            max_tokens: 1024,
        });

        // 7. Convertir stream de Groq a ReadableStream
        const readableStream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const content = chunk.choices[0]?.delta?.content || '';
                        if (content) {
                            controller.enqueue(new TextEncoder().encode(content));
                        }
                    }
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            }
        });

        return new Response(readableStream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            }
        });

    } catch (error: any) {
        console.error('Error en API Chat:', error);
        return new Response(JSON.stringify({
            error: 'Lo siento, tuve un problema interno.',
            details: error.message
        }), { status: 500 });
    }
}
