import { describe, it, expect, vi } from 'vitest';
import { NeuroAITutor } from './NeuroAITutor';
import { IAIProvider, IGameProfile, IGameLevel } from './types';

describe('NeuroAITutor Core Validation', () => {
  const mockProfile: IGameProfile = {
    age: 7,
    subject: 'Matemática',
    topic: 'Adição',
  };

  it('Deve lançar erro na iniciação se o AI Provider for omitido', () => {
    // @ts-expect-error testando bypass de tipagem runtime
    expect(() => new NeuroAITutor(null)).toThrow('[NeuroAITutor] Provider não selecionado.');
  });

  it('Deve retornar erro graceful via ITutorResponse quando a requisição de rede do provedor falhar', async () => {
    const mockProviderObj: IAIProvider = {
      generateJsonResponse: vi.fn().mockRejectedValue(new Error('Network/API Timeout')),
    };

    const tutor = new NeuroAITutor(mockProviderObj);
    const result = await tutor.generateMiniGame(mockProfile);

    expect(result.success).toBe(false);
    expect(result.gameLevel).toBeNull();
    expect(result.error).toBe('Puxa! Nossas engrenagens travaram criando sua fase. Vamos tentar de novo?');
    expect(mockProviderObj.generateJsonResponse).toHaveBeenCalledTimes(1);
  });
  
  it('Deve processar dados com sucesso retornando o nível do jogo', async () => {
    const mockLevel: IGameLevel = {
      question: 'Quanto é 2 + 2?',
      options: ['3', '4', '5'],
      correctAnswer: '4',
      hint: 'Pense em seus dedos!'
    };
    const mockResponse = JSON.stringify(mockLevel);
    
    const mockProviderObj: IAIProvider = {
      generateJsonResponse: vi.fn().mockResolvedValue(mockResponse),
    };

    const tutor = new NeuroAITutor(mockProviderObj);
    const result = await tutor.generateMiniGame(mockProfile);

    expect(result.success).toBe(true);
    expect(result.gameLevel).toEqual(mockLevel);
    expect(result.error).toBeNull();
  });

  it('Deve falhar se o JSON retornado for inválido', async () => {
    const mockProviderObj: IAIProvider = {
      generateJsonResponse: vi.fn().mockResolvedValue('Invalid JSON content'),
    };

    const tutor = new NeuroAITutor(mockProviderObj);
    const result = await tutor.generateMiniGame(mockProfile);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Puxa! Nossas engrenagens travaram');
  });
});
