import { promises as fs } from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { ADMIN_EMAIL, isAdminEmail, normalizeEmail } from '@/lib/auth/constants';
import type { AccessRole, AccessUser, PublicAccessUser } from '@/types/access';

const DATA_DIR = path.join(process.cwd(), 'data');
const ACCESS_FILE = path.join(DATA_DIR, 'access-users.json');

type AccessFile = {
  users: AccessUser[];
};

function toPublic(user: AccessUser): PublicAccessUser {
  const { passwordHash: _, ...rest } = user;
  return rest;
}

async function ensureAdminSeed(users: AccessUser[]): Promise<AccessUser[]> {
  const adminPassword =
    process.env.AUTH_ADMIN_PASSWORD?.trim() || 'SortedAdmin!2026';
  const existing = users.find((u) => isAdminEmail(u.email));

  if (existing) {
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

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  return [
    {
      id: 'usr_admin',
      name: 'VNS Labs Admin',
      email: ADMIN_EMAIL,
      role: 'admin',
      passwordHash,
      created_at: new Date().toISOString(),
      created_by: 'system',
    },
    ...users,
  ];
}

async function readFile(): Promise<AccessFile> {
  try {
    const raw = await fs.readFile(ACCESS_FILE, 'utf8');
    const parsed = JSON.parse(raw) as AccessFile;
    const users = await ensureAdminSeed(parsed.users ?? []);
    if (users.length !== (parsed.users?.length ?? 0)) {
      await writeFile({ users });
    }
    return { users };
  } catch {
    const users = await ensureAdminSeed([]);
    const data = { users };
    await writeFile(data);
    return data;
  }
}

async function writeFile(data: AccessFile): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(ACCESS_FILE, JSON.stringify(data, null, 2), 'utf8');
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
