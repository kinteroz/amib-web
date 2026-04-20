const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const models = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // dummy
    // Actually there is a listModels method on the genAI object
    const result = await genAI.listModels();
    console.log("Available Models:");
    result.models.forEach(m => {
      console.log(`- ${m.name} (Supported: ${m.supportedGenerationMethods.join(', ')})`);
    });
  } catch (e) {
    console.error("Error listing models:", e);
  }
}

listModels();
