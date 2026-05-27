import { ComponentProps } from "react";

type SkeletonProps = ComponentProps<"div">;

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return <div className={`animate-pulse bg-slate-200 ${className}`.trim()} {...props} />;
}
