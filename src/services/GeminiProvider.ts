import { GoogleGenAI } from '@google/genai';
import { IAIProvider, IChatMessage } from '../core/types';

// ========================================================================
// BANCO DE PERGUNTAS PEDAGÓGICAS (Modo Offline / Quota Excedida)
// Organizado por TÓPICO específico para máxima relevância.
// ========================================================================
const QUESTION_BANK: Record<string, Array<{
  question: string;
  options: string[];
  correctAnswer: string;
  hint: string;
}>> = {
  // ===== MATEMÁTICA =====
  'matematica': [
    { question: "Quanto é 7 + 5?", options: ["10", "11", "12", "13"], correctAnswer: "12", hint: "Dica: 7 + 3 = 10, e sobram 2!" },
    { question: "Quanto é 15 - 8?", options: ["5", "6", "7", "8"], correctAnswer: "7", hint: "Dica: Conte de trás pra frente a partir do 15." },
    { question: "Quanto é 3 x 4?", options: ["7", "10", "12", "14"], correctAnswer: "12", hint: "Dica: É o mesmo que somar 3+3+3+3." },
    { question: "Quanto é 20 ÷ 5?", options: ["3", "4", "5", "6"], correctAnswer: "4", hint: "Dica: Quantos grupos de 5 cabem no 20?" },
    { question: "Qual número vem depois do 99?", options: ["98", "100", "101", "999"], correctAnswer: "100", hint: "Dica: É um número bem redondo!" },
    { question: "Quanto é 6 + 9?", options: ["13", "14", "15", "16"], correctAnswer: "15", hint: "Dica: 6 + 4 = 10, e sobram 5!" },
    { question: "Quanto é 8 x 2?", options: ["14", "16", "18", "10"], correctAnswer: "16", hint: "Dica: O dobro de 8." },
    { question: "Quanto é 50 - 25?", options: ["15", "20", "25", "30"], correctAnswer: "25", hint: "Dica: É a metade de 50!" },
  ],
  'adicao': [
    { question: "Quanto é 12 + 8?", options: ["18", "20", "22", "25"], correctAnswer: "20", hint: "Dica: 12 + 8 = duas dezenas!" },
    { question: "Quanto é 5 + 7?", options: ["10", "11", "12", "13"], correctAnswer: "12", hint: "Dica: 5 + 5 = 10, e sobram 2." },
    { question: "Quanto é 9 + 6?", options: ["13", "14", "15", "16"], correctAnswer: "15", hint: "Dica: 9 + 1 = 10, e sobram 5." },
    { question: "Quanto é 15 + 15?", options: ["25", "28", "30", "35"], correctAnswer: "30", hint: "Dica: É o dobro de 15!" },
    { question: "Quanto é 23 + 7?", options: ["28", "29", "30", "31"], correctAnswer: "30", hint: "Dica: 23 + 7 forma uma dezena exata." },
    { question: "Quanto é 100 + 50?", options: ["120", "140", "150", "200"], correctAnswer: "150", hint: "Dica: 100 mais metade de 100." },
    { question: "Quanto é 11 + 11?", options: ["20", "21", "22", "23"], correctAnswer: "22", hint: "Dica: O dobro de 11." },
    { question: "Quanto é 4 + 8?", options: ["10", "11", "12", "13"], correctAnswer: "12", hint: "Dica: 4 + 6 = 10, e sobram 2." },
  ],
  // ===== GEOGRAFIA =====
  'geografia': [
    { question: "Qual o maior oceano do mundo?", options: ["Atlântico", "Pacífico", "Índico", "Ártico"], correctAnswer: "Pacífico", hint: "Dica: Fica entre a América e a Ásia." },
    { question: "Qual o maior continente?", options: ["África", "América", "Ásia", "Europa"], correctAnswer: "Ásia", hint: "Dica: Lá ficam a China e a Índia." },
    { question: "Qual o rio mais longo do mundo?", options: ["Amazonas", "Nilo", "Mississipi", "Danúbio"], correctAnswer: "Nilo", hint: "Dica: Fica na África e passa pelo Egito." },
    { question: "Quantos continentes existem?", options: ["5", "6", "7", "8"], correctAnswer: "7", hint: "Dica: Europa, Ásia, África, América do Norte, América do Sul, Oceania e Antártida." },
    { question: "Qual país tem formato de bota?", options: ["França", "Portugal", "Itália", "Grécia"], correctAnswer: "Itália", hint: "Dica: Lá se come muita pizza e massa!" },
    { question: "Qual o maior país do mundo em área?", options: ["China", "EUA", "Brasil", "Rússia"], correctAnswer: "Rússia", hint: "Dica: Fica na Europa e na Ásia ao mesmo tempo." },
  ],
  'planetas': [
    { question: "Qual o maior planeta do Sistema Solar?", options: ["Terra", "Marte", "Júpiter", "Saturno"], correctAnswer: "Júpiter", hint: "Dica: É um gigante feito de gás!" },
    { question: "Qual planeta tem anéis?", options: ["Marte", "Saturno", "Vênus", "Netuno"], correctAnswer: "Saturno", hint: "Dica: Seus anéis são feitos de gelo e rochas." },
    { question: "Qual o planeta mais próximo do Sol?", options: ["Terra", "Vênus", "Mercúrio", "Marte"], correctAnswer: "Mercúrio", hint: "Dica: Leva o nome do mensageiro dos deuses." },
    { question: "Qual a estrela mais próxima da Terra?", options: ["Sirius", "Sol", "Alpha Centauri", "Polaris"], correctAnswer: "Sol", hint: "Dica: Você a vê todos os dias!" },
    { question: "Quantos planetas tem o Sistema Solar?", options: ["7", "8", "9", "10"], correctAnswer: "8", hint: "Dica: Plutão já foi, mas agora é planeta anão." },
    { question: "Qual planeta é conhecido como Planeta Vermelho?", options: ["Terra", "Marte", "Júpiter", "Saturno"], correctAnswer: "Marte", hint: "Dica: Sua poeira ferrosa dá essa cor." },
  ],
  'universo': [
    { question: "O que é uma galáxia?", options: ["Uma estrela", "Um planeta", "Um grupo de bilhões de estrelas", "Uma lua"], correctAnswer: "Um grupo de bilhões de estrelas", hint: "Dica: A Via Láctea é a nossa!" },
    { question: "Qual o maior planeta do Sistema Solar?", options: ["Terra", "Marte", "Júpiter", "Saturno"], correctAnswer: "Júpiter", hint: "Dica: É um gigante feito de gás!" },
    { question: "Qual planeta tem anéis?", options: ["Marte", "Saturno", "Vênus", "Netuno"], correctAnswer: "Saturno", hint: "Dica: Seus anéis são feitos de gelo e rochas." },
    { question: "O que é um buraco negro?", options: ["Um buraco no chão", "Uma estrela morta com gravidade fortíssima", "Um túnel no espaço", "Um planeta escuro"], correctAnswer: "Uma estrela morta com gravidade fortíssima", hint: "Dica: Até a luz é sugada por ele!" },
    { question: "Quantos planetas tem o Sistema Solar?", options: ["7", "8", "9", "10"], correctAnswer: "8", hint: "Dica: Plutão já foi, mas agora é planeta anão." },
    { question: "O que a Lua faz ao redor da Terra?", options: ["Fica parada", "Gira ao redor", "Vai e volta", "Nada"], correctAnswer: "Gira ao redor", hint: "Dica: Ela é um satélite natural!" },
  ],
  // ===== CIÊNCIAS =====
  'ciencias': [
    { question: "O que as plantas precisam para fotossíntese?", options: ["Luz e Água", "Apenas Terra", "Sombra", "Suco de Laranja"], correctAnswer: "Luz e Água", hint: "Dica: Elas adoram beber água e tomar sol!" },
    { question: "Qual o maior órgão do corpo humano?", options: ["Coração", "Fígado", "Pele", "Pulmão"], correctAnswer: "Pele", hint: "Dica: Ele cobre todo o seu corpo." },
    { question: "Qual animal é um mamífero?", options: ["Tubarão", "Cobra", "Golfinho", "Arara"], correctAnswer: "Golfinho", hint: "Dica: Ele vive na água, mas mama quando filhote." },
    { question: "Qual gás respiramos?", options: ["Nitrogênio", "Oxigênio", "Carbono", "Hidrogênio"], correctAnswer: "Oxigênio", hint: "Dica: As árvores produzem esse gás para nós." },
    { question: "O que a água vira quando congela?", options: ["Vapor", "Gelo", "Neve", "Gelatina"], correctAnswer: "Gelo", hint: "Dica: Fica durinho e transparente!" },
    { question: "Quantos ossos tem o corpo humano adulto?", options: ["106", "206", "306", "406"], correctAnswer: "206", hint: "Dica: Bebês têm mais, porque alguns se juntam." },
  ],
  // ===== PORTUGUÊS =====
  'portugues': [
    { question: "Qual dessas palavras é um substantivo?", options: ["Correr", "Bonito", "Cachorro", "Rapidamente"], correctAnswer: "Cachorro", hint: "Dica: Substantivos dão nome aos seres e objetos." },
    { question: "Qual frase está no plural?", options: ["O gato dormiu", "As flores cresceram", "A menina cantou", "O sol brilha"], correctAnswer: "As flores cresceram", hint: "Dica: Procure a que tem mais de um ser." },
    { question: "Qual palavra é um verbo?", options: ["Mesa", "Bonito", "Cantar", "Feliz"], correctAnswer: "Cantar", hint: "Dica: Verbos indicam ações." },
    { question: "Qual a sílaba tônica de 'café'?", options: ["ca", "fé", "café inteiro", "nenhuma"], correctAnswer: "fé", hint: "Dica: A que você fala mais forte." },
    { question: "Qual é o antônimo de 'grande'?", options: ["Enorme", "Imenso", "Pequeno", "Alto"], correctAnswer: "Pequeno", hint: "Dica: Antônimo é o contrário!" },
    { question: "Qual frase tem um adjetivo?", options: ["Ele correu", "A casa é bonita", "Choveu hoje", "Eu brinquei"], correctAnswer: "A casa é bonita", hint: "Dica: Adjetivos dão qualidade aos substantivos." },
  ],
  'virgula': [
    { question: "Onde colocar a vírgula? 'João comprou pão leite e ovos'", options: ["Depois de 'pão' e 'leite'", "Depois de 'João'", "Depois de 'e'", "Não precisa de vírgula"], correctAnswer: "Depois de 'pão' e 'leite'", hint: "Dica: A vírgula separa itens de uma lista!" },
    { question: "Qual frase usa a vírgula corretamente?", options: ["Eu comi, arroz", "Maria, venha aqui!", "O gato, dormiu", "Ele, correu rápido"], correctAnswer: "Maria, venha aqui!", hint: "Dica: Usamos vírgula ao chamar alguém (vocativo)." },
    { question: "Pra que serve a vírgula?", options: ["Para enfeitar", "Para separar partes da frase", "Para terminar frases", "Para gritar"], correctAnswer: "Para separar partes da frase", hint: "Dica: Ela organiza as partes da frase." },
    { question: "Qual frase precisa de vírgula?", options: ["Eu gosto de bolo", "Ana Pedro e Luís brincaram", "Ele dormiu cedo", "Choveu muito"], correctAnswer: "Ana Pedro e Luís brincaram", hint: "Dica: Separe os nomes com vírgula!" },
    { question: "A vírgula separa qual tipo de palavra numa lista?", options: ["Verbos", "Itens enumerados", "Artigos", "Preposições"], correctAnswer: "Itens enumerados", hint: "Dica: 'Banana, maçã e uva' é uma lista!" },
    { question: "Onde vai a vírgula? 'Bom dia crianças'", options: ["Depois de 'Bom'", "Depois de 'dia'", "Depois de 'crianças'", "Não precisa"], correctAnswer: "Depois de 'dia'", hint: "Dica: Estamos chamando as crianças (vocativo)." },
  ],
  'acentos': [
    { question: "Qual palavra tem acento agudo?", options: ["Mesa", "Café", "Porta", "Livro"], correctAnswer: "Café", hint: "Dica: O acento agudo é esse: ´ " },
    { question: "Qual dessas palavras é uma oxítona acentuada?", options: ["Lápis", "Sofá", "Árvore", "Fácil"], correctAnswer: "Sofá", hint: "Dica: Oxítonas têm a sílaba tônica na última!" },
    { question: "Qual palavra tem acento circunflexo (^)?", options: ["Avó", "Você", "Café", "Jacaré"], correctAnswer: "Você", hint: "Dica: O circunflexo parece um chapeuzinho: ê" },
    { question: "Por que 'médico' tem acento?", options: ["Porque é bonita", "Porque é proparoxítona", "Para enfeitar", "Não sei"], correctAnswer: "Porque é proparoxítona", hint: "Dica: A sílaba forte é a antepenúltima!" },
    { question: "Qual a diferença entre 'avó' e 'avô'?", options: ["Nenhuma", "Avó é feminino e avô é masculino", "São a mesma coisa", "Avô é mais velho"], correctAnswer: "Avó é feminino e avô é masculino", hint: "Dica: O acento muda o som e o gênero!" },
    { question: "A palavra 'água' tem acento por quê?", options: ["É paroxítona terminada em 'a'", "É bonita", "É proparoxítona", "Sempre leva acento"], correctAnswer: "É paroxítona terminada em 'a'", hint: "Dica: Paroxítonas terminadas em ditongo levam acento." },
  ],
  'leitura': [
    { question: "O que é um parágrafo?", options: ["Uma letra", "Um bloco de frases sobre a mesma ideia", "Uma palavra grande", "Um desenho"], correctAnswer: "Um bloco de frases sobre a mesma ideia", hint: "Dica: Cada parágrafo começa numa linha nova." },
    { question: "O que é o título de um texto?", options: ["A última frase", "O nome que resume o assunto", "Uma vírgula especial", "O autor"], correctAnswer: "O nome que resume o assunto", hint: "Dica: Fica lá em cima, no começo!" },
    { question: "O que é um personagem?", options: ["O autor do livro", "Quem participa da história", "O lugar da história", "O final"], correctAnswer: "Quem participa da história", hint: "Dica: Podem ser pessoas, animais ou até objetos." },
    { question: "O que significa 'narrador'?", options: ["Quem desenha", "Quem conta a história", "Quem escreve", "O vilão"], correctAnswer: "Quem conta a história", hint: "Dica: É a 'voz' que narra tudo." },
    { question: "O que é uma fábula?", options: ["Uma notícia", "Uma história com moral e animais que falam", "Um poema", "Uma receita"], correctAnswer: "Uma história com moral e animais que falam", hint: "Dica: A Cigarra e a Formiga é uma fábula!" },
    { question: "Para que serve o ponto final?", options: ["Para perguntar", "Para terminar uma frase", "Para listar", "Para gritar"], correctAnswer: "Para terminar uma frase", hint: "Dica: É esse pontinho: . " },
  ],
  // ===== DEFAULT =====
  'default': [
    { question: "Quantas patas tem um cachorro?", options: ["2", "3", "4", "6"], correctAnswer: "4", hint: "Dica: Ele tem 4 patinhas!" },
    { question: "Qual cor se forma ao misturar azul e amarelo?", options: ["Vermelho", "Verde", "Roxo", "Laranja"], correctAnswer: "Verde", hint: "Dica: É a cor das folhas das plantas." },
    { question: "Quantos dias tem uma semana?", options: ["5", "6", "7", "8"], correctAnswer: "7", hint: "Dica: Começa no Domingo e termina no Sábado." },
    { question: "Qual é o animal que mia?", options: ["Cachorro", "Gato", "Passarinho", "Sapo"], correctAnswer: "Gato", hint: "Dica: É o bichano peludo!" },
    { question: "Quantos meses tem um ano?", options: ["10", "11", "12", "13"], correctAnswer: "12", hint: "Dica: Janeiro é o primeiro!" },
    { question: "Qual estação vem depois do verão?", options: ["Primavera", "Outono", "Inverno", "Verão"], correctAnswer: "Outono", hint: "Dica: As folhas começam a cair." },
  ]
};

