import React from "react";

export function SidebarFrame({ children }: { children: React.ReactNode }) {
  return (
    <aside className="w-72 h-full border-r border-gray-100 bg-white flex flex-col flex-shrink-0 transition-all duration-300">
      {children}
    </aside>
  );
}