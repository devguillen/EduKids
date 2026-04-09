import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAIProvider } from '../core/types';

export class GeminiProvider implements IAIProvider {
  private readonly genAI: GoogleGenerativeAI;
  private readonly modelName: string;

  constructor(apiKey: string, modelName: string = 'gemini-1.5-flash') { // flash is faster for UI apps
    if (!apiKey) {
      throw new Error('[GeminiProvider] API Key is required. Verifique o seu .env');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName;
  }

  public async generateJsonResponse(prompt: string, systemInstruction: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        systemInstruction: systemInstruction,
      });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7, // Criatividade sutil na geração do desafio
          responseMimeType: "application/json", // Força Output Estruturado JSON!!
        },
      });

      const responseText = result.response.text();
      if (!responseText) throw new Error('API retornou nulo');
      
      return responseText;
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown Gemini SDK Error';
      throw new Error(`[Gemini Generation Failed]: ${errorMessage}`);
    }
  }
}
