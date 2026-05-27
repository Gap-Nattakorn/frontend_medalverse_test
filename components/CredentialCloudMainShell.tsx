"use client";

import { usePathname } from "next/navigation";
import { CredentialCloudSubmenu } from "@/components/CredentialCloudSubmenu";
import { useCredentialCloudUI } from "@/components/credential-cloud-ui";

export function CredentialCloudMainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isSubmenuOpen } = useCredentialCloudUI();

  const isCredentialDetail = /^\/credentials-cloud\/credentials\/[^/]+$/.test(pathname);
  const shouldShowSubmenuArea = !isCredentialDetail;

  return (
    <main className="flex min-w-0 flex-1 pr-1.5 pl-0">
      {shouldShowSubmenuArea && (
        <div
          className={[
            "z-20 h-full shrink-0",
            "transition-all duration-500 ease-in-out",
            "[clip-path:inset(0_-9999px_0_0)]",
            isSubmenuOpen
              ? "w-[206px] opacity-100 translate-x-0"
              : "w-0 opacity-0 -translate-x-4 pointer-events-none",
          ].join(" ")}
        >
          <div className="w-[206px] h-full">
            <CredentialCloudSubmenu />
          </div>
        </div>
      )}

      <div
        className={`min-w-0 flex-1 overflow-auto transition-all duration-500 ease-in-out ${isCredentialDetail ? "p-2.5" : "rounded-r-3xl p-2"
          }`}
      >
        {children}
      </div>
    </main>
  );
}
