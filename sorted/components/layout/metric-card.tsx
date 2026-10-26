import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export function MetricCard({
  label,
  value,
  icon: Icon,
  accent = 'primary',
  className,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}) {
  const accentClasses = {
    primary: 'text-primary bg-primary/10',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    error: 'text-destructive bg-destructive/10',
    info: 'text-info bg-info/10',
  };

  const barClasses = {
    primary: 'bg-brand-gradient',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-destructive',
    info: 'bg-info',
  };

  return (
    <Card className={cn('card-lift animate-fade-in-up overflow-hidden p-0', className)}>
      <div className={cn('h-1 w-full', barClasses[accent])} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-display text-2xl font-bold tracking-tight tabular-nums truncate">
              {value}
            </p>
          </div>
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              accentClasses[accent]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
    </Card>
  );
}
