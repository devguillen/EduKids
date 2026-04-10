import { IAIProvider, ITutorResponse, IGameProfile, IGameLevel, IChatMessage } from './types';
import { buildGameSystemInstruction } from './NeuroTutorConfig';

const STORAGE_KEY = 'edukids_chat_history';

export class NeuroAITutor {
  private readonly aiProvider: IAIProvider;
  private chatHistory: IChatMessage[] = [];

  constructor(aiProvider: IAIProvider) {
    if (!aiProvider) {
      throw new Error('[NeuroAITutor] Provider não selecionado.');
    }
    this.aiProvider = aiProvider;
    this.loadHistory();
  }

  /**
   * Inicializa ou restaura a sessão da IA com o perfil da criança.
   * Cria uma mensagem oculta para 'apresentar' o contexto à IA.
   */
  public async initializeSession(profile: IGameProfile): Promise<void> {
    const systemInstruction = buildGameSystemInstruction(profile);
    
    // Se não há histórico, enviamos uma mensagem de "seeding" para situar a IA
    if (this.chatHistory.length === 0) {
      const seedingPrompt = `Olá, IA! Eu sou ${profile.childName}, tenho ${profile.age} anos e sou uma criança ${profile.isNeurodivergent ? 'neurodivergente (prefiro clareza e termos literais)' : 'neurotípica (gosto de desafios lúdicos)'}. Quero aprender sobre ${profile.subject}.`;
      
      const { updatedHistory } = await this.aiProvider.sendMessage(seedingPrompt, systemInstruction, []);
      this.chatHistory = updatedHistory;
      this.saveHistory();
    }
  }

  /**
   * Pede para a Inteligência Artificial criar uma nova fase do jogo dinamicamente.
   */
  public async generateMiniGame(profile: IGameProfile): Promise<ITutorResponse> {
    try {
      const systemInstruction = buildGameSystemInstruction(profile);
      const prompt = `Matéria: ${profile.subject}. Gere UMA nova pergunta lúdica de nível de dificuldade adequado para o tópico "${profile.topic}".`;

      const { responseText, updatedHistory } = await this.aiProvider.sendMessage(
        prompt, 
        systemInstruction, 
        this.chatHistory
      );

      this.chatHistory = updatedHistory;
      this.saveHistory();

      // Limpeza de possíveis artefatos (backticks)
      const cleanJson = responseText.replace(/```json|```/g, '').trim();
      const parsedLevel: IGameLevel = JSON.parse(cleanJson);
      
      return { success: true, gameLevel: parsedLevel, error: null };

    } catch (error: any) {
      console.error(`[NeuroAITutor] Session Error:`, error);
      return {
        success: false,
        gameLevel: null,
        error: error.message.includes('JSON') ? 'Falha ao decodificar inteligência.' : error.message,
      };
    }
  }

  private saveHistory(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.chatHistory));
    } catch (e) {
      console.warn('[NeuroAITutor] Falha ao salvar no LocalStorage', e);
    }
  }

  private loadHistory(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.chatHistory = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('[NeuroAITutor] Falha ao carregar do LocalStorage', e);
      this.chatHistory = [];
    }
  }

  public clearSession(): void {
    this.chatHistory = [];
    localStorage.removeItem(STORAGE_KEY);
  }
}
