
export enum AgentRole {
  GAIA = 'GAIA',
  NEXUS = 'NEXUS',
  USER = 'USER'
}

export interface ChatMessage {
  id: string;
  role: AgentRole;
  text: string;
  timestamp: number;
}

export interface VotingTopic {
  id: string;
  title: string;
  votes: number;
}

export interface QuineTemplate {
  name: string;
  languages: string[];
  code: string;
}

export interface DiagnosticResult {
  host: string;
  latency: number;
  status: 'ONLINE' | 'OFFLINE';
  timestamp: number;
}

export interface NeuralEvent {
  id: string;
  type: 'system' | 'neural' | 'diagnostic';
  message: string;
  data?: any;
}
