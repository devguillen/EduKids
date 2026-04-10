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
          temperature: 0.7,
          responseMimeType: "application/json",
        },
      });

      const response = await result.response;
      const responseText = response.text();
      
      if (!responseText) {
        throw new Error('O modelo não retornou nenhum texto (possível filtro de segurança).');
      }
      
      return responseText;
      
    } catch (error: any) {
      console.error('[GeminiProvider] API Error:', error);
      
      // Detecção de erros comuns de API (Cota, Chave Inválida)
      if (error?.status === 429) {
          throw new Error('Limite de requisições excedido. Aguarde um minuto.');
      }
      if (error?.status === 403 || error?.status === 401) {
          throw new Error('API Key inválida ou sem permissão.');
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown Gemini SDK Error';
      throw new Error(`[Gemini Generation Failed]: ${errorMessage}`);
    }
  }
}
