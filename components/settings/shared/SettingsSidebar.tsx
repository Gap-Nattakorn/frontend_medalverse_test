"use client";

import { SETTINGS_TABS } from "@/components/settings/constants";
import type { SettingsTab } from "@/components/settings/types";

type Props = {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
};

export function SettingsSidebar({ activeTab, onTabChange }: Props) {
  return (
    <aside className="w-[230px] border-r border-slate-200 bg-white px-4 py-5">
      <nav className="space-y-1">
        {SETTINGS_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-base transition ${
                isActive ? "bg-[#EEF5FC] text-[#3C7ACB]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon size={18} />
              <span className={isActive ? "font-medium" : ""}>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
