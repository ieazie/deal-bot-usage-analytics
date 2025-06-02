'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ConversationFiltersProps {
  filters: {
    query?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: string;
  };
  onFiltersChange: (filters: any) => void;
  loading?: boolean;
}

export function ConversationFilters({
  filters,
  onFiltersChange,
  loading = false,
}: ConversationFiltersProps) {
  const handleInputChange = (field: string, value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      query: '',
      startDate: '',
      endDate: '',
      sortBy: 'date',
      sortOrder: 'desc',
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Search & Filter Conversations</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Query */}
        <div className="lg:col-span-2">
          <Input
            placeholder="Search conversations..."
            value={filters.query || ''}
            onChange={(e) => handleInputChange('query', e.target.value)}
            icon={
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>

        {/* Date Filters */}
        <Input
          type="date"
          label="Start Date"
          value={filters.startDate || ''}
          onChange={(e) => handleInputChange('startDate', e.target.value)}
        />

        <Input
          type="date"
          label="End Date"
          value={filters.endDate || ''}
          onChange={(e) => handleInputChange('endDate', e.target.value)}
        />

        {/* Sort Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={filters.sortBy || 'date'}
            onChange={(e) => handleInputChange('sortBy', e.target.value)}
          >
            <option value="date">Date</option>
            <option value="relevance">Relevance</option>
            <option value="responseTime">Response Time</option>
            <option value="satisfaction">Satisfaction</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order
          </label>
          <select
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={filters.sortOrder || 'desc'}
            onChange={(e) => handleInputChange('sortOrder', e.target.value)}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={clearFilters}
            disabled={loading}
            className="w-full"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.query || filters.startDate || filters.endDate) && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          {filters.query && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              Search: "{filters.query}"
              <button
                onClick={() => handleInputChange('query', '')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.startDate && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              From: {filters.startDate}
              <button
                onClick={() => handleInputChange('startDate', '')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.endDate && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              To: {filters.endDate}
              <button
                onClick={() => handleInputChange('endDate', '')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
} 