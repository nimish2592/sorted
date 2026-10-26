import { google } from 'googleapis';
import { getDriveRootFolderId, getGoogleAuth } from '@/lib/google/client';

export type DriveItem = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
  webContentLink?: string;
  parents?: string[];
  isFolder: boolean;
};

export type DriveDocument = {
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

const FOLDER_MIME = 'application/vnd.google-apps.folder';
const SKIP_NAMES = new Set(['.ds_store', 'thumbs.db']);

async function getDrive() {
  const auth = await getGoogleAuth();
  if (!auth) throw new Error('Google Drive is not connected.');
  return google.drive({ version: 'v3', auth });
}

function downloadUrlFor(file: {
  id: string;
  mimeType?: string;
  webContentLink?: string | null;
}): string {
  if (file.webContentLink) return file.webContentLink;
  const mime = file.mimeType || '';
  // Google Docs / Sheets / Slides — export as PDF
  if (mime === 'application/vnd.google-apps.document') {
    return `https://docs.google.com/document/d/${file.id}/export?format=pdf`;
  }
  if (mime === 'application/vnd.google-apps.spreadsheet') {
    return `https://docs.google.com/spreadsheets/d/${file.id}/export?format=xlsx`;
  }
  if (mime === 'application/vnd.google-apps.presentation') {
    return `https://docs.google.com/presentation/d/${file.id}/export?format=pdf`;
  }
  return `https://drive.google.com/uc?export=download&id=${file.id}`;
}

function viewUrlFor(file: {
  id: string;
  webViewLink?: string | null;
}): string {
  return (
    file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`
  );
}

export async function listChildren(parentId: string): Promise<DriveItem[]> {
  const drive = await getDrive();
  const res = await drive.files.list({
    q: `'${parentId}' in parents and trashed = false`,
    fields:
      'files(id,name,mimeType,modifiedTime,webViewLink,webContentLink,parents)',
    orderBy: 'folder,name',
    pageSize: 200,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  return (res.data.files || []).map((f) => ({
    id: f.id || '',
    name: f.name || '',
    mimeType: f.mimeType || '',
    modifiedTime: f.modifiedTime || undefined,
    webViewLink: f.webViewLink || undefined,
    webContentLink: f.webContentLink || undefined,
    parents: f.parents || undefined,
    isFolder: f.mimeType === FOLDER_MIME,
  }));
}

/** Recursively collect every file under a folder. */
export async function listFilesRecursive(
  parentId: string,
  options?: { maxDepth?: number; folderPath?: string }
): Promise<(DriveItem & { path: string; folder: string })[]> {
  const maxDepth = options?.maxDepth ?? 8;
  const results: (DriveItem & { path: string; folder: string })[] = [];

  async function walk(id: string, pathParts: string[], depth: number) {
    if (depth > maxDepth) return;
    const children = await listChildren(id);
    for (const child of children) {
      if (SKIP_NAMES.has(child.name.toLowerCase())) continue;
      if (child.isFolder) {
        await walk(child.id, [...pathParts, child.name], depth + 1);
      } else if (child.mimeType !== 'application/vnd.google-apps.spreadsheet' || pathParts.length > 0) {
        // Include all files; spreadsheet at root is the Sorted DB sheet — still list it
        results.push({
          ...child,
          path: [...pathParts, child.name].join(' / '),
          folder: pathParts[0] || 'Root',
        });
      }
    }
  }

  await walk(parentId, options?.folderPath ? [options.folderPath] : [], 0);
  return results;
}

/** Every file under the Sorted Drive root (all folders). */
export async function listCompanyDocumentsFromDrive(): Promise<DriveDocument[]> {
  const rootId = getDriveRootFolderId();
  if (!rootId) throw new Error('GOOGLE_DRIVE_ROOT_FOLDER_ID is not set.');

  const files = await listFilesRecursive(rootId, { maxDepth: 8 });

  return files
    .map((f) => ({
      document_id: f.id,
      name: f.name,
      folder: f.folder,
      path: f.path,
      mimeType: f.mimeType,
      drive_file_id: f.id,
      webViewLink: viewUrlFor(f),
      downloadLink: downloadUrlFor(f),
      updated_at: f.modifiedTime || new Date().toISOString(),
    }))
    .sort((a, b) => {
      const folderCmp = a.folder.localeCompare(b.folder);
      if (folderCmp !== 0) return folderCmp;
      return a.path.localeCompare(b.path);
    });
}

export async function getDriveOverview() {
  const rootId = getDriveRootFolderId();
  if (!rootId) throw new Error('GOOGLE_DRIVE_ROOT_FOLDER_ID is not set.');
  const drive = await getDrive();
  const root = await drive.files.get({
    fileId: rootId,
    fields: 'id,name',
    supportsAllDrives: true,
  });
  const children = await listChildren(rootId);
  return {
    root: { id: root.data.id || rootId, name: root.data.name || 'Drive' },
    children,
  };
}
