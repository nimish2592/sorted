import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { isAdminEmail } from '@/lib/auth/constants';
import { getDriveConnectUrl, oauthClientConfigured } from '@/lib/google/client';
import { randomBytes } from 'crypto';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  if (!oauthClientConfigured()) {
    return NextResponse.json(
      { error: 'GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not set.' },
      { status: 400 }
    );
  }

  const state = randomBytes(16).toString('hex');
  const url = getDriveConnectUrl(state);
  if (!url) {
    return NextResponse.json({ error: 'Could not build OAuth URL' }, { status: 500 });
  }

  const response = NextResponse.redirect(url);
  response.cookies.set('sorted_google_oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 10,
  });
  return response;
}
