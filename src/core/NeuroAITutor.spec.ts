import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NeuroAITutor } from './NeuroAITutor';
import { IAIProvider, IGameProfile, IGameLevel, IChatMessage } from './types';

describe('NeuroAITutor Stateful Session Validation', () => {
  const mockProfile: IGameProfile = {
    childName: 'Lucas',
    age: 12,
    subject: 'Matemática',
    topic: 'Adição',
    isNeurodivergent: false,
  };

  const mockGameLevel: IGameLevel = {
    question: 'Quanto é 5 + 5?',
    options: ['10', '15', '20'],
    correctAnswer: '10',
    hint: 'Pense nos dedos das suas mãos!'
  };

  let mockProvider: IAIProvider;

  beforeEach(() => {
    localStorage.clear();
    mockProvider = {
      sendMessage: vi.fn().mockResolvedValue({
        responseText: JSON.stringify(mockGameLevel),
        updatedHistory: [{ role: 'user', parts: [{ text: '...' }] }, { role: 'model', parts: [{ text: '...' }] }]
      }),
    };
  });

  it('Deve inicializar a sessão se o histórico estiver vazio', async () => {
    const tutor = new NeuroAITutor(mockProvider);
    await tutor.initializeSession(mockProfile);

    expect(mockProvider.sendMessage).toHaveBeenCalledWith(
        expect.stringContaining('Eu sou Lucas'), 
        expect.any(String), 
        []
    );
  });

  it('Deve gerar um mini-game dentro de uma sessão ativa', async () => {
    const tutor = new NeuroAITutor(mockProvider);
    await tutor.initializeSession(mockProfile); 
    
    const result = await tutor.generateMiniGame(mockProfile);

    expect(result.success).toBe(true);
    expect(result.gameLevel).toEqual(mockGameLevel);
    expect(mockProvider.sendMessage).toHaveBeenCalledTimes(2); // 1 seeding + 1 question
  });

  it('Deve recuperar o histórico do LocalStorage na inicialização', async () => {
    const history: IChatMessage[] = [{ role: 'user', parts: [{ text: 'Histórico Antigo' }] }];
    localStorage.setItem('edukids_chat_history', JSON.stringify(history));

    const tutor = new NeuroAITutor(mockProvider);
    // @ts-ignore - acessando propriedade privada para teste
    expect(tutor.chatHistory).toEqual(history);
  });
});
