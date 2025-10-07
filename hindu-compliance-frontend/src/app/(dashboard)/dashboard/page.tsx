'use client';

import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-6">
        Welcome, {user?.name || user?.email}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder Dashboard Cards */}
        <div className="card">
          <h2 className="text-xl font-heading font-semibold text-neutral-900 mb-2">
            Compliance Status
          </h2>
          <p className="text-neutral-600">
            View and manage your temple's compliance certifications.
          </p>
          <p className="text-sm text-neutral-500 mt-4">Coming soon in Phase 2</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-heading font-semibold text-neutral-900 mb-2">
            Submit Application
          </h2>
          <p className="text-neutral-600">
            Start a new compliance certification application.
          </p>
          <p className="text-sm text-neutral-500 mt-4">Coming soon in Phase 2</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-heading font-semibold text-neutral-900 mb-2">
            Track Progress
          </h2>
          <p className="text-neutral-600">
            Monitor the status of your pending applications.
          </p>
          <p className="text-sm text-neutral-500 mt-4">Coming soon in Phase 2</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-heading font-semibold text-neutral-900 mb-2">
            Payment History
          </h2>
          <p className="text-neutral-600">
            View payment records and download receipts.
          </p>
          <p className="text-sm text-neutral-500 mt-4">Coming soon in Phase 2</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-heading font-semibold text-neutral-900 mb-2">
            Notifications
          </h2>
          <p className="text-neutral-600">
            Important updates and reminders for your temple.
          </p>
          <p className="text-sm text-neutral-500 mt-4">Coming soon in Phase 2</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-heading font-semibold text-neutral-900 mb-2">
            Profile Settings
          </h2>
          <p className="text-neutral-600">
            Update your temple information and preferences.
          </p>
          <p className="text-sm text-neutral-500 mt-4">Coming soon in Phase 2</p>
        </div>
      </div>
    </div>
  );
}
