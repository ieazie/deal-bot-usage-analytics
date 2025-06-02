export interface IConversationSearchFilter {
  search?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  minMessages?: number;
  maxMessages?: number;
  minSatisfaction?: number;
  maxSatisfaction?: number;
}

export interface IConversationSearchOptions {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

export interface ISearchResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
} 