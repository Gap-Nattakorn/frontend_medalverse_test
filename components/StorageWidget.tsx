"use client";

import { useState } from "react";
import { Cloud, X } from "lucide-react";

export type StorageCategory = {
  name: string;
  percent: number;
  color: string;
};

export type StorageMockData = {
  totalGB: number;
  usedGB: number;
  categories: StorageCategory[];
};

// Mock 1: Normal State
export const mockNormalStorage: StorageMockData = {
  totalGB: 30,
  usedGB: 9.6,
  categories: [
    { name: "Portfolio", percent: 2.3, color: "bg-blue-500" },
    { name: "Medal", percent: 4.0, color: "bg-orange-500" },
    { name: "Reference", percent: 1.2, color: "bg-indigo-500" },
    { name: "Badge", percent: 9.5, color: "bg-rose-500" },
    { name: "Event", percent: 8.0, color: "bg-emerald-500" },
    { name: "Certificate", percent: 5.0, color: "bg-purple-500" },
    { name: "Trophy", percent: 2.0, color: "bg-amber-500" },
  ],
};

// Mock 2: Critical State
export const mockCriticalStorage: StorageMockData = {
  totalGB: 128,
  usedGB: 120,
  categories: [
    { name: "Portfolio", percent: 10, color: "bg-blue-500" },
    { name: "Medal", percent: 25, color: "bg-orange-500" },
    { name: "Reference", percent: 13, color: "bg-indigo-500" },
    { name: "Badge", percent: 12, color: "bg-rose-500" },
    { name: "Event", percent: 23, color: "bg-emerald-500" },
    { name: "Certificate", percent: 8, color: "bg-purple-500" },
    { name: "Trophy", percent: 2, color: "bg-amber-500" },
  ],
};

export function StorageWidget() {
  const [isCriticalMock, setIsCriticalMock] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const MIN_PX = 4;

  const data = isCriticalMock ? mockCriticalStorage : mockNormalStorage;
  const usagePercent = Math.round((data.usedGB / data.totalGB) * 100);
  const isCritical = usagePercent >= 90;

  return (
    <>
      {/* Toggle State (Dev) */}
      <button
        onClick={() => setIsCriticalMock(!isCriticalMock)}
        className="mb-4 text-[10px] text-slate-400 underline"
      >
        Toggle State (Dev)
      </button>


      <div className="relative mt-auto border-t border-slate-100 pt-4 px-4 pb-2">
        
        {/* --- Widget Button --- */}
        <div
          onClick={() => setShowPopover((prev) => !prev)}
          className={`cursor-pointer transition-all ${
            isCritical
              ? "rounded-2xl px-2 pt-2 hover:bg-slate-50"
              : "p-2 hover:bg-slate-50 rounded-xl mb-2"
          }  ${showPopover ? "bg-slate-50" : ""}`}
        >
          <div className="mb-2 flex items-center justify-between ">
            <span className="inline-flex items-center gap-2 text-body-sm-medium text-text-secondary">
              <Cloud size={16} className="" />
              Storage
            </span>
            <span className="text-[10px] leading-none text-right text-text-secondary">{data.totalGB} GB</span>
          </div>

          {isCritical && (
            <p className="mb-3 text-caption-caption-sm text-text-secondary">
              This credential cloud has used {data.usedGB} GB of {data.totalGB} GB
              storage limit ({usagePercent}%).
            </p>
          )}

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-background-bg-primary">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isCritical ? "bg-foreground-fg-error-primary" : "bg-foreground-fg-brand-secondary"
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>

        {isCritical && (
          <button className="mb-2 mt-4 w-full rounded-xl border border-slate-200 bg-white py-2 text-body-sm-medium text-text-primary shadow-sm transition hover:bg-slate-50">
            Upgrade Plan
          </button>
        )}

       
        {showPopover && (
          <div className="absolute bottom-0 left-full ml-4 z-[9999] w-[280px] rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <span className="inline-flex items-center gap-2 text-body-sm-medium text-text-primary">
                <Cloud size={16} className="" />
                Storage
              </span>
              <button
                onClick={() => setShowPopover(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-6 flex h-1.5 w-full gap-0.5 overflow-hidden bg-slate-50 rounded-full">
                {data.categories.map((cat, idx) => (
                  <div
                    key={idx}
                    className={`h-full rounded-full ${cat.color}`}
                    style={{ width: `${Math.max(cat.percent, MIN_PX)}%` }}
                  />
                ))}
              </div>

              <div className="mb-6 flex flex-col gap-3">
                {data.categories.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`h-1.5 w-1.5 rounded-full ${cat.color}`} />
                      <span className="text-body-sm-regular text-text-primary">{cat.name}</span>
                    </div>
                    <span className="text-body-sm-medium text-text-primary">{cat.percent} %</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-4">
                <div className="mb-2 flex justify-between text-body-sm-medium text-text-primary">
                  <span>Total used</span>
                  <span>{usagePercent} %</span>
                </div>
                <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCritical ? "bg-rose-600" : "bg-blue-500"
                    }`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>

                <button className="w-full rounded-xl bg-[#222222] py-2.5 text-body-md-medium text-white transition hover:bg-black">
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}