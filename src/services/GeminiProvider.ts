import { GoogleGenAI } from '@google/genai';
import { IAIProvider, IChatMessage } from '../core/types';

export class GeminiProvider implements IAIProvider {
  private readonly client: any;
  private readonly modelName: string;

  constructor(apiKey: string, modelName: string = 'gemini-2.0-flash') {
    if (!apiKey) {
      throw new Error('[GeminiProvider] API Key is required. Verifique o seu .env');
    }
    // O novo SDK agrupa tudo em um Client centralizado
    this.client = new GoogleGenAI({ apiKey });
    this.modelName = modelName;
  }

  public async sendMessage(
    prompt: string, 
    systemInstruction: string, 
    history: IChatMessage[]
  ): Promise<{ responseText: string; updatedHistory: IChatMessage[] }> {
    try {
      // No novo SDK, criamos a sessão com a config de sistema
      const chat = this.client.chats.create({
        model: this.modelName,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
        history, // O histórico injetado para restaurar estado
      });

      const result = await chat.sendMessage(prompt);
      const response = result.response;
      const responseText = response.text();
      
      if (!responseText) {
        throw new Error('A IA não retornou conteúdo (Filtro de segurança).');
      }

      // No novo SDK, o histórico é acessível após a mensagem
      const updatedHistory = chat.history;
      
      return {
        responseText,
        updatedHistory: updatedHistory as IChatMessage[],
      };
      
    } catch (error: any) {
      console.error('[GeminiProvider Modern] Chat Error:', error);
      
      // Erros específicos de cota e autenticação
      const status = error?.status || error?.response?.status;
      if (status === 429) throw new Error('Limite de requisições excedido.');
      if (status === 403 || status === 401) throw new Error('Chave de API inválida ou sem permissão.');

      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no SDK Moderno';
      throw new Error(`[Modern AI Failure]: ${errorMessage}`);
    }
  }
}
