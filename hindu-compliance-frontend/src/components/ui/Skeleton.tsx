import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ className, variant = 'rectangular' }: SkeletonProps) {
  const variantClasses = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-neutral-200',
        variantClasses[variant],
        className
      )}
      role="status"
      aria-label="Loading content"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card">
      <Skeleton className="h-48 mb-4" />
      <Skeleton variant="text" className="mb-2" />
      <Skeleton variant="text" className="w-3/4 mb-4" />
      <Skeleton variant="text" className="w-1/2" />
    </div>
  );
}
