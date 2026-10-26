import { FileText } from 'lucide-react';
import { ComingSoonPage } from '@/components/records/coming-soon';

export default function InvoicesPage() {
  return (
    <ComingSoonPage
      title="Invoices"
      description="Money VNS Labs expects to receive — tidy, not accounting software."
      icon={FileText}
    />
  );
}
