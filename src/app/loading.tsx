import { LoadingSpinner } from '@/components/ui';

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center bg-gaming-dark">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-zinc-500">Loading…</p>
      </div>
    </div>
  );
}
