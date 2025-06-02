'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { TopicData } from '@/lib/types';

interface BarChartProps {
  data: TopicData[];
  title: string;
  loading?: boolean;
  color?: string;
  height?: number;
}

export function BarChartComponent({
  data,
  title,
  loading = false,
  color = '#10B981',
  height = 300,
}: BarChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">{title}</h3>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-72 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort data by count and take top 10
  const sortedData = data
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium">{title}</h3>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={sortedData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="topic"
              angle={-45}
              textAnchor="end"
              height={60}
              className="text-xs"
              interval={0}
            />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value, name) => [value, 'Count']}
            />
            <Bar
              dataKey="count"
              fill={color}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 