'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Download,
  ExternalLink,
  FolderOpen,
  Loader2,
  RefreshCw,
  Search,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { EmptyState } from '@/components/records/empty-state';
import { formatDate } from '@/lib/utils';

type DriveDoc = {
  document_id: string;
  name: string;
  folder: string;
  path: string;
  mimeType: string;
  drive_file_id: string;
  webViewLink: string;
  downloadLink: string;
  updated_at: string;
};

function typeLabel(mimeType: string): string {
  if (mimeType.includes('pdf')) return 'PDF';
  if (mimeType.includes('image')) return 'Image';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'Sheet';
  if (mimeType.includes('document') || mimeType.includes('word')) return 'Doc';
  if (mimeType.includes('presentation')) return 'Slides';
  return 'File';
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DriveDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('all');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/drive/documents');
      const data = (await res.json()) as {
        documents?: DriveDoc[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || 'Failed to load documents');
      setDocuments(data.documents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const folders = useMemo(
    () =>
      Array.from(new Set(documents.map((d) => d.folder))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [documents]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return documents.filter((doc) => {
      const matchesFolder = folder === 'all' || doc.folder === folder;
      const matchesSearch =
        !q ||
        doc.name.toLowerCase().includes(q) ||
        doc.path.toLowerCase().includes(q) ||
        doc.folder.toLowerCase().includes(q);
      return matchesFolder && matchesSearch;
    });
  }, [documents, search, folder]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Documents"
        description="Every file in your Sorted Google Drive, with open and download links."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => void load()}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-1.5 h-4 w-4" />
            )}
            Refresh
          </Button>
        }
      />

      {!loading && documents.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          {filtered.length} of {documents.length} files from Google Drive
        </p>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
          {error} — connect Drive in Settings if needed.
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or folder path…"
            className="pl-9"
          />
        </div>
        <Select value={folder} onValueChange={setFolder}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Folder" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All folders</SelectItem>
            {folders.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading from Google Drive…
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No documents found"
          description="Try another search, or connect Drive in Settings."
        />
      ) : (
        <div className="surface-panel overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Folder</TableHead>
                <TableHead className="hidden lg:table-cell">Path</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead className="hidden sm:table-cell">Updated</TableHead>
                <TableHead>Open</TableHead>
                <TableHead>Download link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((doc) => (
                <TableRow key={doc.document_id}>
                  <TableCell className="max-w-[200px] font-medium sm:max-w-xs">
                    <span className="line-clamp-2 break-words">{doc.name}</span>
                    <p className="mt-1 text-xs text-muted-foreground md:hidden">
                      {doc.folder}
                    </p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {doc.folder}
                  </TableCell>
                  <TableCell className="hidden max-w-sm lg:table-cell">
                    <span className="line-clamp-2 text-xs text-muted-foreground">
                      {doc.path}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {typeLabel(doc.mimeType)}
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap sm:table-cell text-muted-foreground">
                    {formatDate(doc.updated_at)}
                  </TableCell>
                  <TableCell>
                    <a
                      href={doc.webViewLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      Open
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </TableCell>
                  <TableCell className="max-w-[280px]">
                    <a
                      href={doc.downloadLink}
                      target="_blank"
                      rel="noreferrer"
                      download={doc.name}
                      className="inline-flex max-w-full items-center gap-1 text-sm text-primary hover:underline"
                      title={doc.downloadLink}
                    >
                      <Download className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{doc.downloadLink}</span>
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
