
'use client';

import AppHeader from '@/components/blocksmith-ai/AppHeader';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const PremiumPageClient = dynamic(() => import('@/components/blocksmith-ai/PremiumPageClient'), {
  ssr: false,
  loading: () => <PremiumPageSkeleton />,
});

const PremiumPageSkeleton = () => (
  <div className="container mx-auto px-4 py-8 pb-24">
    <div className="text-center mb-8">
      <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
      <Skeleton className="h-6 w-1/2 mx-auto" />
    </div>
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
    <div className="mt-12">
      <Skeleton className="h-64 w-full" />
    </div>
  </div>
);

export default function PremiumPage() {
  return (
    <>
      <AppHeader />
      <PremiumPageClient />
    </>
  );
}
