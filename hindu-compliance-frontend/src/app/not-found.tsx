import Link from 'next/link';
import { generateMetadata } from '@/lib/utils/seo';

export const metadata = generateMetadata({
  title: '404 - Page Not Found',
  description: 'The page you are looking for does not exist',
  noindex: true,
});

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-primary-600 mb-6">
          <svg
            className="w-24 h-24 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-6xl font-heading font-bold text-neutral-900 mb-4">
          404
        </h1>

        <h2 className="text-2xl font-heading font-semibold text-neutral-800 mb-4">
          Page Not Found
        </h2>

        <p className="text-neutral-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary">
            Go to Homepage
          </Link>
          <Link href="/dashboard" className="btn-outline">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
