import { CheckCircle2 } from 'lucide-react';
import { LoginForm } from '@/app/login/login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in-up">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
            <CheckCircle2 className="h-6 w-6" strokeWidth={2.25} />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            <span className="text-gradient">Sorted</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Company paperwork, sorted.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
