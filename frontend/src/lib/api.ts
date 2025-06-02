const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7001';

interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface MetricsQuery {
  startDate?: string;
  endDate?: string;
  granularity?: 'daily' | 'weekly' | 'monthly';
}

interface ConversationSearchQuery {
  query?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'relevance' | 'responseTime';
  sortOrder?: 'asc' | 'desc';
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Analytics endpoints
  async getMetricsOverview(params: MetricsQuery = {}) {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return this.request<ApiResponse<any>>(`/analytics/overview?${queryString}`);
  }

  async getQueryCounts(params: MetricsQuery = {}) {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return this.request<ApiResponse<any>>(`/analytics/query-counts?${queryString}`);
  }

  async getCommonTopics(params: MetricsQuery = {}) {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return this.request<ApiResponse<any>>(`/analytics/common-topics?${queryString}`);
  }

  async getResponseTimes(params: MetricsQuery = {}) {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return this.request<ApiResponse<any>>(`/analytics/response-times?${queryString}`);
  }

  async getNoResultsQueries(params: MetricsQuery = {}) {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return this.request<ApiResponse<any>>(`/analytics/no-results?${queryString}`);
  }

  // Conversation endpoints
  async searchConversations(params: ConversationSearchQuery = {}) {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return this.request<PaginatedResponse<any>>(`/conversations/search?${queryString}`);
  }

  async getConversationDetail(id: string) {
    return this.request<ApiResponse<any>>(`/conversations/${id}`);
  }

  // Health check
  async healthCheck() {
    return this.request<ApiResponse<any>>('/health');
  }
}

export const apiClient = new ApiClient();
export type { ApiResponse, PaginatedResponse, MetricsQuery, ConversationSearchQuery }; 