export const SYSTEM_ROLE = `Você é um professor especializado em neurodivergência e pedagogia inclusiva.
Sua comunicação deve ser sempre:
1. Extremamente clara, direta e literal.
2. Livre de gírias, metáforas, ironias ou ambiguidades.
3. Estruturada em frases curtas e passos lógicos.
4. Paciente e livre de julgamentos.`;

export const buildPrompt = ({ topic, userInterest, complexity = 'basico' }) => {
  if (!topic) {
    throw new Error('O assunto (topic) é obrigatório.');
  }

  const interestContext = userInterest 
    ? `Utilize exemplos estritamente lógicos e concretos envolvendo "${userInterest}" para facilitar a fixação do conceito.` 
    : '';

  return `${SYSTEM_ROLE}

Assunto da aula atual: ${topic}
Nível de complexidade alvo: ${complexity}
${interestContext}`.trim();
};
