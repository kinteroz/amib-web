const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Verify env vars
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ Faltan: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local");
    process.exit(1);
}

// Initialize Supabase with Service Role Key (bypasses RLS for insert)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Resolve PDF Path
const pdfPath = path.resolve(__dirname, '../guias/mercadovalores83.pdf');

// Helper: Chunk text by paragraph
function chunkText(text, maxChars = 2400) {
    const paragraphs = text.split(/\n\s*\n/);
    const chunks = [];
    let currentChunk = "";

    for (const paragraph of paragraphs) {
        if ((currentChunk.length + paragraph.length) > maxChars) {
            if (currentChunk.trim().length > 0) chunks.push(currentChunk.trim());
            currentChunk = paragraph;
        } else {
            currentChunk += "\n\n" + paragraph;
        }
    }

    if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

async function processPDF() {
    console.log(`📄 Leyendo PDF: ${pdfPath}`);

    try {
        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdfParse(dataBuffer);
        const text = data.text;

        console.log(`✅ Texto extraído: ${text.length} caracteres`);
        const chunks = chunkText(text, 2400);
        console.log(`🧩 Fragmentos generados: ${chunks.length}`);

        // Clear previous data from this source to avoid duplicates
        console.log("🗑️  Limpiando chunks previos de esta fuente...");
        await supabase
            .from('document_chunks')
            .delete()
            .eq('metadata->>source', 'Guía_de_Certificación_Versión_8.3');

        console.log("🚀 Subiendo chunks a Supabase...");
        let successCount = 0;
        const BATCH_SIZE = 20;

        for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
            const batch = chunks.slice(i, i + BATCH_SIZE)
                .filter(c => c.length >= 50)
                .map((content, j) => ({
                    content,
                    metadata: {
                        source: 'Guía_de_Certificación_Versión_8.3',
                        chunk_index: i + j
                    }
                }));

            const { error } = await supabase
                .from('document_chunks')
                .insert(batch);

            if (error) {
                console.error(`❌ Error en lote ${i / BATCH_SIZE + 1}:`, error.message);
            } else {
                successCount += batch.length;
                console.log(`✅ ${successCount}/${chunks.length} chunks subidos...`);
            }
        }

        console.log(`\n🎉 ¡Completado! ${successCount} fragmentos cargados en Supabase.`);
        console.log("La IA ya puede buscar en estos documentos usando búsqueda de texto completo.");

    } catch (e) {
        console.error("🚨 Error fatal:", e);
    }
}

processPDF();
