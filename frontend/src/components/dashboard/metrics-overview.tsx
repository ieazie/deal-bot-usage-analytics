'use client';

import React from 'react';
import { MetricsCard } from '@/components/charts/metrics-card';
import { useMetricsOverview } from '@/hooks/use-analytics';
import { formatDuration, formatPercentage } from '@/lib/utils';

interface MetricsOverviewProps {
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
}

export function MetricsOverview({ dateRange = {} }: MetricsOverviewProps) {
  const { data: metrics, isLoading } = useMetricsOverview(dateRange);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <MetricsCard
        title="Total Queries"
        value={metrics?.totalQueries || 0}
        change={metrics?.periodComparison?.queriesChange}
        loading={isLoading}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        }
      />
      
      <MetricsCard
        title="Total Conversations"
        value={metrics?.totalConversations || 0}
        loading={isLoading}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
          </svg>
        }
      />
      
      <MetricsCard
        title="Avg Response Time"
        value={metrics ? formatDuration(metrics.averageResponseTime) : '0ms'}
        change={metrics?.periodComparison?.responseTimeChange}
        loading={isLoading}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      
      <MetricsCard
        title="Success Rate"
        value={metrics ? formatPercentage(metrics.successRate * 100, 100) : '0%'}
        change={metrics?.periodComparison?.successRateChange}
        loading={isLoading}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
    </div>
  );
} 