import Link from 'next/link';
import {
  AlertTriangle,
  FileWarning,
  Receipt,
  ShieldCheck,
} from 'lucide-react';
import { MetricCard } from '@/components/layout/metric-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  activity,
  bills,
  company,
  compliance,
  currentUser,
  documents,
  getOverviewStats,
} from '@/lib/data/sample';
import { formatINR, greetingForHour, relativeTime } from '@/lib/utils';
import { differenceInCalendarDays, parseISO } from 'date-fns';

export default function OverviewPage() {
  const stats = getOverviewStats();
  const firstName = currentUser.name.split(' ')[0];
  const unpaidCount = bills.filter((b) => b.payment_status !== 'PAID').length;
  const missingDocs =
    bills.filter((b) => b.document_status === 'MISSING').length +
    documents.filter((d) => !d.drive_file_id).length;
  const upcoming = compliance
    .filter((c) => c.status === 'UPCOMING')
    .map((c) => ({
      ...c,
      days: differenceInCalendarDays(parseISO(c.due_date), new Date('2026-10-26')),
    }))
    .sort((a, b) => a.days - b.days);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight page-rail">
          {greetingForHour(new Date('2026-10-26T10:00:00'))}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here’s what’s happening with {company.name}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Bills due"
          value={formatINR(stats.billsDue)}
          icon={Receipt}
          accent="warning"
        />
        <MetricCard
          label="Unpaid bills"
          value={stats.unpaidCount}
          icon={AlertTriangle}
          accent="error"
        />
        <MetricCard
          label="Missing documents"
          value={stats.missingDocuments}
          icon={FileWarning}
          accent="info"
        />
        <MetricCard
          label="Upcoming compliance"
          value={stats.upcomingCompliance}
          icon={ShieldCheck}
          accent="primary"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            <ul className="divide-y divide-border/70">
              {activity.map((item) => (
                <li key={item.activity_id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{item.title}</p>
                    {item.detail ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.detail}</p>
                    ) : null}
                  </div>
                  <p className="shrink-0 text-xs text-muted-foreground">
                    {relativeTime(item.occurred_at)}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg">Needs attention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AttentionRow
              href="/bills?status=UNPAID"
              title={`${unpaidCount} bills are unpaid`}
              detail="Keep vendors happy — and reimbursements tidy."
            />
            <AttentionRow
              href="/bills?document=MISSING"
              title={`${missingDocs} documents are missing`}
              detail="Attach PDFs so your CA isn’t chasing screenshots."
            />
            {upcoming[0] ? (
              <AttentionRow
                href="/compliance"
                title={`1 compliance item is due soon`}
                detail={`${upcoming[0].name} · due in ${upcoming[0].days} days`}
              />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AttentionRow({
  href,
  title,
  detail,
}: {
  href: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 px-3 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
      </div>
      <Button asChild variant="ghost" size="sm" className="shrink-0">
        <Link href={href}>View</Link>
      </Button>
    </div>
  );
}
