export function SkeletonCard() {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-neutral-800 rounded-lg overflow-hidden shadow-sm animate-pulse">
      {/* Image Skeleton */}
      <div className="relative h-56 bg-neutral-200 dark:bg-neutral-700" />

      {/* Content Skeleton */}
      <div className="p-6 flex flex-col flex-1">
        {/* Title */}
        <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded mb-2 w-3/4" />
        <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded mb-4 w-1/2" />
        
        {/* Excerpt */}
        <div className="space-y-2 mb-4 flex-1">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-full" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-5/6" />
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between mt-auto">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-24" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
