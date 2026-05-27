import { Menu } from "lucide-react";

export function SidebarHeader({ title }: { title: string }) {
  return (
    <div className="h-20 px-6 flex items-center justify-between flex-shrink-0">
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      <button className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors">
        <Menu size={24} strokeWidth={1.5} />
      </button>
    </div>
  );
}