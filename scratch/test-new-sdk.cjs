const { GoogleGenAI } = require('@google/genai');

async function testGeminiFlash() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY no está configurada');
      process.exit(1);
    }

    console.log('✓ API Key encontrada');

    const genAI = new GoogleGenAI({ apiKey });
    console.log('✓ Cliente GoogleGenAI inicializado');
    console.log('  Modelos disponibles:', Object.keys(genAI.models));

    // Test simple generateContent
    const response = await genAI.models.generateContent({
      model: 'gemini-3-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: '¿Cuál es la capital de México?' }]
        }
      ]
    });

    console.log('✓ generateContent funcionó');
    console.log('  Respuesta:', response);
    console.log('  Tipo de response:', typeof response);
    console.log('  Keys de response:', Object.keys(response || {}));

    // Intentar acceder al texto
    if (response && response.text) {
      console.log('✓ response.text existe:', response.text);
    } else if (response && typeof response === 'object') {
      console.log('  Estructura completa:', JSON.stringify(response, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testGeminiFlash();