// Rastreia quais perguntas já foram usadas (por chave de tópico)
const usedQuestions: Record<string, Set<number>> = {};

function pickRandomQuestion(key: string) {
  const bank = QUESTION_BANK[key] || QUESTION_BANK['default'];
  
  if (!usedQuestions[key]) {
    usedQuestions[key] = new Set();
  }
  
  // Se usou todas, reseta o ciclo
  if (usedQuestions[key].size >= bank.length) {
    usedQuestions[key].clear();
  }
  
  // Encontra um índice que ainda não foi usado
  let idx: number;
  do {
    idx = Math.floor(Math.random() * bank.length);
  } while (usedQuestions[key].has(idx));
  
  usedQuestions[key].add(idx);
  return bank[idx];
}

/**
 * Detecta a chave do banco de perguntas com base no prompt.
 * Prioriza TÓPICO específico antes de cair na matéria genérica.
 */
function detectSubjectKey(prompt: string): string {
  const p = prompt.toLowerCase();
  
  // Tópicos específicos PRIMEIRO (alta prioridade)
  if (/v[ií]rgula/.test(p)) return 'virgula';
  if (/acento/.test(p)) return 'acentos';
  if (/leitura|texto|interpret/.test(p)) return 'leitura';
  if (/adi[cç][aã]o|soma/.test(p)) return 'adicao';
  if (/planeta/.test(p)) return 'planetas';
  if (/universo|espa[cç]o|gal[aá]xia|astro/.test(p)) return 'universo';
  
  // Matérias genéricas (fallback)
  if (/matem[aá]tica|multiplica|divis|n[uú]meros/.test(p)) return 'matematica';
  if (/geografia|mapa|oceano|continente/.test(p)) return 'geografia';
  if (/ci[eê]ncias|corpo|natureza|animal|biologia|fotoss/.test(p)) return 'ciencias';
  if (/portugu[eê]s|gram[aá]tica|palavra|verbo|substantivo/.test(p)) return 'portugues';
  
  return 'default';
}

