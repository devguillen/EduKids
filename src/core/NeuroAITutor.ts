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

      // Limpeza de possíveis artefatos (backticks) mesmo com responseMimeType
      const cleanJson = rawJsonString.replace(/```json|```/g, '').trim();

      try {
        const parsedLevel: IGameLevel = JSON.parse(cleanJson);
        
        if (!parsedLevel.question || !parsedLevel.options || !parsedLevel.correctAnswer) {
            throw new Error('Campos obrigatórios ausentes no JSON da IA.');
        }

        return {
          success: true,
          gameLevel: parsedLevel,
          error: null,
        };
      } catch (parseError) {
        console.error('[NeuroAITutor] Fallback JSON Parse Error:', parseError, 'Raw:', cleanJson);
        throw new Error('Falha catastrófica ao decodificar inteligência pedagógica.');
      }

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
