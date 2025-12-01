export function ArticleListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 animate-pulse"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-full"></div>
            </div>
            <div className="h-6 w-20 bg-neutral-200 dark:bg-neutral-700 rounded-full ml-2"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-5 w-16 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
            <div className="h-5 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 bg-neutral-200 dark:bg-neutral-700 rounded-lg"></div>
              <div className="h-4 w-12 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
            </div>
            <div className="h-8 w-16 bg-neutral-200 dark:bg-neutral-700 rounded mb-1"></div>
            <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
          </div>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 animate-pulse">
          <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 animate-pulse">
          <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
            <div className="space-y-6">
              <div>
                <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
                <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
              </div>
              <div>
                <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
                <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
              </div>
              <div>
                <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
                <div className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6"
            >
              <div className="h-5 w-24 bg-neutral-200 dark:bg-neutral-700 rounded mb-4"></div>
              <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-4 border-neutral-200 dark:border-neutral-700 border-t-primary-600 rounded-full animate-spin`}
      ></div>
    </div>
  );
}
