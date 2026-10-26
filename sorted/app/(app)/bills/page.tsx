import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { BillsTable } from '@/components/records/bills-table';
import { Button } from '@/components/ui/button';
import { getBillsWithRelations } from '@/lib/data/sample';

export default function BillsPage() {
  const bills = getBillsWithRelations();

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Bills"
        description="Track company expenses and supporting documents."
        actions={
          <Button variant="brand" asChild>
            <Link href="/bills/new">
              <Plus className="mr-1.5 h-4 w-4" />
              Add Bill
            </Link>
          </Button>
        }
      />
      <BillsTable bills={bills} />
    </div>
  );
}
