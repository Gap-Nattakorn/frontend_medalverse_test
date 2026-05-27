"use client";

import { ChevronDown } from "lucide-react";
import type { LanguageOption } from "@/components/settings/types";

type Props = {
  platformLanguage: LanguageOption;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onSelectLanguage: (language: LanguageOption) => void;
};

export function LanguageSettingsMenu({ platformLanguage, isMenuOpen, onToggleMenu, onSelectLanguage }: Props) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <h3 className="text-base font-semibold text-slate-800">Platform Language</h3>
        <p className="mt-2 text-base text-slate-500">Choose your preferred display language for the interface.</p>
      </div>

      <div className="relative w-[220px]">
        <button
          type="button"
          onClick={onToggleMenu}
          className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-800"
        >
          <span>{platformLanguage}</span>
          <ChevronDown size={18} />
        </button>

        {isMenuOpen ? (
          <div className="absolute right-0 top-[52px] z-10 w-full rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
            {(["English", "ไทย (Thai)"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onSelectLanguage(option)}
                className={`w-full rounded-lg px-3 py-2 text-left text-base ${
                  platformLanguage === option ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
