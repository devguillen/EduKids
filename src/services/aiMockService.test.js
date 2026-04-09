import { describe, it, expect } from 'vitest';
import { simulateAIResponse } from './aiMockService';

describe('aiMockService', () => {
  it('returns a simulated response based on input', async () => {
    const response = await simulateAIResponse('qualquer coisa', { topic: 'Gatos' });
    expect(response).toContain('explicação sobre Gatos');
  });

  it('greets when the user says olá', async () => {
    const response = await simulateAIResponse('olá mundo');
    expect(response).toContain('Sou seu professor');
  });
});
