import { describe, it, expect, vi } from 'vitest';
import { NeuroAITutor } from './NeuroAITutor';
import { IAIProvider, ILearnerProfile } from './types';

describe('NeuroAITutor Core Validation', () => {
  const mockProfile: Readonly<ILearnerProfile> = {
    id: 'user_123',
    focalInterest: 'Sistemas Planetários',
    supportLevel: 1,
    requiresLiteralLanguage: true,
  };

  it('Deve lançar erro na iniciação se o AI Provider for omitido (Dep. Inversion Breach)', () => {
    // @ts-expect-error testando bypass de tipagem runtime
    expect(() => new NeuroAITutor(null)).toThrow('[NeuroAITutor] ReferenceError');
  });

  it('Deve retornar erro graceful via ITutorResponse quando a requisição de rede do provedor falhar', async () => {
    // Mocking falha de rede do IAIProvider
    const mockProviderObj: IAIProvider = {
      generateResponse: vi.fn().mockRejectedValue(new Error('Network/API Timeout')),
    };

    const tutor = new NeuroAITutor(mockProviderObj);
    const result = await tutor.teachConcept('Como funciona a gravidade?', mockProfile);

    // Validação estrita do encapsulamento do erro (não deve dar throw no loop da UI principal)
    expect(result.success).toBe(false);
    expect(result.content).toBeNull();
    expect(result.error).toBe('Tivemos um problema técnico ao processar sua dúvida. Por favor, tente novamente.');
    expect(mockProviderObj.generateResponse).toHaveBeenCalledTimes(1);
  });
  
  it('Deve processar dados com sucesso retornando os passos literais', async () => {
    const mockResponse = '1. A gravidade puxa as coisas para o chão.\n2. É como o Sol puxando os planetas.';
    const mockProviderObj: IAIProvider = {
      generateResponse: vi.fn().mockResolvedValue(mockResponse),
    };

    const tutor = new NeuroAITutor(mockProviderObj);
    const result = await tutor.teachConcept('O que é gravidade?', mockProfile);

    expect(result.success).toBe(true);
    expect(result.content).toBe(mockResponse);
    expect(result.error).toBeNull();
  });
});
