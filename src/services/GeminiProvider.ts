import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAIProvider } from '../core/types';

export class GeminiProvider implements IAIProvider {
  private readonly genAI: GoogleGenerativeAI;
  private readonly modelName: string;

  constructor(apiKey: string, modelName: string = 'gemini-3-flash') { // use requested next-gen model
    if (!apiKey) {
      throw new Error('[GeminiProvider] API Key is required. Verifique o seu .env');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName;
  }

  public async sendMessage(
    prompt: string, 
    systemInstruction: string, 
    history: IChatMessage[]
  ): Promise<{ responseText: string; updatedHistory: IChatMessage[] }> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        systemInstruction,
      });

      // Inicializa o chat com o histórico recebido
      const chat = model.startChat({
        history,
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
        },
      });

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      if (!responseText) {
        throw new Error('O modelo não retornou nenhum texto (Filtro de segurança).');
      }

      // O SDK gerencia o histórico interno, mas para persistência no LocalStorage
      // precisamos retornar o novo histórico para o domínio (NeuroAITutor)
      const newHistory = await chat.getHistory();
      
      return {
        responseText,
        updatedHistory: newHistory as IChatMessage[],
      };
      
    } catch (error: any) {
      console.error('[GeminiProvider] Chat Session Error:', error);
      
      if (error?.status === 429) throw new Error('Limite de requisições excedido.');
      if (error?.status === 403 || error?.status === 401) throw new Error('API Key inválida.');

      const errorMessage = error instanceof Error ? error.message : 'Unknown Gemini SDK Error';
      throw new Error(`[Chat Generation Failed]: ${errorMessage}`);
    }
  }
}
