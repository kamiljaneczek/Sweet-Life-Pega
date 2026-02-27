/* eslint-disable react/no-array-index-key */
import Skeleton from '../../design-system/ui/skeleton';

export function HomeFeaturedProductsSkeleton() {
  return (
    <div className='space-y-8'>
      <Skeleton className='mx-auto h-8 w-64' />
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='space-y-4'>
            <Skeleton className='h-40 w-full rounded-xl' />
            <Skeleton className='h-4 w-3/4 mx-auto' />
            <Skeleton className='h-4 w-1/2 mx-auto' />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductsPageSkeleton() {
  return (
    <div className='flex-grow py-12 px-6 dark:bg-gray-900'>
      <div className='container mx-auto'>
        <Skeleton className='h-9 w-72 mb-8' />
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className='rounded-xl bg-white shadow-lg dark:bg-gray-600 p-6 space-y-4'>
              <Skeleton className='h-32 w-32 mx-auto rounded-lg' />
              <Skeleton className='h-5 w-3/4 mx-auto' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-9 w-28 mx-auto' />
              <Skeleton className='h-6 w-16 mx-auto' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SupportIncidentSkeleton() {
  return (
    <div className='w-full max-w-3xl space-y-6'>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className='space-y-2'>
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-10 w-full' />
        </div>
      ))}
      <Skeleton className='h-10 w-32' />
    </div>
  );
}
