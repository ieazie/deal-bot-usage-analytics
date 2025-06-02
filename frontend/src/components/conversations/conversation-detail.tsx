'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { ConversationDetail } from '@/lib/types';
import { formatDateTime, formatDuration } from '@/lib/utils';

interface ConversationDetailProps {
  conversation: ConversationDetail;
  loading?: boolean;
}

export function ConversationDetailComponent({ conversation, loading = false }: ConversationDetailProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="mt-2 h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardHeader>
        </Card>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Conversation Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Conversation {conversation.id.substring(0, 8)}
              </h1>
              <p className="text-gray-600">User: {conversation.user_id}</p>
            </div>
            <div className="text-right">
              {conversation.satisfaction_score && (
                <div className={`inline-flex px-3 py-1 text-sm rounded-full ${
                  conversation.satisfaction_score >= 4 
                    ? 'bg-green-100 text-green-800' 
                    : conversation.satisfaction_score >= 3 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  Satisfaction: {conversation.satisfaction_score}/5
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Started:</span>
              <p className="text-gray-600">{formatDateTime(conversation.started_at)}</p>
            </div>
            {conversation.ended_at && (
              <div>
                <span className="font-medium text-gray-700">Ended:</span>
                <p className="text-gray-600">{formatDateTime(conversation.ended_at)}</p>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">Total Messages:</span>
              <p className="text-gray-600">{conversation.total_messages}</p>
            </div>
            {conversation.ended_at && (
              <div>
                <span className="font-medium text-gray-700">Duration:</span>
                <p className="text-gray-600">
                  {formatDuration(
                    new Date(conversation.ended_at).getTime() - new Date(conversation.started_at).getTime()
                  )}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Messages</h2>
        {conversation.messages.map((message, index) => (
          <Card key={message.id} className={`${
            message.role === 'user' ? 'ml-8' : 'mr-8'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-green-100 text-green-600'
                }`}>
                  {message.role === 'user' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {message.role}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{formatDateTime(message.timestamp)}</span>
                      {message.response_time_ms && (
                        <span>• {formatDuration(message.response_time_ms)}</span>
                      )}
                      {message.role === 'assistant' && (
                        <span className={`inline-flex px-2 py-1 rounded-full ${
                          message.has_results 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {message.has_results ? 'Has Results' : 'No Results'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.metadata && Object.keys(message.metadata).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer">Metadata</summary>
                      <pre className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-x-auto">
                        {JSON.stringify(message.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 