'use client';

import { useEffect } from 'react';

export default function SignOutPage() {
  useEffect(() => {
    // Call API route to clear session
    fetch('/api/auth/sign-out', {
      method: 'POST',
    }).then(() => {
      // Redirect to homepage
      window.location.href = '/';
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-neutral-600">Signing out...</p>
      </div>
    </div>
  );
}
