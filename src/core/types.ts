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

export interface IChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface IAIProvider {
  sendMessage(prompt: string, systemInstruction: string, history: IChatMessage[]): Promise<{
    responseText: string;
    updatedHistory: IChatMessage[];
  }>;
}

export interface ITutorResponse {
  readonly success: boolean;
  readonly gameLevel: IGameLevel | null;
  readonly error: string | null;
}
