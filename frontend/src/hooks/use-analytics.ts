import { useQuery } from '@tanstack/react-query';
import { apiClient, MetricsQuery } from '@/lib/api';
import { MetricsOverview, TimeSeriesData, TopicData, ResponseTimeData } from '@/lib/types';

export function useMetricsOverview(params: MetricsQuery = {}) {
  return useQuery({
    queryKey: ['metrics-overview', params],
    queryFn: () => apiClient.getMetricsOverview(params),
    select: (data) => data.data as MetricsOverview,
  });
}

export function useQueryCounts(params: MetricsQuery = {}) {
  return useQuery({
    queryKey: ['query-counts', params],
    queryFn: () => apiClient.getQueryCounts(params),
    select: (data) => data.data as TimeSeriesData[],
  });
}

export function useCommonTopics(params: MetricsQuery = {}) {
  return useQuery({
    queryKey: ['common-topics', params],
    queryFn: () => apiClient.getCommonTopics(params),
    select: (data) => data.data as TopicData[],
  });
}

export function useResponseTimes(params: MetricsQuery = {}) {
  return useQuery({
    queryKey: ['response-times', params],
    queryFn: () => apiClient.getResponseTimes(params),
    select: (data) => data.data as ResponseTimeData[],
  });
}

export function useNoResultsQueries(params: MetricsQuery = {}) {
  return useQuery({
    queryKey: ['no-results-queries', params],
    queryFn: () => apiClient.getNoResultsQueries(params),
    select: (data) => data.data,
  });
} 