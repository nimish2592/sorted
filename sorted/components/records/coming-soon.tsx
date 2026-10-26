import type { LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/records/empty-state';

export function ComingSoonPage({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={icon}
        title={`${title} is next`}
        description="Phase 1 locks the shell and Bills experience. This section is wired into navigation and ready for Phase 3–4."
      />
    </div>
  );
}
