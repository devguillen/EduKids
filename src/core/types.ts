export interface IGameLevel {
  question: string;
  options: string[];
  correctAnswer: string;
  hint: string;
}

export interface IGameProfile {
  age: number;
  subject: string;
  topic: string;
}

export interface IAIProvider {
  generateJsonResponse(prompt: string, systemInstruction: string): Promise<string>;
}

export interface ITutorResponse {
  readonly success: boolean;
  readonly gameLevel: IGameLevel | null;
  readonly error: string | null;
}
