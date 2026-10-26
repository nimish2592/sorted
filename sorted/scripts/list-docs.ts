import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  getDriveOverview,
  listCompanyDocumentsFromDrive,
} from '../lib/google/drive';

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

async function main() {
  loadEnvLocal();
  const overview = await getDriveOverview();
  console.log('Root:', overview.root.name);
  console.log(
    'Top folders:',
    overview.children
      .filter((c) => c.isFolder)
      .map((c) => c.name)
      .join(', ')
  );
  const docs = await listCompanyDocumentsFromDrive();
  console.log('Company docs:', docs.length);
  for (const d of docs) console.log('-', d.folder, '|', d.name, '|', d.downloadLink);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
