import React from "react";

export function CredentialSkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#d8e7f5] bg-white p-0">
      <div className="credential-skeleton-shimmer h-[112px] w-full rounded-t-2xl bg-[#e7edf5]" />
      <div className="px-5 pb-4 pt-4">
        <div className="credential-skeleton-shimmer mb-3 h-20 w-20 rounded-full bg-[#e7edf5]" />
        <div className="credential-skeleton-shimmer mb-3 h-4 w-11/12 rounded-full bg-[#e7edf5]" />
        <div className="credential-skeleton-shimmer mb-3 h-4 w-9/12 rounded-full bg-[#e7edf5]" />
        <div className="credential-skeleton-shimmer mb-2 h-3 w-full rounded-full bg-[#e7edf5]" />
        <div className="credential-skeleton-shimmer mb-2 h-3 w-10/12 rounded-full bg-[#e7edf5]" />
        <div className="credential-skeleton-shimmer mb-5 h-3 w-8/12 rounded-full bg-[#e7edf5]" />
        <div className="h-px w-full bg-[#edf2f7]" />
        <div className="mt-3 flex items-center justify-between">
          <div className="space-y-2">
            <div className="credential-skeleton-shimmer h-3 w-20 rounded-full bg-[#e7edf5]" />
            <div className="credential-skeleton-shimmer h-4 w-24 rounded-full bg-[#e7edf5]" />
          </div>
          <div className="space-y-2 text-right">
            <div className="credential-skeleton-shimmer h-3 w-24 rounded-full bg-[#e7edf5]" />
            <div className="credential-skeleton-shimmer h-4 w-24 rounded-full bg-[#e7edf5]" />
          </div>
        </div>
      </div>
    </div>
  );
}