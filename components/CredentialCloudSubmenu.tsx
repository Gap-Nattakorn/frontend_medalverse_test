"use client";

import {
  Award,
  Menu,
  Star,
  FileSymlink,
  SquareUserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCredentialCloudUI } from "@/components/credential-cloud-ui";
import { StorageWidget } from "./StorageWidget";

const menuItems = [
  {
    label: "Portfolios",
    icon: SquareUserRound,
    href: "/credentials-cloud/portfolios",
    enabled: false,
  },
  {
    label: "Credentials",
    icon: Award,
    href: "/credentials-cloud/credentials",
    enabled: true,
  },
  {
    label: "Experiences",
    icon: Star,
    href: "/credentials-cloud/experiences",
    enabled: false,
  },
  {
    label: "References",
    icon: FileSymlink,
    href: "/credentials-cloud/references",
    enabled: false,
  },
];

export function CredentialCloudSubmenu() {
  const pathname = usePathname();
  const { toggleSubmenu } = useCredentialCloudUI();

  return (
    <aside className="z-20 flex h-full w-[206px] shrink-0 flex-col rounded-r-2xl border-r border-[#dbe7f3] bg-white">
      <div className="flex h-[72px] items-center justify-between border-b border-slate-100 px-4">
        <h2 className="whitespace-nowrap text-heading-h6 text-text-primary">
          Credential Cloud
        </h2>
        <button
          type="button"
          onClick={toggleSubmenu}
          className="rounded-md p-1 text-slate-800 transition hover:bg-slate-100 hover:text-black"
          aria-label="Toggle submenu"
        >
          <Menu size={20} />
        </button>
      </div>

      <nav className="px-3 py-3">
        <div className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            const baseClass = `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? "bg-background-bg-brand-primary text-body-sm-semibold   text-text-brand-primary"
                : "text-body-sm-medium text-text-secondary hover:bg-slate-50"
            }`;

            if (!item.enabled) {
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-body-sm-medium "
                >
                  <Icon
                  size={18}
                  className={"text-slate-400"}
                />
                  <span className={"text-slate-400"}>{item.label}</span>
                </div>
              );
            }

            return (
              <Link key={item.label} href={item.href} className={baseClass}>
                <Icon
                  size={18}
                  className={isActive ? "text-text-brand-primary" : ""}
                />
                <span >{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <StorageWidget />
    </aside>
  );
}
