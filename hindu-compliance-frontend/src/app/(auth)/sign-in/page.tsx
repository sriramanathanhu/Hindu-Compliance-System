'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  useEffect(() => {
    // Redirect to API route that handles OAuth flow
    const params = new URLSearchParams();
    if (redirect) {
      params.set('redirect', redirect);
    }
    window.location.href = `/api/auth/sign-in?${params.toString()}`;
  }, [redirect]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-neutral-600">Redirecting to sign in...</p>
      </div>
    </div>
  );
}
