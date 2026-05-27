import { Skeleton } from "@/components/ui/Skeleton";

export function ContentPageSkeleton({
  showHeader = true,
  rows = 2,
  cards = 8,
}: {
  showHeader?: boolean;
  rows?: number;
  cards?: number;
}) {
  const totalCards = Math.max(rows * 4, cards);

  return (
    <div className="px-2.5 pb-2.5 pt-3">
      {showHeader ? <Skeleton className="mb-4 h-12 w-64 rounded-xl" /> : null}
      <div className="mb-3 flex gap-3">
        <Skeleton className="h-11 flex-1 rounded-xl bg-white/80" />
        <Skeleton className="h-11 w-36 rounded-xl bg-white/80" />
        <Skeleton className="h-11 w-28 rounded-xl bg-white/80" />
      </div>
      <Skeleton className="mb-4 h-8 w-80 rounded-xl bg-white/80" />
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: totalCards }).map((_, index) => (
          <Skeleton key={index} className="h-[292px] rounded-2xl border border-slate-200 bg-white/85" />
        ))}
      </div>
      <Skeleton className="mt-4 h-14 w-full rounded-2xl border border-slate-200 bg-white/85" />
    </div>
  );
}
