'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { BillDetail } from '@/components/records/bill-detail';
import {
  DocumentStatusBadge,
  PaymentStatusBadge,
} from '@/components/records/status-badge';
import { EmptyState } from '@/components/records/empty-state';
import { formatDate, formatINR } from '@/lib/utils';
import type { BillWithRelations, DocumentStatus, PaymentStatus } from '@/types';
import { Receipt } from 'lucide-react';

export function BillsTable({ bills }: { bills: BillWithRelations[] }) {
  const [search, setSearch] = useState('');
  const [vendor, setVendor] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [documentStatus, setDocumentStatus] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const vendors = useMemo(
    () =>
      Array.from(new Map(bills.map((b) => [b.vendor.vendor_id, b.vendor])).values()).sort(
        (a, b) => a.name.localeCompare(b.name)
      ),
    [bills]
  );

  const filtered = useMemo(() => {
    return bills.filter((bill) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        bill.vendor.name.toLowerCase().includes(q) ||
        bill.invoice_number.toLowerCase().includes(q);
      const matchesVendor = vendor === 'all' || bill.vendor_id === vendor;
      const matchesPayment =
        paymentStatus === 'all' || bill.payment_status === paymentStatus;
      const matchesDocument =
        documentStatus === 'all' || bill.document_status === documentStatus;
      return matchesSearch && matchesVendor && matchesPayment && matchesDocument;
    });
  }, [bills, search, vendor, paymentStatus, documentStatus]);

  const selected = bills.find((b) => b.bill_id === selectedId) ?? null;

  return (
    <>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendor or bill number…"
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:w-auto lg:grid-cols-3">
          <Select value={vendor} onValueChange={setVendor}>
            <SelectTrigger className="w-full lg:w-[160px]">
              <SelectValue placeholder="Vendor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All vendors</SelectItem>
              {vendors.map((v) => (
                <SelectItem key={v.vendor_id} value={v.vendor_id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={paymentStatus} onValueChange={setPaymentStatus}>
            <SelectTrigger className="w-full lg:w-[160px]">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All payments</SelectItem>
              <SelectItem value="UNPAID">Unpaid</SelectItem>
              <SelectItem value="PARTIALLY_PAID">Partially paid</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
            </SelectContent>
          </Select>

          <Select value={documentStatus} onValueChange={setDocumentStatus}>
            <SelectTrigger className="w-full lg:w-[160px]">
              <SelectValue placeholder="Document" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All documents</SelectItem>
              <SelectItem value="ATTACHED">Attached</SelectItem>
              <SelectItem value="MISSING">Missing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No bills match"
          description="Try clearing filters or search for a different vendor."
        />
      ) : (
        <>
          <div className="surface-panel hidden overflow-hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Bill number</TableHead>
                  <TableHead>Bill date</TableHead>
                  <TableHead>Due date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Document</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((bill) => (
                  <TableRow
                    key={bill.bill_id}
                    className="cursor-pointer"
                    onClick={() => setSelectedId(bill.bill_id)}
                  >
                    <TableCell className="font-medium">{bill.vendor.name}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {bill.invoice_number}
                    </TableCell>
                    <TableCell>{formatDate(bill.invoice_date)}</TableCell>
                    <TableCell>{formatDate(bill.due_date)}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatINR(bill.total_amount, bill.currency)}
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge
                        status={bill.payment_status as PaymentStatus}
                      />
                    </TableCell>
                    <TableCell>
                      <DocumentStatusBadge
                        status={bill.document_status as DocumentStatus}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 md:hidden">
            {filtered.map((bill) => (
              <button
                key={bill.bill_id}
                type="button"
                onClick={() => setSelectedId(bill.bill_id)}
                className="surface-panel w-full p-4 text-left transition hover:shadow-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{bill.vendor.name}</p>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                      {bill.invoice_number}
                    </p>
                  </div>
                  <p className="font-display font-semibold tabular-nums">
                    {formatINR(bill.total_amount, bill.currency)}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <PaymentStatusBadge status={bill.payment_status} />
                  <DocumentStatusBadge status={bill.document_status} />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Due {formatDate(bill.due_date)}
                </p>
              </button>
            ))}
          </div>
        </>
      )}

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-md"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Bill detail</SheetTitle>
            <SheetDescription>View bill details and payments</SheetDescription>
          </SheetHeader>
          {selected ? <BillDetail bill={selected} /> : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
