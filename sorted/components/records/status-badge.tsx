import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { DocumentStatus, PaymentStatus, ReimbursementStatus } from '@/types';

const variantClasses = {
  neutral: 'bg-muted text-muted-foreground border-border',
  info: 'bg-info/10 text-info border-info/20',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  error: 'bg-destructive/10 text-destructive border-destructive/20',
} as const;

const dotClasses = {
  neutral: 'bg-muted-foreground',
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-destructive',
} as const;

type Tone = keyof typeof variantClasses;

function StatusPill({
  label,
  tone,
  className,
}: {
  label: string;
  tone: Tone;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5 font-medium', variantClasses[tone], className)}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dotClasses[tone])} />
      {label}
    </Badge>
  );
}

const paymentConfig: Record<PaymentStatus, { label: string; tone: Tone }> = {
  UNPAID: { label: 'Unpaid', tone: 'error' },
  PARTIALLY_PAID: { label: 'Partially paid', tone: 'warning' },
  PAID: { label: 'Paid', tone: 'success' },
};

const documentConfig: Record<DocumentStatus, { label: string; tone: Tone }> = {
  MISSING: { label: 'Missing', tone: 'warning' },
  ATTACHED: { label: 'Attached', tone: 'success' },
};

const reimbursementConfig: Record<
  ReimbursementStatus,
  { label: string; tone: Tone }
> = {
  NOT_APPLICABLE: { label: 'N/A', tone: 'neutral' },
  PENDING: { label: 'Reimbursement pending', tone: 'warning' },
  PARTIALLY_REIMBURSED: { label: 'Partially reimbursed', tone: 'info' },
  REIMBURSED: { label: 'Reimbursed', tone: 'success' },
};

export function PaymentStatusBadge({
  status,
  className,
}: {
  status: PaymentStatus;
  className?: string;
}) {
  const config = paymentConfig[status];
  return <StatusPill label={config.label} tone={config.tone} className={className} />;
}

export function DocumentStatusBadge({
  status,
  className,
}: {
  status: DocumentStatus;
  className?: string;
}) {
  const config = documentConfig[status];
  return <StatusPill label={config.label} tone={config.tone} className={className} />;
}

export function ReimbursementStatusBadge({
  status,
  className,
}: {
  status: ReimbursementStatus;
  className?: string;
}) {
  const config = reimbursementConfig[status];
  return <StatusPill label={config.label} tone={config.tone} className={className} />;
}

export { StatusPill };
