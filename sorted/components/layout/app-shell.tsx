'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 animate-fade-in-up shadow-card">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main
          className={cn(
            'relative flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin',
            'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-40 before:bg-[radial-gradient(600px_160px_at_20%_0%,rgba(14,165,233,0.06),transparent)]'
          )}
        >
          <div className="relative mx-auto w-full max-w-7xl p-4 sm:p-6 space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
