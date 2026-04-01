import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const variants = {
  default: 'bg-gray-700/50 text-gray-300',
  success: 'bg-green-400/10 text-green-400',
  warning: 'bg-yellow-400/10 text-yellow-400',
  danger: 'bg-red-400/10 text-red-400',
  info: 'bg-blue-400/10 text-blue-400',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, BadgeProps['variant']> = {
    active: 'success',
    approved: 'success',
    pending: 'warning',
    rejected: 'danger',
    removed: 'danger',
    completed: 'info',
  };
  return (
    <Badge variant={variantMap[status] || 'default'}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
