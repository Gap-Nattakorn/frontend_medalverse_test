"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, FileText, Star, Link as LinkIcon, HardDrive } from "lucide-react";

export function SubSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { label: "Portfolios", href: "/credentials-cloud/portfolios", icon: Briefcase },
    { label: "Credentials", href: "/credentials-cloud/credentials", icon: FileText },
    { label: "Experiences", href: "/credentials-cloud/experiences", icon: Star },
    { label: "References", href: "/credentials-cloud/references", icon: LinkIcon },
  ];

  return (
    <aside className="flex w-[240px] shrink-0 flex-col border-r border-slate-100 bg-white">
      <div className="px-6 py-5">
        <h2 className="text-lg font-light text-slate-800">Credential2 Cloud</h2>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#eaf4ff] text-blue-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <item.icon size={18} className={isActive ? "text-blue-600" : "text-slate-400"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Storage Footer */}
      <div className="border-t border-slate-100 p-4">
        <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-slate-500">
          <div className="flex items-center gap-1.5">
            <HardDrive size={12} />
            <span>Storage</span>
          </div>
          <span>30 GB</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-100">
          <div className="h-full w-[40%] rounded-full bg-blue-500" />
        </div>
      </div>
    </aside>
  );
}