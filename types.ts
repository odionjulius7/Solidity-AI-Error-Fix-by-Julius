
export interface SolidityAnalysis {
  explanation: string;
  suggestedFix: string;
  missingFiles?: {
    filename: string;
    content: string;
  }[];
  isCritical: boolean;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  analysis?: SolidityAnalysis;
}
