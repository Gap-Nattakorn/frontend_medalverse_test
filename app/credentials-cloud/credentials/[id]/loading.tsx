import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-28 rounded-xl bg-white/80" />
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <Skeleton className="h-[220px] rounded-none" />
        <div className="space-y-4 p-5">
          <Skeleton className="h-10 w-2/3 rounded-lg" />
          <Skeleton className="h-5 w-1/3 rounded-lg" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 rounded-xl bg-slate-100" />
            <Skeleton className="h-16 rounded-xl bg-slate-100" />
            <Skeleton className="h-16 rounded-xl bg-slate-100" />
            <Skeleton className="h-16 rounded-xl bg-slate-100" />
          </div>
          <Skeleton className="h-40 rounded-xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
