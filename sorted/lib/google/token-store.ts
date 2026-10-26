import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const TOKEN_FILE = path.join(DATA_DIR, 'google-oauth.json');

export type StoredGoogleOAuth = {
  email: string;
  access_token?: string;
  refresh_token: string;
  expiry_date?: number;
  scope?: string;
  token_type?: string;
  updated_at: string;
};

export async function readGoogleOAuth(): Promise<StoredGoogleOAuth | null> {
  try {
    const raw = await fs.readFile(TOKEN_FILE, 'utf8');
    return JSON.parse(raw) as StoredGoogleOAuth;
  } catch {
    return null;
  }
}

export async function writeGoogleOAuth(
  data: Omit<StoredGoogleOAuth, 'updated_at'> & { updated_at?: string }
): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const payload: StoredGoogleOAuth = {
    ...data,
    updated_at: data.updated_at || new Date().toISOString(),
  };
  await fs.writeFile(TOKEN_FILE, JSON.stringify(payload, null, 2), 'utf8');
}

export async function clearGoogleOAuth(): Promise<void> {
  try {
    await fs.unlink(TOKEN_FILE);
  } catch {
    // ignore
  }
}
