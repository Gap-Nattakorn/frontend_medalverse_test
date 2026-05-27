"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Cloudy, Goal, LayoutGrid } from "lucide-react";
import { CredentialCloudMainShell } from "@/components/CredentialCloudMainShell";
import { UserMenuPopover } from "@/components/UserMenuPopover";
import {
  CredentialCloudUIProvider,
  useCredentialCloudUI,
} from "@/components/credential-cloud-ui";

export function CredentialCloudFrame({
  userName,
  children,
}: {
  userName: string;
  children: React.ReactNode;
}) {
  return (
    <CredentialCloudUIProvider>
      <div className="flex h-full w-full min-w-0 overflow-hidden rounded-2xl">
        <LeftRailSidebar userName={userName} />
        <CredentialCloudMainShell>{children}</CredentialCloudMainShell>
      </div>
    </CredentialCloudUIProvider>
  );
}

function LeftRailSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleSubmenu } = useCredentialCloudUI();
  const { isSubmenuOpen } = useCredentialCloudUI();

  const isOnCredentialCloud =
    pathname === "/credentials-cloud" ||
    pathname.startsWith("/credentials-cloud/");

  const handleCredentialCloudClick = () => {
    if (isOnCredentialCloud) {
      toggleSubmenu();
      return;
    }
    router.push("/credentials-cloud/credentials");
  };

  const railItems = [
    {
      icon: Cloudy,
      label: "Credential Cloud",
      active: isOnCredentialCloud,
      onClick: handleCredentialCloudClick,
      disabled: false,
    },
    {
      icon: Goal,
      label: "Mission Room",
      active: false,
      disabled: true,
    },
    {
      icon: LayoutGrid,
      label: "Experience Hub",
      active: false,
      disabled: true,
    },
  ];

  return (
    <aside
      className={[
        "relative z-[10000] flex w-[64px] shrink-0 flex-col items-center border-r border-slate-200 px-1 py-4 sm:w-[86px] sm:px-2 rounded-l-2xl",
        "transition-[border-radius,box-shadow,background-color] duration-300 ease-out",
        isSubmenuOpen
          ? "rounded-none shadow-none bg-white "
          : "rounded-r-2xl shadow-sm bg-white",
      ].join(" ")}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white">
        <Image
          src="/app/assets/logos/medalverse-logo.svg"
          alt="Medalverse Logo"
          width={26}
          height={26}
        />
      </div>

      <div className="flex w-full flex-1 items-center justify-center">
        <nav className="flex w-full flex-col gap-3">
          {railItems.map((item) => (
            <SidebarButton
              key={item.label}
              icon={item.icon}
              label={item.label}
              active={item.active}
              disabled={item.disabled}
              onClick={item.onClick}
            />
          ))}
        </nav>
      </div>

      <div className="mt-auto flex flex-col items-center gap-4 pb-1">
        <button
          className="text-slate-500 transition hover:text-slate-700"
          type="button"
          aria-label="Notifications"
        >
          <Bell size={20} />
        </button>
        <UserMenuPopover name={userName} />
      </div>
    </aside>
  );
}

function itemClass(active: boolean, disabled: boolean) {
  if (active) {
    return "group flex w-full cursor-pointer flex-col items-center gap-1 rounded-xl px-1 py-2 text-center text-caption-caption-sm text-text-brand-primary bg-background-bg-brand-primary transition";
  }

  if (disabled) {
    return "group flex w-full cursor-default flex-col items-center gap-1 rounded-xl px-1 py-2 text-center text-caption-caption-sm text-text-tertiary transition";
  }

  return "group flex w-full cursor-pointer flex-col items-center gap-1 rounded-xl px-1 py-2 text-center text-caption-caption-sm text-text-tertiary transition hover:bg-background-bg-primary-hover hover:text-text-secondary-hover";
}

function SidebarButton({
  icon: Icon,
  label,
  active = false,
  disabled = false,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={itemClass(active, disabled)}
      disabled={disabled}
      aria-label={label}
      aria-disabled={disabled}
    >
      <Icon size={18} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
