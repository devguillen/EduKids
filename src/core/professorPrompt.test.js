import { describe, it, expect } from 'vitest';
import { buildPrompt, SYSTEM_ROLE } from './professorPrompt';

describe('professorPrompt module', () => {
  it('should generate a base prompt containing the system role and topic', () => {
    const prompt = buildPrompt({ topic: 'Ciclo da Água' });
    expect(prompt).toContain(SYSTEM_ROLE);
    expect(prompt).toContain('Assunto da aula atual: Ciclo da Água');
    expect(prompt).toContain('Nível de complexidade alvo: basico');
  });

  it('should include user interest as literal analogy context', () => {
    const prompt = buildPrompt({ topic: 'Matemática', userInterest: 'Espaço' });
    expect(prompt).toContain('envolvendo "Espaço" para facilitar');
  });

  it('should error when initialized without a topic', () => {
    expect(() => buildPrompt({ userInterest: 'Trens' })).toThrow('O assunto (topic) é obrigatório.');
  });

  it('should accept custom complexity levels', () => {
    const prompt = buildPrompt({ topic: 'História', complexity: 'médio' });
    expect(prompt).toContain('Nível de complexidade alvo: médio');
  });
});
