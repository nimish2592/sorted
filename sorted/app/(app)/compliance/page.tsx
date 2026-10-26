import { CheckCircle2, Clock } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { compliance } from '@/lib/data/sample';
import { formatDate } from '@/lib/utils';
import { differenceInCalendarDays, parseISO } from 'date-fns';

const TODAY = new Date('2026-10-26');

export default function CompliancePage() {
  const upcoming = compliance
    .filter((c) => c.status === 'UPCOMING')
    .map((c) => ({
      ...c,
      days: differenceInCalendarDays(parseISO(c.due_date), TODAY),
    }))
    .sort((a, b) => a.days - b.days);

  const completed = compliance.filter((c) => c.status === 'COMPLETED');

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Compliance"
        description="A simple view of what’s due — room to grow into a full engine later."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <Clock className="h-4 w-4 text-primary" />
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.map((item) => (
              <div
                key={item.compliance_id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/70 px-3 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Due {formatDate(item.due_date)}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-primary tabular-nums">
                  Due in {item.days} days
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completed.map((item) => (
              <div
                key={item.compliance_id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/70 px-3 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Completed {item.completed_at ? formatDate(item.completed_at) : '—'}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
