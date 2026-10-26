'use client';

import { ExternalLink, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DocumentStatusBadge,
  PaymentStatusBadge,
  ReimbursementStatusBadge,
} from '@/components/records/status-badge';
import { formatDate, formatINR } from '@/lib/utils';
import type { BillWithRelations } from '@/types';

export function BillDetail({ bill }: { bill: BillWithRelations }) {
  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b border-border/70 pb-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Vendor</p>
            <h2 className="font-display text-xl font-semibold tracking-tight">
              {bill.vendor.name}
            </h2>
            <p className="mt-0.5 font-mono text-sm text-muted-foreground">
              {bill.invoice_number}
            </p>
          </div>
          <p className="font-display text-2xl font-bold tabular-nums">
            {formatINR(bill.total_amount, bill.currency)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PaymentStatusBadge status={bill.payment_status} />
          <DocumentStatusBadge status={bill.document_status} />
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto py-5 scrollbar-thin">
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Bill details
          </h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Detail label="Vendor" value={bill.vendor.name} />
            <Detail label="Invoice number" value={bill.invoice_number} />
            <Detail label="Invoice date" value={formatDate(bill.invoice_date)} />
            <Detail label="Due date" value={formatDate(bill.due_date)} />
            <Detail label="Subtotal" value={formatINR(bill.subtotal, bill.currency)} />
            <Detail label="Tax" value={formatINR(bill.tax_amount, bill.currency)} />
            <Detail label="Total" value={formatINR(bill.total_amount, bill.currency)} />
            <Detail label="Currency" value={bill.currency} />
          </dl>
        </section>

        <Separator />

        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Document
          </h3>
          {bill.document_status === 'ATTACHED' && bill.file_name ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/30 px-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{bill.file_name}</p>
                <p className="text-xs text-muted-foreground">Stored in Google Drive</p>
              </div>
              <Button variant="outline" size="sm" className="shrink-0" asChild>
                <a
                  href={`https://drive.google.com/file/d/${bill.drive_file_id}/view`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in Drive
                  <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-border/80 px-3 py-4 text-sm text-muted-foreground">
              No document attached yet.
            </p>
          )}
        </section>

        <Separator />

        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Payments
            </h3>
            <Button variant="outline" size="sm" disabled>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add payment
            </Button>
          </div>

          {bill.payments.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border/80 px-3 py-4 text-sm text-muted-foreground">
              No payments recorded.
            </p>
          ) : (
            <ul className="space-y-2">
              {bill.payments.map((payment) => (
                <li
                  key={payment.payment_id}
                  className="rounded-xl border border-border/80 bg-card px-3 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">
                        {formatDate(payment.payment_date)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {payment.account.name}
                      </p>
                    </div>
                    <p className="font-display text-sm font-semibold tabular-nums">
                      {formatINR(payment.amount, bill.currency)}
                    </p>
                  </div>
                  <div className="mt-2">
                    <ReimbursementStatusBadge status={payment.reimbursement_status} />
                  </div>
                  {payment.notes ? (
                    <p className="mt-2 text-xs text-muted-foreground">{payment.notes}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
