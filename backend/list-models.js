const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = 'AIzaSyAdTiJ6fZjf-It8ZInFYbkoyrak-b2cFlc';
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    console.log('🔍 Listando modelos disponibles...\n');
    
    // Intentar listar modelos
    const models = await genAI.listModels();
    
    console.log('✅ Modelos encontrados:');
    console.log('========================\n');
    
    for (const model of models) {
      console.log(`📦 Nombre: ${model.name}`);
      console.log(`   Display: ${model.displayName}`);
      console.log(`   Métodos: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
      console.log('---');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Intentando con modelos comunes...\n');
    
    // Probar modelos comunes
    const commonModels = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-001',
      'gemini-1.5-pro-latest',
      'models/gemini-pro',
      'models/gemini-1.5-pro',
      'models/gemini-1.5-flash',
    ];
    
    for (const modelName of commonModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Test');
        console.log(`✅ ${modelName} - FUNCIONA`);
        break;
      } catch (err) {
        console.log(`❌ ${modelName} - ${err.message.split('\n')[0]}`);
      }
    }
  }
}

listModels();
