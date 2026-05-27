"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar } from "lucide-react";
import { DateInput } from "@/components/ui/DateInput";

type DateRangePickerProps = {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onClear?: () => void;
  className?: string;
  panelClassName?: string;
};

function formatDateLabel(value: string) {
  if (!value) {
    return "Any";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
  className = "",
  panelClassName = "",
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasSelectedRange = Boolean(startDate || endDate);
  const dateRangeLabel = hasSelectedRange
    ? `${formatDateLabel(startDate)} - ${formatDateLabel(endDate)}`
    : "Select date";

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className={`relative ${open ? "z-[130]" : "z-10"} ${className}`.trim()}
    >
      <button
        className={`inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium ${hasSelectedRange ? "text-slate-700" : "text-slate-400"}`}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Calendar size={16} />
        {dateRangeLabel}
      </button>
      {open ? (
        <div
          className={`absolute left-0 top-[calc(100%+8px)] z-[140] w-[min(340px,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-3 shadow-xl sm:left-auto sm:right-0 sm:top-12 sm:w-[340px] ${panelClassName}`.trim()}
        >
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-slate-600">
              Start Date
              <DateInput
                value={startDate}
                onChange={(event) => onStartDateChange(event.target.value)}
                className="mt-1"
              />
            </label>
            <label className="text-xs text-slate-600">
              End Date
              <DateInput
                value={endDate}
                onChange={(event) => onEndDateChange(event.target.value)}
                className="mt-1"
              />
            </label>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
              onClick={() => {
                onStartDateChange("");
                onEndDateChange("");
                onClear?.();
              }}
            >
              Clear
            </button>
            <button
              type="button"
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
              onClick={() => setOpen(false)}
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
