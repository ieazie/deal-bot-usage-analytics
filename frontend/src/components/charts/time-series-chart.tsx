'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { TimeSeriesData } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface TimeSeriesChartProps {
  data: TimeSeriesData[];
  title: string;
  loading?: boolean;
  color?: string;
  height?: number;
}

export function TimeSeriesChart({
  data,
  title,
  loading = false,
  color = '#3B82F6',
  height = 300,
}: TimeSeriesChartProps) {
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

  const formatTooltipDate = (date: string) => {
    return formatDate(new Date(date));
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium">{title}</h3>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="date"
              tickFormatter={formatTooltipDate}
              className="text-xs"
            />
            <YAxis className="text-xs" />
            <Tooltip
              labelFormatter={formatTooltipDate}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 