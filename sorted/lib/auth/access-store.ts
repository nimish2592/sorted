import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import bcrypt from 'bcryptjs';
import { ADMIN_EMAIL, isAdminEmail, normalizeEmail } from '@/lib/auth/constants';
import type { AccessRole, AccessUser, PublicAccessUser } from '@/types/access';

type AccessFile = {
  users: AccessUser[];
};

/** In-memory fallback for serverless (Vercel) when disk is not writable. */
let memoryStore: AccessFile | null = null;

const LOCAL_FILE = path.join(process.cwd(), 'data', 'access-users.json');
const TMP_FILE = path.join(os.tmpdir(), 'sorted-access-users.json');

function toPublic(user: AccessUser): PublicAccessUser {
  const { passwordHash: _, ...rest } = user;
  return rest;
}

async function buildAdminUser(): Promise<AccessUser> {
  const adminPassword =
    process.env.AUTH_ADMIN_PASSWORD?.trim() || 'SortedAdmin!2026';
  return {
    id: 'usr_admin',
    name: 'VNS Labs Admin',
    email: ADMIN_EMAIL,
    role: 'admin',
    passwordHash: await bcrypt.hash(adminPassword, 10),
    created_at: new Date().toISOString(),
    created_by: 'system',
  };
}

async function ensureAdminSeed(users: AccessUser[]): Promise<AccessUser[]> {
  const existing = users.find((u) => isAdminEmail(u.email));
  if (existing) {
    // Keep stored hash, but always force admin role/email
    return users.map((u) =>
      isAdminEmail(u.email)
        ? {
            ...u,
            email: ADMIN_EMAIL,
            role: 'admin' as const,
            name: u.name || 'VNS Labs Admin',
          }
        : u
    );
  }
  return [await buildAdminUser(), ...users];
}

async function tryRead(filePath: string): Promise<AccessFile | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as AccessFile;
    return { users: parsed.users ?? [] };
  } catch {
    return null;
  }
}

async function tryWrite(filePath: string, data: AccessFile): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch {
    return false;
  }
}

async function readFile(): Promise<AccessFile> {
  if (memoryStore) {
    memoryStore = { users: await ensureAdminSeed(memoryStore.users) };
    return memoryStore;
  }

  const fromLocal = await tryRead(LOCAL_FILE);
  const fromTmp = fromLocal ? null : await tryRead(TMP_FILE);
  const base = fromLocal || fromTmp || { users: [] };
  const users = await ensureAdminSeed(base.users);
  const data = { users };

  // Persist if we can; otherwise keep in memory (Vercel-safe)
  const wrote =
    (await tryWrite(LOCAL_FILE, data)) || (await tryWrite(TMP_FILE, data));
  if (!wrote) {
    memoryStore = data;
  } else {
    memoryStore = data;
  }
  return data;
}

async function writeFile(data: AccessFile): Promise<void> {
  memoryStore = data;
  const ok =
    (await tryWrite(LOCAL_FILE, data)) || (await tryWrite(TMP_FILE, data));
  if (!ok) {
    // Serverless: memory-only is fine for this request/instance
    memoryStore = data;
  }
}

export async function listAccessUsers(): Promise<PublicAccessUser[]> {
  const { users } = await readFile();
  return users
    .map(toPublic)
    .sort((a, b) => {
      if (a.role === 'admin' && b.role !== 'admin') return -1;
      if (b.role === 'admin' && a.role !== 'admin') return 1;
      return a.name.localeCompare(b.name);
    });
}

export async function findAccessUserByEmail(
  email: string
): Promise<AccessUser | undefined> {
  const { users } = await readFile();
  const normalized = normalizeEmail(email);
  return users.find((u) => normalizeEmail(u.email) === normalized);
}

export async function hasAccess(email: string): Promise<boolean> {
  if (isAdminEmail(email)) return true;
  const user = await findAccessUserByEmail(email);
  return Boolean(user);
}

export async function verifyPassword(
  email: string,
  password: string
): Promise<AccessUser | null> {
  const normalized = normalizeEmail(email);

  // Admin can always sign in with AUTH_ADMIN_PASSWORD even if store is empty
  if (isAdminEmail(normalized)) {
    const expected =
      process.env.AUTH_ADMIN_PASSWORD?.trim() || 'SortedAdmin!2026';
    if (password === expected) {
      const user = await findAccessUserByEmail(normalized);
      if (user) return user;
      return buildAdminUser();
    }
  }

  const user = await findAccessUserByEmail(email);
  if (!user?.passwordHash) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}

export async function addAccessUser(input: {
  name: string;
  email: string;
  role: AccessRole;
  password?: string;
  created_by: string;
}): Promise<PublicAccessUser> {
  const email = normalizeEmail(input.email);
  if (!email || !input.name.trim()) {
    throw new Error('Name and email are required.');
  }
  if (isAdminEmail(email)) {
    throw new Error('Admin access is fixed and cannot be re-added.');
  }

  const data = await readFile();
  if (data.users.some((u) => normalizeEmail(u.email) === email)) {
    throw new Error('That person already has access.');
  }

  const role: AccessRole = input.role === 'admin' ? 'member' : input.role;
  const passwordHash = input.password?.trim()
    ? await bcrypt.hash(input.password.trim(), 10)
    : undefined;

  const user: AccessUser = {
    id: `usr_${Date.now().toString(36)}`,
    name: input.name.trim(),
    email,
    role,
    passwordHash,
    created_at: new Date().toISOString(),
    created_by: input.created_by,
  };

  data.users.push(user);
  await writeFile(data);
  return toPublic(user);
}

export async function removeAccessUser(
  id: string,
  actorEmail: string
): Promise<void> {
  if (!isAdminEmail(actorEmail)) {
    throw new Error('Only the admin can remove access.');
  }

  const data = await readFile();
  const target = data.users.find((u) => u.id === id);
  if (!target) throw new Error('Person not found.');
  if (isAdminEmail(target.email)) {
    throw new Error('Cannot remove the admin account.');
  }

  data.users = data.users.filter((u) => u.id !== id);
  await writeFile(data);
}

export async function setAccessPassword(
  email: string,
  password: string
): Promise<void> {
  const data = await readFile();
  const normalized = normalizeEmail(email);
  const idx = data.users.findIndex((u) => normalizeEmail(u.email) === normalized);
  if (idx < 0) throw new Error('Person not found.');
  data.users[idx] = {
    ...data.users[idx],
    passwordHash: await bcrypt.hash(password, 10),
  };
  await writeFile(data);
}
