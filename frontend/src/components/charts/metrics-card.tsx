import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatNumber } from '@/lib/utils';

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export function MetricsCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  loading = false,
  className,
}: MetricsCardProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 w-6 bg-gray-200 rounded"></div>
            </div>
            <div className="mt-2 h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="mt-1 h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return formatNumber(val);
    }
    return val;
  };

  const getChangeColor = (change?: number) => {
    if (!change) return 'text-gray-500';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (change?: number) => {
    if (!change) return null;
    return change > 0 ? '↗' : '↘';
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          {icon && (
            <div className="text-gray-400">
              {icon}
            </div>
          )}
        </div>
        <div className="mt-2">
          <div className="text-3xl font-bold text-gray-900">
            {formatValue(value)}
          </div>
          {change !== undefined && (
            <p className={cn('text-xs flex items-center mt-1', getChangeColor(change))}>
              <span className="mr-1">{getChangeIcon(change)}</span>
              {Math.abs(change)}% {changeLabel || 'from last period'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 