// ========================================================================
// CIRCUIT BREAKER — Evita requisições desnecessárias após um 429
// Após um erro de cota, pula direto pro banco local por 60 segundos.
// ========================================================================
let circuitBreakerUntil = 0; // timestamp até quando o circuit breaker está ativo

function isCircuitOpen(): boolean {
  return Date.now() < circuitBreakerUntil;
}

function tripCircuitBreaker(retryAfterSeconds: number = 60) {
  circuitBreakerUntil = Date.now() + retryAfterSeconds * 1000;
}

// ========================================================================
// PROVIDER PRINCIPAL
// ========================================================================
export class GeminiProvider implements IAIProvider {
  private readonly client: any;
  private readonly modelName: string;

  constructor(apiKey: string, modelName: string = 'gemini-2.0-flash') {
    if (!apiKey) {
      throw new Error('[GeminiProvider] API Key is required. Verifique o seu .env');
    }
    this.client = new GoogleGenAI({ 
      apiKey,
      httpOptions: { apiVersion: 'v1beta' } 
    });
    this.modelName = modelName;
  }

  private buildMockResponse(prompt: string, history: IChatMessage[]) {
    const subjectKey = detectSubjectKey(prompt);
    const mockResponse = pickRandomQuestion(subjectKey);
    return {
      responseText: JSON.stringify(mockResponse),
      updatedHistory: [...history, 
        { role: 'user', parts: [{ text: prompt }] },
        { role: 'model', parts: [{ text: JSON.stringify(mockResponse) }] }
      ] as IChatMessage[]
    };
  }

