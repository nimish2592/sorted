import { readFileSync } from 'fs';
import { resolve } from 'path';
import { google } from 'googleapis';
import { getGoogleAuth, getDriveRootFolderId } from '../lib/google/client';

function loadEnvLocal() {
  const raw = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}

async function list(parentId: string, depth = 0) {
  const auth = await getGoogleAuth();
  if (!auth) throw new Error('No Google auth');
  const drive = google.drive({ version: 'v3', auth });

  const res = await drive.files.list({
    q: `'${parentId}' in parents and trashed = false`,
    fields: 'files(id,name,mimeType,modifiedTime,webViewLink)',
    orderBy: 'folder,name',
    pageSize: 100,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  const items = [];
  for (const f of res.data.files || []) {
    const pad = '  '.repeat(depth);
    const kind = f.mimeType?.includes('folder') ? 'DIR ' : 'FILE';
    console.log(`${pad}${kind} ${f.name} | ${f.id}`);
    items.push(f);
    if (f.mimeType === 'application/vnd.google-apps.folder' && depth < 3 && f.id) {
      await list(f.id, depth + 1);
    }
  }
  return items;
}

async function main() {
  loadEnvLocal();
  const rootId = getDriveRootFolderId();
  if (!rootId) throw new Error('Missing GOOGLE_DRIVE_ROOT_FOLDER_ID');

  const auth = await getGoogleAuth();
  if (!auth) throw new Error('No Google auth — connect Drive in Settings first');
  const drive = google.drive({ version: 'v3', auth });

  const root = await drive.files.get({
    fileId: rootId,
    fields: 'id,name',
    supportsAllDrives: true,
  });
  console.log('ROOT', root.data.name, root.data.id);
  await list(rootId);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
