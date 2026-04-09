/**
 * @interface IGameLevel
 * @description Estrutura de fase de jogo gerada pela Inteligência Artificial.
 */
export interface IGameLevel {
  /** A pergunta ou desafio (ex: "Acrescente a vírgula correta", "Quanto é 2+2?") */
  question: string;
  /** Arrays de opções lúdicas (ex: ["A avó, foi a feira", "A avó foi, a feira", "A avó foi a feira,"]) */
  options: string[];
  /** A resposta EXATA da lista de options */
  correctAnswer: string;
  /** Uma dica gentil com base na cognição caso ele erre */
  hint: string;
}

/**
 * @interface IGameProfile
 * @description Os dados da criança coletados no Wizard.
 */
export interface IGameProfile {
  age: number;
  subject: string; // Ex: Matemática
  topic: string; // Ex: Adição Visual
}

/**
 * @interface IAIProvider
 */
export interface IAIProvider {
  generateJsonResponse(prompt: string, systemInstruction: string): Promise<string>;
}

export interface ITutorResponse {
  readonly success: boolean;
  readonly gameLevel: IGameLevel | null;
  readonly error: string | null;
}
