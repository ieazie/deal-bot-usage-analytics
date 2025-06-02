'use client';

import React, { useState } from 'react';
import { MetricsOverview } from '@/components/dashboard/metrics-overview';
import { TimeSeriesChart } from '@/components/charts/time-series-chart';
import { BarChartComponent } from '@/components/charts/bar-chart';
import { useQueryCounts, useCommonTopics } from '@/hooks/use-analytics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  const { data: queryCountsData = [], isLoading: loadingQueryCounts } = useQueryCounts(dateRange);
  const { data: topicsData = [], isLoading: loadingTopics } = useCommonTopics(dateRange);

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearDateRange = () => {
    setDateRange({
      startDate: '',
      endDate: '',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Monitor Deal Bot usage patterns and performance metrics
        </p>
      </div>

      {/* Date Range Filters */}
      <div className="mb-8 bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Date Range Filter</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            type="date"
            label="Start Date"
            value={dateRange.startDate}
            onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
          />
          <Input
            type="date"
            label="End Date"
            value={dateRange.endDate}
            onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
          />
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={clearDateRange}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="mb-8">
        <MetricsOverview dateRange={dateRange} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Query Trends Chart */}
        <div className="lg:col-span-2">
          <TimeSeriesChart
            data={queryCountsData}
            title="Query Volume Over Time"
            loading={loadingQueryCounts}
            color="#3B82F6"
            height={400}
          />
        </div>

        {/* Common Topics Chart */}
        <div className="lg:col-span-2">
          <BarChartComponent
            data={topicsData}
            title="Most Common Topics"
            loading={loadingTopics}
            color="#10B981"
            height={400}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/conversations'}
          >
            Browse Conversations
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/search'}
          >
            Search Queries
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Refresh Data
          </Button>
        </div>
      </div>
    </div>
  );
} 