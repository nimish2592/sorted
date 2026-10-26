'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Receipt,
  FileText,
  FolderOpen,
  Users,
  Building2,
  Wallet,
  CreditCard,
  ShieldCheck,
  Settings,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { navItemAllowed, roleLabel } from '@/lib/auth/permissions';

type NavTone = 'cyan' | 'sky' | 'teal' | 'slate';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  tone: NavTone;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const toneActive: Record<NavTone, string> = {
  cyan: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  sky: 'bg-sky-50 text-sky-800 border-sky-200',
  teal: 'bg-teal-50 text-teal-800 border-teal-200',
  slate: 'bg-slate-50 text-slate-800 border-slate-200',
};

const navGroups: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { href: '/', label: 'Overview', icon: LayoutDashboard, tone: 'cyan' },
    ],
  },
  {
    label: 'Records',
    items: [
      { href: '/bills', label: 'Bills', icon: Receipt, tone: 'sky' },
      { href: '/invoices', label: 'Invoices', icon: FileText, tone: 'sky' },
      { href: '/documents', label: 'Documents', icon: FolderOpen, tone: 'sky' },
    ],
  },
  {
    label: 'People',
    items: [
      { href: '/vendors', label: 'Vendors', icon: Building2, tone: 'teal' },
      { href: '/customers', label: 'Customers', icon: Users, tone: 'teal' },
    ],
  },
  {
    label: 'Money',
    items: [
      { href: '/accounts', label: 'Accounts', icon: Wallet, tone: 'teal' },
      { href: '/payments', label: 'Payments', icon: CreditCard, tone: 'teal' },
    ],
  },
  {
    label: 'More',
    items: [
      { href: '/compliance', label: 'Compliance', icon: ShieldCheck, tone: 'slate' },
      { href: '/settings', label: 'Settings', icon: Settings, tone: 'slate' },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => navItemAllowed(role, item.href)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <aside className="flex h-full w-56 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-[4.25rem] items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient text-white shadow-soft">
          <CheckCircle2 className="h-5 w-5" strokeWidth={2.25} />
        </div>
        <div className="min-w-0">
          <p className="font-display text-base font-bold leading-tight">
            <span className="text-gradient">Sorted</span>
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            Company paperwork, sorted.
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4 scrollbar-thin">
        {visibleGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        'flex items-center gap-2.5 rounded-lg border border-transparent px-3 py-2.5 text-sm font-medium transition-colors',
                        active
                          ? toneActive[item.tone]
                          : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="rounded-xl bg-brand-soft px-3 py-2.5">
          <p className="text-xs font-semibold text-foreground">VNS Labs</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {roleLabel(role)} access · FY 2026-27
          </p>
        </div>
      </div>
    </aside>
  );
}
