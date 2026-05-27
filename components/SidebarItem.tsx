import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href?: string;
  isActive?: boolean;
  isEnabled?: boolean;
}

export function SidebarItem({ icon: Icon, label, href = "#", isActive = false, isEnabled  }: SidebarItemProps) {
  
  if (!isEnabled) {
    return (
      <div 
        className={`
          flex items-center gap-4 px-4 py-3.5 mx-2 rounded-xl text-sm font-medium transition-colors
          ${isActive 
            ? 'bg-[#EAF5FF] text-[#007AFF]' 
            : isEnabled
              ? 'text-gray-500 hover:bg-gray-50 hover:text-gray-900' 
              : 'text-slate-400' 
          }
        `}
      >
        <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
        <span>{label}</span>
      </div>
    );
  }

  return (
    <Link 
      href={href} 
      className={`
        flex items-center gap-4 px-4 py-3.5 mx-2 rounded-xl text-sm font-medium transition-colors
        ${isActive 
          ? 'bg-[#EAF5FF] text-[#007AFF]' 
          : isEnabled
            ? 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            : 'text-slate-400' 
        }
      `}
    >
      <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
      <span>{label}</span>
    </Link>
  );
}