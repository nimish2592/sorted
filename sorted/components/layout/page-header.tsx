import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type PageHeaderProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
        className
      )}
    >
      {title || description ? (
        <div className={cn('min-w-0', title ? 'page-rail' : undefined)}>
          {title ? (
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
          ) : null}
          {description ? (
            <p
              className={cn(
                'max-w-2xl text-sm text-muted-foreground',
                title ? 'mt-1' : undefined
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="min-w-0" />
      )}
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
