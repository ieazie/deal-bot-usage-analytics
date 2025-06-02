export interface CloudWatchLogEntry {
  timestamp: string;
  message: string;
  level?: string;
  requestId?: string;
  userId?: string;
  conversationId?: string;
  metadata?: Record<string, any>;
}

export interface ParsedLogEntry {
  conversationId: string;
  userId: string;
  message: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    responseTimeMs?: number;
    hasResults: boolean;
    metadata?: Record<string, any>;
  };
  satisfactionScore?: number;
}

export interface IngestionResult {
  success: boolean;
  processedEntries: number;
  errors: string[];
  conversationsCreated: number;
  messagesCreated: number;
} 