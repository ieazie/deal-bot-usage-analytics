'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Conversation } from '@/lib/types';
import { formatDateTime, formatDuration, truncateText } from '@/lib/utils';

interface ConversationListProps {
  conversations: Conversation[];
  loading?: boolean;
}

export function ConversationList({ conversations, loading = false }: ConversationListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                </div>
                <div className="mt-2 h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="mt-2 h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No conversations found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search filters.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {conversations.map((conversation) => (
        <Link key={conversation.id} href={`/conversations/${conversation.id}`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
                      </svg>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Conversation {conversation.id.substring(0, 8)}
                    </p>
                    <p className="text-sm text-gray-500">
                      User: {conversation.user_id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{conversation.total_messages} messages</span>
                  {conversation.satisfaction_score && (
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      conversation.satisfaction_score >= 4 
                        ? 'bg-green-100 text-green-800' 
                        : conversation.satisfaction_score >= 3 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {conversation.satisfaction_score}/5
                    </span>
                  )}
                  <span>{formatDateTime(conversation.started_at)}</span>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>Started: {formatDateTime(conversation.started_at)}</span>
                  {conversation.ended_at && (
                    <span>Duration: {formatDuration(
                      new Date(conversation.ended_at).getTime() - new Date(conversation.started_at).getTime()
                    )}</span>
                  )}
                </div>
                <div className="flex items-center">
                  <span className="text-blue-600 hover:text-blue-800">View details →</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
} 