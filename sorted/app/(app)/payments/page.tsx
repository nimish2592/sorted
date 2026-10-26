import { CreditCard } from 'lucide-react';
import { ComingSoonPage } from '@/components/records/coming-soon';

export default function PaymentsPage() {
  return (
    <ComingSoonPage
      title="Payments"
      description="Payment history across bills and invoices, with reimbursements."
      icon={CreditCard}
    />
  );
}
