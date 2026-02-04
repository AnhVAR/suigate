'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Zap } from 'lucide-react';
import { GoogleLoginButton } from '@/components/auth/google-login-button';
import { parseOAuthCallback, authenticateAdmin } from '@/lib/zklogin-web-auth';
import { setAdminSession } from '@/lib/admin-session';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if this is an OAuth callback
    const hash = window.location.hash;
    if (!hash) return;

    const handleOAuthCallback = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Parse id_token from URL hash
        const parsed = parseOAuthCallback(hash);
        if (!parsed) {
          setError('Invalid OAuth callback');
          return;
        }

        // Authenticate with backend
        const session = await authenticateAdmin(parsed.idToken);

        // Store session token
        setAdminSession(session.token);

        // Clear hash from URL
        window.history.replaceState(null, '', window.location.pathname);

        // Redirect to target page or orders
        const redirect = searchParams.get('redirect') || '/dashboard/orders';
        router.push(redirect);
      } catch (err) {
        console.error('Login failed:', err);
        setError(err instanceof Error ? err.message : 'Login failed');
        setIsLoading(false);
      }
    };

    handleOAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-8 rounded-2xl border border-border/50 bg-card p-8 shadow-xl">
        {/* Logo & Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Zap className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">SuiGate</h1>
          <h2 className="mt-1 text-lg font-medium text-muted-foreground">
            Admin Dashboard
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Sign in to access the admin panel
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Loading or Login Button */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="mt-8">
            <GoogleLoginButton />
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Only authorized admin users can access this portal
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
