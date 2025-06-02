'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ConversationList } from '@/components/conversations/conversation-list';
import { ConversationFilters } from '@/components/conversations/conversation-filters';
import { Pagination } from '@/components/ui/pagination';
import { useConversations } from '@/hooks/use-conversations';
import { debounce } from '@/lib/utils';
import { ConversationSearchQuery } from '@/lib/api';

export default function ConversationsPage() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('query') || '';

  const [filters, setFilters] = useState<ConversationSearchQuery & { limit: number }>({
    query: urlQuery,
    startDate: '',
    endDate: '',
    sortBy: 'date',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  });

  // Update filters when URL query changes
  useEffect(() => {
    if (urlQuery !== filters.query) {
      setFilters(prev => ({
        ...prev,
        query: urlQuery,
        page: 1,
      }));
    }
  }, [urlQuery]);

  // Debounced search to avoid too many API calls
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  const debouncedSetFilters = debounce((newFilters) => {
    setDebouncedFilters(newFilters);
  }, 500);

  useEffect(() => {
    debouncedSetFilters(filters);
  }, [filters, debouncedSetFilters]);

  const {
    data,
    isLoading,
    error,
  } = useConversations(debouncedFilters);

  const conversations = data?.conversations || [];
  const pagination = data?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters({
      ...newFilters,
      page: 1, // Reset to first page when filters change
      limit: filters.limit,
    });
  };

  const handlePageChange = (page: number) => {
    setFilters({
      ...filters,
      page,
    });
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading conversations</h3>
              <p className="mt-2 text-sm text-red-700">
                {error instanceof Error ? error.message : 'An unexpected error occurred'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Conversations</h1>
        <p className="mt-2 text-gray-600">
          Browse and search through Deal Bot conversation history
        </p>
        {urlQuery && (
          <div className="mt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Searching for: "{urlQuery}"
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <ConversationFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        loading={isLoading}
      />

      {/* Results Summary */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          {isLoading ? (
            'Loading conversations...'
          ) : (
            `Showing ${conversations.length} of ${pagination.total} conversations`
          )}
        </div>
        
        {/* Results per page */}
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-700">Results per page:</label>
          <select
            className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={filters.limit}
            onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value), page: 1 })}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Conversation List */}
      <div className="mb-8">
        <ConversationList
          conversations={conversations}
          loading={isLoading}
        />
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
        loading={isLoading}
      />
    </div>
  );
} 