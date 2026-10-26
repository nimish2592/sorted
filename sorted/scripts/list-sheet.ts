import { readFileSync } from 'fs';
import { resolve } from 'path';
import { google } from 'googleapis';
import { getGoogleAuth, getSpreadsheetId } from '../lib/google/client';

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
  const spreadsheetId =
    getSpreadsheetId() || '1Q3DtIpCOH0pt-EQlk3__ET9CFQaZC9OKqwYrlrM4_OQ';
  const auth = await getGoogleAuth();
  if (!auth) throw new Error('No Google auth');
  const sheets = google.sheets({ version: 'v4', auth });
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  console.log('TITLE', meta.data.properties?.title);
  console.log(
    'TABS',
    meta.data.sheets?.map((s) => s.properties?.title).join(', ')
  );
  for (const s of meta.data.sheets || []) {
    const title = s.properties?.title!;
    const values = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${title}'!A1:Z30`,
    });
    console.log('\n===', title, '===');
    console.log(
      (values.data.values || []).map((r) => r.join(' | ')).join('\n') ||
        '(empty)'
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
