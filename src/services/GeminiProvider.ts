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
        
        let mockResponse = {
          question: "Como o sol brilha?",
          options: ["Com eletricidade", "Com fusão nuclear", "Com lanternas", "Com fogo"],
          correctAnswer: "Com fusão nuclear",
          hint: "O Sol é uma estrela gigante que esmaga átomos!"
        };

        const p = prompt.toLowerCase();
        
        // Regex para ignorar acentos e ser mais flexível
        const isMath = /matem[aá]tica|adi[cç][aã]o|soma|n[uú]meros/.test(p);
        const isGeo = /geografia|planeta|mapa|oceano|universo|espa[cç]o/.test(p);
        const isSci = /ci[eê]ncias|corpo|natureza|animal|biologia/.test(p);
        const isPort = /portugu[eê]s|gram[aá]tica|palavra|leitura/.test(p);

        if (isMath) {
          if (p.includes('adição') || p.includes('adicao')) {
             mockResponse = {
               question: "Quanto é 12 + 8?",
               options: ["18", "20", "22", "25"],
               correctAnswer: "20",
               hint: "Dica: Tente somar 2 ao 8 primeiro para fazer um 10."
             };
          } else {
             mockResponse = {
               question: "Quanto é 5 x 5?",
               options: ["10", "20", "25", "30"],
               correctAnswer: "25",
               hint: "Dica: É o mesmo que somar o 5 cinco vezes."
             };
          }
        } else if (isGeo) {
          if (p.includes('universo') || p.includes('espaço') || p.includes('espaco')) {
            mockResponse = {
              question: "Qual o maior planeta do nosso Sistema Solar?",
              options: ["Terra", "Marte", "Júpiter", "Saturno"],
              correctAnswer: "Júpiter",
              hint: "Dica: É um gigante feito de gás!"
            };
          } else {
            mockResponse = {
              question: "Qual o maior oceano do mundo?",
              options: ["Oceano Atlântico", "Oceano Pacífico", "Oceano Índico", "Oceano Glacial Arctico"],
              correctAnswer: "Oceano Pacífico",
              hint: "Dica: Fica entre a América e a Ásia."
            };
          }
        } else if (isSci) {
          if (p.includes('biologia')) {
             mockResponse = {
               question: "O que as plantas precisam para fazer fotossíntese?",
               options: ["Luz do Sol e Água", "Apenas Terra", "Sombra", "Suco de Laranja"],
               correctAnswer: "Luz do Sol e Água",
               hint: "Dica: Elas adoram beber água e tomar sol!"
             };
          } else {
             mockResponse = {
               question: "Qual planeta é conhecido como o Planeta Vermelho?",
               options: ["Terra", "Marte", "Júpiter", "Saturno"],
               correctAnswer: "Marte",
               hint: "Dica: Tem esse nome por causa da cor da sua poeira ferrosa."
             };
          }
        } else if (isPort) {
          mockResponse = {
            question: "Qual dessas palavras é um substantivo?",
            options: ["Correr", "Bonito", "Cachorro", "Rapidamente"],
            correctAnswer: "Cachorro",
            hint: "Dica: Substantivos dão nome aos seres e objetos."
          };
        }

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
