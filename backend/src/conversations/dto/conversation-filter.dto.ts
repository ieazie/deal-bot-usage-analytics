export class ConversationFilterDto {
  search?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  minMessages?: number;
  maxMessages?: number;
  minSatisfaction?: number;
  maxSatisfaction?: number;
  hasEndDate?: boolean;
}

export class ConversationSummaryDto {
  id: string;
  userId: string;
  startedAt: Date;
  endedAt?: Date;
  totalMessages: number;
  satisfactionScore?: number;
  duration?: number; // in minutes
  firstMessage?: string; // First user message preview
  lastMessage?: string; // Last message preview
} 