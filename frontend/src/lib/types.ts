// Base types
export interface Conversation {
  id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  total_messages: number;
  satisfaction_score?: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  response_time_ms?: number;
  has_results: boolean;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
}

// Analytics types
export interface MetricsOverview {
  totalQueries: number;
  totalConversations: number;
  averageResponseTime: number;
  successRate: number;
  noResultsRate: number;
  averageSatisfactionScore?: number;
  periodComparison?: {
    queriesChange: number;
    responseTimeChange: number;
    successRateChange: number;
  };
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface TopicData {
  topic: string;
  count: number;
  percentage: number;
}

export interface ResponseTimeData {
  range: string;
  count: number;
  percentage: number;
  averageTime: number;
}

// Search and filtering types
export interface SearchFilters {
  query?: string;
  startDate?: string;
  endDate?: string;
  minSatisfactionScore?: number;
  maxSatisfactionScore?: number;
  hasResults?: boolean;
  sortBy?: 'date' | 'relevance' | 'responseTime' | 'satisfaction';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Chart data types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
  }[];
}

// Date range types
export interface DateRange {
  startDate?: Date;
  endDate?: Date;
}

export type TimeGranularity = 'daily' | 'weekly' | 'monthly';

// Component props types
export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ComponentType<any>;
  loading?: boolean;
}

// Error types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
} 