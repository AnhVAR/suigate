'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            SuiGate
          </h1>
          <h2 className="text-xl font-semibold text-gray-700">
            Admin Dashboard
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access the admin panel
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="mt-8">
            <GoogleLoginButton />
          </div>
        )}

        <p className="mt-4 text-xs text-center text-gray-500">
          Only authorized admin users can access this portal
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