  public async sendMessage(
    prompt: string, 
    systemInstruction: string, 
    history: IChatMessage[]
  ): Promise<{ responseText: string; updatedHistory: IChatMessage[] }> {
    
    // ⚡ CIRCUIT BREAKER: Se a cota estourou recentemente, vai direto pro banco local
    if (isCircuitOpen()) {
      return this.buildMockResponse(prompt, history);
    }

    try {
      const chat = this.client.chats.create({
        model: this.modelName,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
        history,
      });

      const result = await chat.sendMessage({ message: prompt });
      const response = result.response;
      const responseText = response.text();
      
      if (!responseText) {
        throw new Error('A IA não retornou conteúdo (Filtro de segurança).');
      }

      return {
        responseText,
        updatedHistory: chat.history as IChatMessage[],
      };
      
    } catch (error: any) {
      const status = error?.status || error?.response?.status;

      if (status === 429) {
        // Extrai o retry delay da resposta da API, se disponível
        const retryMatch = error?.message?.match(/retry in (\d+)/i);
        const retrySeconds = retryMatch ? parseInt(retryMatch[1]) : 60;
        
        tripCircuitBreaker(retrySeconds);
        console.debug(`[GeminiProvider] Quota excedida. Circuit breaker ativo por ${retrySeconds}s. Usando banco local.`);
        
        return this.buildMockResponse(prompt, history);
      }

      if (status === 403 || status === 401) throw new Error('Chave de API inválida ou sem permissão.');

      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no SDK Moderno';
      throw new Error(`[Modern AI Failure]: ${errorMessage}`);
    }
  }
}
