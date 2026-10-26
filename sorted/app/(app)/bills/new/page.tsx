'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileUp, PenLine, Upload } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { vendors } from '@/lib/data/sample';
import { cn } from '@/lib/utils';

type Mode = 'choose' | 'upload' | 'manual';

export default function AddBillPage() {
  const [mode, setMode] = useState<Mode>('choose');
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in-up">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href="/bills">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to bills
          </Link>
        </Button>
        <PageHeader
          title="Add Bill"
          description="Upload a bill or enter the details yourself — both paths end in the same tidy record."
        />
      </div>

      {mode === 'choose' ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className="surface-panel card-lift p-6 text-left"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Upload className="h-5 w-5" />
            </div>
            <h2 className="font-display text-lg font-semibold">Upload bill</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Drop a PDF or image. We’ll file it in Drive and open the form.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className="surface-panel card-lift p-6 text-left"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <PenLine className="h-5 w-5" />
            </div>
            <h2 className="font-display text-lg font-semibold">Log manually</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter details now. Attach the document whenever it’s ready.
            </p>
          </button>
        </div>
      ) : null}

      {mode === 'upload' && !fileName ? (
        <Card>
          <CardContent className="p-6">
            <div
              className={cn(
                'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 text-center transition',
                dragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border/80 bg-muted/20'
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) setFileName(file.name);
              }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-primary">
                <FileUp className="h-6 w-6" />
              </div>
              <p className="font-display text-lg font-semibold">Drop your bill here</p>
              <p className="mt-1 text-sm text-muted-foreground">
                PDF, JPG, or PNG · Google Drive filing comes next
              </p>
              <label className="mt-5">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setFileName(file.name);
                  }}
                />
                <span className="inline-flex h-10 cursor-pointer items-center rounded-xl bg-brand-gradient px-4 text-sm font-semibold text-white shadow-glow">
                  Upload file
                </span>
              </label>
              <button
                type="button"
                className="mt-4 text-sm text-muted-foreground underline-offset-4 hover:underline"
                onClick={() => setMode('choose')}
              >
                Or enter details manually
              </button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {(mode === 'manual' || (mode === 'upload' && fileName)) ? (
        <Card>
          <CardContent className="space-y-5 p-6">
            {fileName ? (
              <div className="rounded-xl border border-border/80 bg-muted/30 px-3 py-3 text-sm">
                <p className="font-medium">{fileName}</p>
                <p className="text-xs text-muted-foreground">
                  Ready to file under Drive → 02 Bills / FY 2026-27 / 2026-10
                </p>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Vendor</Label>
                <Select defaultValue={vendors[0].vendor_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((v) => (
                      <SelectItem key={v.vendor_id} value={v.vendor_id}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice_number">Invoice number</Label>
                <Input id="invoice_number" placeholder="INV-12345" defaultValue={fileName ? 'INV-12345' : ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select defaultValue="INR">
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice_date">Invoice date</Label>
                <Input id="invoice_date" type="date" defaultValue="2026-10-20" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Due date</Label>
                <Input id="due_date" type="date" defaultValue="2026-11-20" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtotal">Subtotal</Label>
                <Input id="subtotal" type="number" placeholder="10000" defaultValue={fileName ? '10000' : ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax">Tax</Label>
                <Input id="tax" type="number" placeholder="1800" defaultValue={fileName ? '1800' : ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total">Total</Label>
                <Input id="total" type="number" placeholder="11800" defaultValue={fileName ? '11800' : ''} />
              </div>
              <div className="space-y-2">
                <Label>Payment status</Label>
                <Select defaultValue="UNPAID">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNPAID">Unpaid</SelectItem>
                    <SelectItem value="PARTIALLY_PAID">Partially paid</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {!fileName ? (
              <div className="rounded-xl border border-dashed border-border/80 px-3 py-4 text-sm text-muted-foreground">
                Optional: attach a PDF after saving. Documents can catch up later.
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="brand" asChild>
                <Link href="/bills">Save bill</Link>
              </Button>
              <Button variant="outline" onClick={() => { setMode('choose'); setFileName(null); }}>
                Cancel
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Persistence to Google Sheets & Drive lands in Phase 2 — this form is UI-ready.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
