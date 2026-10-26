import { Users } from 'lucide-react';
import { ComingSoonPage } from '@/components/records/coming-soon';

export default function CustomersPage() {
  return (
    <ComingSoonPage
      title="Customers"
      description="Who pays you — ready for invoices in Phase 3."
      icon={Users}
    />
  );
}
