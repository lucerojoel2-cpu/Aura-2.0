
export enum AppMode {
  CHAT = 'CHAT',
  LIVE = 'LIVE',
  SETTINGS = 'SETTINGS'
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  images?: string[];
  isStreaming?: boolean;
}

export interface TranscriptionItem {
  text: string;
  sender: 'user' | 'assistant';
  timestamp: number;
}
