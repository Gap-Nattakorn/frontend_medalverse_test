"use client";

import Image from "next/image";

export function SecurityBadgeIcon() {
  return (
    <div className="inline-flex h-14 w-14 items-center justify-center">
      <Image src="/assets/icons/toast-fail-icon.svg" alt="Warning" width={56} height={56} />
    </div>
  );
}
