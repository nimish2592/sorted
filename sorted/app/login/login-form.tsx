'use client';

import { FormEvent, Suspense, useMemo, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const errorMessages: Record<string, string> = {
  AccessDenied:
    'That Google account does not have access to Sorted yet. Ask the admin to add you in Settings.',
  GoogleNotConfigured:
    'Google Sign-In is not configured. Use email and password for now.',
  CredentialsSignin: 'Invalid email or password.',
  OAuthAccountNotLinked: 'Use the same sign-in method you used before.',
  Default: 'Could not sign in. Try again.',
};

function LoginFormInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<'google' | 'credentials' | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const urlError = useMemo(() => {
    const code = params.get('error');
    if (!code) return null;
    return errorMessages[code] || errorMessages.Default;
  }, [params]);

  async function onCredentials(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setLoading('credentials');
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    setLoading(null);
    if (result?.error) {
      setFormError(errorMessages.CredentialsSignin);
      return;
    }
    router.replace('/');
    router.refresh();
  }

  async function onGoogle() {
    setFormError(null);
    setLoading('google');
    await signIn('google', { callbackUrl: '/' });
  }

  return (
    <Card className="shadow-card">
      <CardContent className="space-y-5 p-6">
        {(urlError || formError) && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
            {formError || urlError}
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={loading !== null}
          onClick={onGoogle}
        >
          {loading === 'google' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <GoogleIcon className="mr-2 h-4 w-4" />
          )}
          Continue with Google
        </Button>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>

        <form onSubmit={onCredentials} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            variant="brand"
            className="w-full"
            disabled={loading !== null}
          >
            {loading === 'credentials' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Sign in with email
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Access is invite-only.
        </p>
      </CardContent>
    </Card>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-.9 2.4-1.9 3.1l3.1 2.4c1.8-1.7 2.8-4.1 2.8-7 0-.7-.1-1.3-.2-1.9H12z"
      />
      <path
        fill="#34A853"
        d="M6.6 14.3l-.9.7-2.6 2c1.7 3.3 5.1 5.5 9 5.5 2.7 0 5-.9 6.6-2.4l-3.1-2.4c-.9.6-2 .9-3.5.9-2.7 0-5-1.8-5.8-4.3z"
      />
      <path
        fill="#4A90E2"
        d="M3.1 7.1C2.4 8.5 2 10 2 11.8c0 1.8.4 3.3 1.1 4.7l3.5-2.7c-.3-.7-.4-1.4-.4-2 0-.7.1-1.4.4-2L3.1 7.1z"
      />
      <path
        fill="#FBBC05"
        d="M12 5.3c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 2.3 14.7 1.5 12 1.5 8.1 1.5 4.7 3.7 3.1 7.1l3.5 2.7C7 7.2 9.3 5.3 12 5.3z"
      />
    </svg>
  );
}

export function LoginForm() {
  return (
    <Suspense
      fallback={
        <Card className="shadow-card">
          <CardContent className="flex items-center justify-center p-10 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading…
          </CardContent>
        </Card>
      }
    >
      <LoginFormInner />
    </Suspense>
  );
}
