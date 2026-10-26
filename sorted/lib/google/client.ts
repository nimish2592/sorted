import { google } from 'googleapis';
import {
  clearGoogleOAuth,
  readGoogleOAuth,
  writeGoogleOAuth,
} from '@/lib/google/token-store';

const DRIVE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/spreadsheets',
];

export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const redirectUri =
    process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim() ||
    `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/google/callback`;

  if (!clientId || !clientSecret) return null;

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getDriveConnectUrl(state: string): string | null {
  const client = getOAuth2Client();
  if (!client) return null;
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: DRIVE_SCOPES,
    state,
  });
}

export async function exchangeCodeForTokens(code: string, email: string) {
  const client = getOAuth2Client();
  if (!client) throw new Error('Google OAuth is not configured.');

  const { tokens } = await client.getToken(code);
  if (!tokens.refresh_token) {
    // May happen if user already consented — keep existing refresh token if present
    const existing = await readGoogleOAuth();
    if (!existing?.refresh_token) {
      throw new Error(
        'No refresh token returned. Revoke Sorted access in Google Account → Security → Third-party access, then connect again.'
      );
    }
    await writeGoogleOAuth({
      email,
      access_token: tokens.access_token || existing.access_token,
      refresh_token: existing.refresh_token,
      expiry_date: tokens.expiry_date || existing.expiry_date,
      scope: tokens.scope || existing.scope,
      token_type: tokens.token_type || existing.token_type,
    });
    return;
  }

  await writeGoogleOAuth({
    email,
    access_token: tokens.access_token || undefined,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date || undefined,
    scope: tokens.scope,
    token_type: tokens.token_type || undefined,
  });
}

/**
 * Auth used by Drive/Sheets APIs — OAuth refresh token (preferred) or service account.
 */
export async function getGoogleAuth() {
  const stored = await readGoogleOAuth();
  if (stored?.refresh_token) {
    const client = getOAuth2Client();
    if (!client) return null;
    client.setCredentials({
      access_token: stored.access_token,
      refresh_token: stored.refresh_token,
      expiry_date: stored.expiry_date,
      token_type: stored.token_type,
      scope: stored.scope,
    });
    client.on('tokens', async (tokens) => {
      const current = await readGoogleOAuth();
      if (!current) return;
      await writeGoogleOAuth({
        ...current,
        access_token: tokens.access_token || current.access_token,
        refresh_token: tokens.refresh_token || current.refresh_token,
        expiry_date: tokens.expiry_date || current.expiry_date,
      });
    });
    return client;
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
    /\\n/g,
    '\n'
  );
  if (!email || !privateKey) return null;

  return new google.auth.JWT({
    email,
    key: privateKey,
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  });
}

export function getDriveRootFolderId(): string | null {
  return process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID?.trim() || null;
}

export function getSpreadsheetId(): string | null {
  return process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim() || null;
}

export function oauthClientConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim()
  );
}

export async function disconnectGoogleDrive(): Promise<void> {
  await clearGoogleOAuth();
}

export async function getGoogleBackendStatus(): Promise<{
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
}> {
  const oauthConfigured = oauthClientConfigured();
  const stored = await readGoogleOAuth();
  const serviceAccountEmail =
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() || null;
  const driveRootFolderId = getDriveRootFolderId();
  const spreadsheetId = getSpreadsheetId();

  const auth = await getGoogleAuth();
  const mode: 'oauth' | 'service_account' | 'none' = stored?.refresh_token
    ? 'oauth'
    : serviceAccountEmail
      ? 'service_account'
      : 'none';

  if (!auth) {
    return {
      configured: oauthConfigured || Boolean(serviceAccountEmail),
      connected: false,
      mode,
      connectedEmail: stored?.email || null,
      serviceAccountEmail,
      driveRootFolderId,
      spreadsheetId,
      error: oauthConfigured
        ? 'Google OAuth is configured. Click Connect Google Drive in Settings.'
        : 'Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, then connect Drive.',
    };
  }

  try {
    const drive = google.drive({ version: 'v3', auth });
    let driveRootName: string | null = null;
    let children: { id: string; name: string; mimeType: string }[] = [];

    if (driveRootFolderId) {
      const folder = await drive.files.get({
        fileId: driveRootFolderId,
        fields: 'id,name',
        supportsAllDrives: true,
      });
      driveRootName = folder.data.name ?? null;

      const listed = await drive.files.list({
        q: `'${driveRootFolderId}' in parents and trashed = false`,
        fields: 'files(id,name,mimeType)',
        orderBy: 'name',
        pageSize: 20,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });
      children = (listed.data.files || []).map((f) => ({
        id: f.id || '',
        name: f.name || '',
        mimeType: f.mimeType || '',
      }));
    }

    return {
      configured: true,
      connected: true,
      mode,
      connectedEmail: stored?.email || serviceAccountEmail,
      serviceAccountEmail,
      driveRootFolderId,
      spreadsheetId,
      driveRootName,
      children,
    };
  } catch (err) {
    return {
      configured: true,
      connected: false,
      mode,
      connectedEmail: stored?.email || null,
      serviceAccountEmail,
      driveRootFolderId,
      spreadsheetId,
      error: err instanceof Error ? err.message : 'Failed to reach Google APIs',
    };
  }
}
