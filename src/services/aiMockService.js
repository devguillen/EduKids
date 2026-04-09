import { buildPrompt } from '../core/professorPrompt';

export const simulateAIResponse = async (userMessage, config = {}) => {
  const { topic = 'Geral', userInterest, complexity } = config;
  
  if (userMessage.toLowerCase().includes('olá')) {
    return 'Olá. Sou seu professor. O que gostaria de fazer?';
  }

  const prompt = buildPrompt({ topic, userInterest, complexity });
  
  await new Promise(resolve => setTimeout(resolve, 800));

  return `Compreendido. Aqui está uma explicação sobre ${topic}. (Simulado usando contexto de ${userInterest || 'padrão'})`;
};
