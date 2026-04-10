export interface IGameLevel {
  question: string;
  options: string[];
  correctAnswer: string;
  hint: string;
}

export interface IGameProfile {
  childName: string;
  age: number;
  subject: string;
  topic: string;
  isNeurodivergent: boolean;
}

export interface IAIProvider {
  generateJsonResponse(prompt: string, systemInstruction: string): Promise<string>;
}

export interface ITutorResponse {
  readonly success: boolean;
  readonly gameLevel: IGameLevel | null;
  readonly error: string | null;
}
