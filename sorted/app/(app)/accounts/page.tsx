import { Wallet } from 'lucide-react';
import { ComingSoonPage } from '@/components/records/coming-soon';

export default function AccountsPage() {
  return (
    <ComingSoonPage
      title="Accounts"
      description="Company bank, director cards — because sometimes Nimish pays first."
      icon={Wallet}
    />
  );
}
