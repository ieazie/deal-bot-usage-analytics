export class MessageDto {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  responseTimeMs?: number;
  hasResults: boolean;
  metadata?: Record<string, any>;
}

export class ConversationDetailDto {
  id: string;
  userId: string;
  startedAt: Date;
  endedAt?: Date;
  totalMessages: number;
  satisfactionScore?: number;
  createdAt: Date;
  updatedAt: Date;
  messages: MessageDto[];
} 