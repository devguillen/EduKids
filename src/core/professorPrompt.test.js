import { describe, it, expect } from 'vitest';
import { buildPrompt } from './professorPrompt';

describe('professorPrompt module', () => {
  it('should include the system role and basic identity', () => {
    const prompt = buildPrompt({ 
      topic: 'Matemática', 
      childName: 'Guillen', 
      isNeurodivergent: true, 
      age: 7 
    });
    expect(prompt).toContain('Tutor de Inteligência Artificial');
    expect(prompt).toContain('Aluno: Guillen');
  });

  it('should include pedagogical profile based on neurodivergence', () => {
    const promptND = buildPrompt({ 
      topic: 'Eclipses', 
      childName: 'Ana', 
      isNeurodivergent: true, 
      age: 10 
    });
    const promptNT = buildPrompt({ 
      topic: 'Eclipses', 
      childName: 'Pedro', 
      isNeurodivergent: false, 
      age: 10 
    });
    
    expect(promptND).toContain('Perfil: Neurodivergente');
    expect(promptNT).toContain('Perfil: Neurotípico');
  });

  it('should throw error if topic is missing', () => {
    expect(() => buildPrompt({ childName: 'Teste' })).toThrow('O assunto (topic) é obrigatório.');
  });
});
