import { useQuery } from '@tanstack/react-query';
import { apiClient, ConversationSearchQuery } from '@/lib/api';
import { Conversation, ConversationDetail } from '@/lib/types';

export function useConversations(params: ConversationSearchQuery = {}) {
  return useQuery({
    queryKey: ['conversations', params],
    queryFn: () => apiClient.searchConversations(params),
    select: (data) => ({
      conversations: data.data as Conversation[],
      pagination: {
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
        hasNext: data.page < data.totalPages,
        hasPrev: data.page > 1,
      },
    }),
  });
}

export function useConversationDetail(id: string) {
  return useQuery({
    queryKey: ['conversation-detail', id],
    queryFn: () => apiClient.getConversationDetail(id),
    select: (data) => data.data as ConversationDetail,
    enabled: !!id,
  });
} 