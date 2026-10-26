'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Plus, Shield, Trash2, Cloud, FolderOpen } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Badge } from '@/components/ui/badge';
import { ADMIN_EMAIL } from '@/lib/auth/constants';
import { formatDate } from '@/lib/utils';
import type { AccessRole, PublicAccessUser } from '@/types/access';

type GoogleStatus = {
  configured: boolean;
  connected: boolean;
  mode: 'oauth' | 'service_account' | 'none';
  connectedEmail: string | null;
  serviceAccountEmail: string | null;
  driveRootFolderId: string | null;
  spreadsheetId: string | null;
  driveRootName?: string | null;
  children?: { id: string; name: string; mimeType: string }[];
  error?: string;
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const isAdmin = session?.user?.role === 'admin';

  const [users, setUsers] = useState<PublicAccessUser[]>([]);
  const [google, setGoogle] = useState<GoogleStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AccessRole>('member');
  const [password, setPassword] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const accessRes = await fetch('/api/access');
      if (!accessRes.ok) throw new Error('Could not load access list');
      const accessData = (await accessRes.json()) as { users: PublicAccessUser[] };
      setUsers(accessData.users);

      if (isAdmin) {
        const googleRes = await fetch('/api/google/status');
        if (googleRes.ok) {
          setGoogle((await googleRes.json()) as GoogleStatus);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const googleParam = searchParams.get('google');
    if (googleParam === 'connected') {
      setNotice('Google Drive connected.');
      void load();
    } else if (googleParam === 'error') {
      setError(
        searchParams.get('message') || 'Could not connect Google Drive.'
      );
    }
  }, [searchParams, load]);

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    if (!isAdmin) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          role,
          password: password || undefined,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || 'Failed to add person');
      setName('');
      setEmail('');
      setPassword('');
      setRole('member');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add person');
    } finally {
      setSaving(false);
    }
  }

  async function onRemove(id: string) {
    if (!isAdmin) return;
    if (!confirm('Remove this person’s access?')) return;
    setError(null);
    const res = await fetch(`/api/access?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(data.error || 'Failed to remove');
      return;
    }
    await load();
  }

  async function onDisconnect() {
    if (!isAdmin) return;
    setDisconnecting(true);
    setError(null);
    try {
      const res = await fetch('/api/google/disconnect', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to disconnect');
      setNotice('Google Drive disconnected.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Settings"
        description="People with access, and the Google backend Sorted uses for Drive & Sheets."
      />

      {notice ? (
        <div className="rounded-xl border border-success/20 bg-success/5 px-3 py-2.5 text-sm text-success">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {isAdmin ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <Cloud className="h-4 w-4 text-primary" />
              Google Drive
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {google ? (
              <>
                <StatusLine
                  label="Connection"
                  value={
                    google.connected
                      ? google.mode === 'oauth'
                        ? 'Connected (OAuth)'
                        : 'Connected (service account)'
                      : google.configured
                        ? 'Ready to connect'
                        : 'Not configured'
                  }
                  ok={google.connected}
                />
                <StatusLine
                  label="Connected as"
                  value={google.connectedEmail || '—'}
                />
                <StatusLine
                  label="Drive root"
                  value={
                    google.driveRootName
                      ? google.driveRootName
                      : google.driveRootFolderId || '—'
                  }
                />
                <StatusLine
                  label="Spreadsheet"
                  value={google.spreadsheetId || 'Not set yet'}
                />

                {google.children && google.children.length > 0 ? (
                  <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <FolderOpen className="h-3.5 w-3.5" />
                      Root contents
                    </p>
                    <ul className="space-y-1">
                      {google.children.map((child) => (
                        <li key={child.id} className="text-sm">
                          {child.mimeType.includes('folder') ? '📁' : '📄'}{' '}
                          {child.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {google.error ? (
                  <p className="text-xs text-muted-foreground">{google.error}</p>
                ) : null}

                <div className="flex flex-wrap gap-2 pt-1">
                  {!google.connected ? (
                    <Button variant="brand" asChild>
                      <a href="/api/google/connect">Connect Google Drive</a>
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" asChild>
                        <a href="/api/google/connect">Reconnect</a>
                      </Button>
                      <Button
                        variant="ghost"
                        disabled={disconnecting}
                        onClick={onDisconnect}
                      >
                        {disconnecting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Disconnect
                      </Button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Loading Google status…</p>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <Shield className="h-4 w-4 text-primary" />
            People with access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : (
            <div className="surface-panel overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Added</TableHead>
                    {isAdmin ? <TableHead className="w-[80px]" /> : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            user.role === 'admin'
                              ? 'border-primary/20 bg-primary/10 text-primary'
                              : 'capitalize'
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(user.created_at)}
                      </TableCell>
                      {isAdmin ? (
                        <TableCell>
                          {user.email === ADMIN_EMAIL ? (
                            <span className="text-xs text-muted-foreground">Fixed</span>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Remove ${user.name}`}
                              onClick={() => onRemove(user.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {isAdmin ? (
            <form
              onSubmit={onAdd}
              className="grid gap-3 rounded-2xl border border-border/80 bg-muted/20 p-4 sm:grid-cols-2"
            >
              <div className="space-y-2 sm:col-span-2">
                <p className="text-sm font-medium">Give someone access</p>
                <p className="text-xs text-muted-foreground">
                  They can sign in with Google (same email) or email + password if you set one.
                  Admin is always {ADMIN_EMAIL}.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="access-name">Name</Label>
                <Input
                  id="access-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nimish Khandelwal"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="access-email">Email</Label>
                <Input
                  id="access-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nimish@vnslabs.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={role}
                  onValueChange={(v) => setRole(v as AccessRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="ca">CA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="access-password">Password (optional)</Label>
                <Input
                  id="access-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank for Google-only"
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" variant="brand" disabled={saving}>
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Add person
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              Only the admin can add or remove people.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusLine({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          ok === undefined
            ? 'font-medium'
            : ok
              ? 'font-medium text-success'
              : 'font-medium text-warning'
        }
      >
        {value}
      </span>
    </div>
  );
}
