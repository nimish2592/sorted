import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import {
  addAccessUser,
  listAccessUsers,
  removeAccessUser,
} from '@/lib/auth/access-store';
import { isAdminEmail } from '@/lib/auth/constants';
import type { AccessRole } from '@/types/access';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await listAccessUsers();
  return NextResponse.json({
    users,
    isAdmin: isAdminEmail(session.user.email),
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const body = (await request.json()) as {
    name?: string;
    email?: string;
    role?: AccessRole;
    password?: string;
  };

  try {
    const user = await addAccessUser({
      name: body.name ?? '',
      email: body.email ?? '',
      role: body.role ?? 'member',
      password: body.password,
      created_by: session.user.email,
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to add access' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    await removeAccessUser(id, session.user.email);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to remove access' },
      { status: 400 }
    );
  }
}
