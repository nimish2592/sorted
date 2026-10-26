import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { isAdminEmail } from '@/lib/auth/constants';
import { exchangeCodeForTokens } from '@/lib/google/client';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    'http://localhost:3000';

  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return NextResponse.redirect(`${appUrl}/login?error=AccessDenied`);
  }

  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const oauthError = request.nextUrl.searchParams.get('error');
  const expectedState = request.cookies.get('sorted_google_oauth_state')?.value;

  if (oauthError) {
    return NextResponse.redirect(
      `${appUrl}/settings?google=error&message=${encodeURIComponent(oauthError)}`
    );
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(
      `${appUrl}/settings?google=error&message=${encodeURIComponent('Invalid OAuth state')}`
    );
  }

  try {
    await exchangeCodeForTokens(code, session.user.email);
    const response = NextResponse.redirect(`${appUrl}/settings?google=connected`);
    response.cookies.set('sorted_google_oauth_state', '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
    });
    return response;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to connect Google Drive';
    return NextResponse.redirect(
      `${appUrl}/settings?google=error&message=${encodeURIComponent(message)}`
    );
  }
}
