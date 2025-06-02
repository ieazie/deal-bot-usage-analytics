'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/conversations?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/conversations');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Search Conversations</h1>
        <p className="mt-2 text-gray-600">
          Search through Deal Bot conversation history and messages
        </p>
      </div>

      {/* Search Interface */}
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div>
                <Input
                  placeholder="Search conversations, messages, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-lg py-3"
                  icon={
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
              </div>
              
              <div className="flex space-x-3">
                <Button onClick={handleSearch} className="flex-1">
                  Search Conversations
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/conversations')}
                  className="flex-1"
                >
                  Browse All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Search Suggestions */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Search Examples</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'pricing questions',
              'technical support',
              'product features',
              'billing issues',
              'integration help',
              'account setup'
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setSearchQuery(suggestion);
                  router.push(`/conversations?query=${encodeURIComponent(suggestion)}`);
                }}
                className="text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-sm text-gray-700">{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 