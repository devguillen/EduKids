import { IAIProvider, ITutorResponse, IGameProfile, IGameLevel } from './types';
import { buildGameSystemInstruction } from './NeuroTutorConfig';

export class NeuroAITutor {
  private readonly aiProvider: IAIProvider;

  constructor(aiProvider: IAIProvider) {
    if (!aiProvider) {
      throw new Error('[NeuroAITutor] Provider não selecionado.');
    }
    this.aiProvider = aiProvider;
  }

  /**
   * Pede para a Inteligência Artificial criar uma nova fase do jogo dinamicamente.
   */
  public async generateMiniGame(profile: IGameProfile): Promise<ITutorResponse> {
    if (!profile.age || !profile.subject || !profile.topic) {
       return { success: false, gameLevel: null, error: 'Perfil do jogo incompleto.' };
    }

    try {
      const systemInstruction = buildGameSystemInstruction(profile);
      const prompt = `Gere UMA pergunta lúdica de nível de dificuldade adequado.`;

      // Chamada para o Provider que vai devolver JSON Puro (Graças a responseMimeType)
      const rawJsonString = await this.aiProvider.generateJsonResponse(prompt, systemInstruction);

      // Parseia o retorno que obrigatoriamente é um JSON graças ao Gemini
      const parsedLevel: IGameLevel = JSON.parse(rawJsonString);

      if (!parsedLevel.question || !parsedLevel.options || !parsedLevel.correctAnswer) {
          throw new Error('A IA não gerou todos os campos requeridos do IGameLevel.');
      }

      return {
        success: true,
        gameLevel: parsedLevel,
        error: null,
      };

    } catch (error: unknown) {
      console.error(`[Domain Error - GameGenerator]`, error);
      return {
        success: false,
        gameLevel: null,
        error: 'Puxa! Nossas engrenagens travaram criando sua fase. Vamos tentar de novo?',
      };
    }
  }
}
