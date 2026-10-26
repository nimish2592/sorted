import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { isAdminEmail } from '@/lib/auth/constants';
import { disconnectGoogleDrive } from '@/lib/google/client';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  await disconnectGoogleDrive();
  return NextResponse.json({ ok: true });
}
