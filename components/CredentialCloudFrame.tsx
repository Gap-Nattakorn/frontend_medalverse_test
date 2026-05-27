"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Cloudy } from "lucide-react";
import { CredentialCloudMainShell } from "@/components/CredentialCloudMainShell";
import { UserMenuPopover } from "@/components/UserMenuPopover";
import { CredentialCloudUIProvider, useCredentialCloudUI } from "@/components/credential-cloud-ui";

export function CredentialCloudFrame({
    userName,
    children,
}: {
    userName: string;
    children: React.ReactNode;
}) {
    return (
        <CredentialCloudUIProvider>
            <div className="flex h-full rounded-2xl">
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
        pathname === "/credentials-cloud" || pathname.startsWith("/credentials-cloud/");

    const handleCredentialCloudClick = () => {
        if (isOnCredentialCloud) {
            toggleSubmenu();
            return;
        }
        router.push("/credentials-cloud/credentials");
    };

    return (
        <aside
            className={[
                "relative z-[10000] flex w-[86px] shrink-0 flex-col items-center border-r border-slate-200 px-2 py-4 rounded-l-2xl",
                "transition-[border-radius,box-shadow,background-color] duration-300 ease-out",
                isSubmenuOpen ? "rounded-none shadow-none bg-white " : "rounded-r-2xl shadow-sm bg-white",
            ].join(" ")}
        >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white">
                <Image src="/app/assets/logos/medalverse-logo.svg" alt="Medalverse Logo" width={26} height={26} />
            </div>

            <div className="flex w-full flex-1 items-center justify-center">
                <nav className="flex w-full flex-col gap-3">
                    <SidebarButton icon={Cloudy} label="Credential Cloud" active={isOnCredentialCloud} onClick={handleCredentialCloudClick} />
                </nav>
            </div>

            <div className="mt-auto flex flex-col items-center gap-4 pb-1">
                <button className="text-slate-500 transition hover:text-slate-700" type="button" aria-label="Notifications">
                    <Bell size={20} />
                </button>
                <UserMenuPopover name={userName} />
            </div>
        </aside>
    );
}

function itemClass(active: boolean) {
    return `group cursor-pointer flex w-full flex-col items-center gap-1 rounded-xl px-1 py-2 text-center text-caption-caption-sm transition ${active ? "bg-background-bg-brand-primary text-text-brand-primary" : "text-text-tertiary hover:bg-background-bg-primary-hover hover:text-text-secondary-hover"
        }`;
}

function SidebarButton({
    icon: Icon,
    label,
    active = false,
    onClick,
}: {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    active?: boolean;
    onClick: () => void;
}) {
    return (
        <button type="button" onClick={onClick} className={itemClass(active)} aria-label={label}>
            <Icon size={18} />
            <span>{label}</span>
        </button>
    );
}