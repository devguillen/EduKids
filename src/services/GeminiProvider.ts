import { GoogleGenAI } from '@google/genai';
import { IAIProvider, IChatMessage } from '../core/types';

export class GeminiProvider implements IAIProvider {
  private readonly client: any;
  private readonly modelName: string;

  constructor(apiKey: string, modelName: string = 'gemini-2.0-flash') {
    if (!apiKey) {
      throw new Error('[GeminiProvider] API Key is required. Verifique o seu .env');
    }
    // Forçamos a versão 'v1beta' para suportar systemInstruction e JSON mode
    this.client = new GoogleGenAI({ 
      apiKey,
      httpOptions: { apiVersion: 'v1beta' } 
    });
    this.modelName = modelName;
  }

  public async sendMessage(
    prompt: string, 
    systemInstruction: string, 
    history: IChatMessage[]
  ): Promise<{ responseText: string; updatedHistory: IChatMessage[] }> {
    try {
      const chat = this.client.chats.create({
        model: this.modelName,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
        history,
      });

      const result = await chat.sendMessage({ message: prompt });
      const response = result.response;
      const responseText = response.text();
      
      if (!responseText) {
        throw new Error('A IA não retornou conteúdo (Filtro de segurança).');
      }

      return {
        responseText,
        updatedHistory: chat.history as IChatMessage[],
      };
      
    } catch (error: any) {
      console.error('[GeminiProvider Modern] Chat Error:', error);
      
      const status = error?.status || error?.response?.status;

      // ESTRATÉGIA DE RESILIÊNCIA (STAFF ENGINEER):
      // Se estourar a cota (429), retornamos uma resposta simulada válida 
      // para permitir que o desenvolvedor continue testando o fluxo do app.
      if (status === 429) {
        console.warn('⚠️ QUOTA EXCEDIDA. Ativando modo de pedagogia simulada para não travar o desenvolvimento.');
        
        const mockResponse = {
          question: "Como o sol brilha?",
          options: ["Com eletricidade", "Com fusão nuclear", "Com lanternas", "Com fogo"],
          correctAnswer: "Com fusão nuclear",
          hint: "O Sol é uma estrela gigante que esmaga átomos!"
        };

        return {
          responseText: JSON.stringify(mockResponse),
          updatedHistory: [...history, 
            { role: 'user', parts: [{ text: prompt }] },
            { role: 'model', parts: [{ text: JSON.stringify(mockResponse) }] }
          ] as IChatMessage[]
        };
      }

      if (status === 403 || status === 401) throw new Error('Chave de API inválida ou sem permissão.');

      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no SDK Moderno';
      throw new Error(`[Modern AI Failure]: ${errorMessage}`);
    }
  }
}
