"use client";

import { ChangeEvent, InputHTMLAttributes, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

type DateInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

const DAY_NAMES = ["S", "M", "T", "W", "T", "F", "S"];

function toDateOnly(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function parseDateValue(value: string) {
  if (!value) {
    return null;
  }
  const parts = value.split("-").map((part) => Number(part));
  if (parts.length !== 3) {
    return null;
  }
  const [year, month, day] = parts;
  if (!year || !month || !day) {
    return null;
  }
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return toDateOnly(date);
}

function toInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDisplayValue(value: string) {
  const date = parseDateValue(value);
  if (!date) {
    return "dd/mm/yyyy";
  }
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function DateInput({ className = "", value = "", onChange, disabled, id, name, min, max, required }: DateInputProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelPosition, setPanelPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const selectedDate = useMemo(() => parseDateValue(String(value)), [value]);
  const [viewDate, setViewDate] = useState<Date>(() => selectedDate ?? toDateOnly(new Date()));

  const minDate = useMemo(() => parseDateValue(String(min ?? "")), [min]);
  const maxDate = useMemo(() => parseDateValue(String(max ?? "")), [max]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      const targetNode = event.target as Node;
      if (!containerRef.current?.contains(targetNode) && !panelRef.current?.contains(targetNode)) {
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

  useEffect(() => {
    if (!open) {
      return;
    }

    const updatePanelPosition = () => {
      const triggerRect = triggerRef.current?.getBoundingClientRect();
      if (!triggerRect) {
        return;
      }
      const inViewport =
        triggerRect.bottom > 0 &&
        triggerRect.top < window.innerHeight &&
        triggerRect.right > 0 &&
        triggerRect.left < window.innerWidth;

      if (!inViewport) {
        setOpen(false);
        return;
      }

      const panelWidth = 320;
      const viewportPadding = 12;
      const gap = 6;
      const maxLeft = window.innerWidth - panelWidth - viewportPadding;
      const left = Math.min(Math.max(triggerRect.left, viewportPadding), Math.max(viewportPadding, maxLeft));
      const panelHeight = panelRef.current?.offsetHeight ?? 360;
      const spaceBelow = window.innerHeight - triggerRect.bottom - viewportPadding - gap;
      const spaceAbove = triggerRect.top - viewportPadding - gap;
      const shouldOpenAbove = spaceBelow < Math.min(320, panelHeight) && spaceAbove > spaceBelow;

      let top = shouldOpenAbove ? triggerRect.top - panelHeight - gap : triggerRect.bottom + gap;
      top = Math.max(viewportPadding, Math.min(top, window.innerHeight - panelHeight - viewportPadding));
      setPanelPosition({ top, left });
    };

    updatePanelPosition();
    const rafId = window.requestAnimationFrame(updatePanelPosition);

    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [open]);

  function emitChange(nextValue: string) {
    if (!onChange) {
      return;
    }
    const syntheticEvent = {
      target: { value: nextValue, name, id },
      currentTarget: { value: nextValue, name, id },
    } as unknown as ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  }

  function goToPreviousMonth() {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }

  function goToNextMonth() {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }

  function isOutOfRange(date: Date) {
    const day = toDateOnly(date).getTime();
    if (minDate && day < minDate.getTime()) {
      return true;
    }
    if (maxDate && day > maxDate.getTime()) {
      return true;
    }
    return false;
  }

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(viewDate);

  const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());
  const today = toDateOnly(new Date());

  const days = Array.from({ length: 42 }).map((_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });

  return (
    <div ref={containerRef} className="relative w-full">
      <input id={id} name={name} type="hidden" value={String(value)} required={required} />
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!open && selectedDate) {
            setViewDate(selectedDate);
          }
          setOpen((prev) => !prev);
        }}
        className={`flex h-11 w-full items-center justify-between rounded-xl border bg-white px-3 text-left text-sm text-slate-700 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
          open
            ? "border-[#4A90E2] shadow-[0_0_0_4px_rgba(74,144,226,0.24)]"
            : "border-slate-200 hover:border-[#4A90E2] focus-visible:border-[#4A90E2] focus-visible:shadow-[0_0_0_4px_rgba(74,144,226,0.24)]"
        } ${className}`.trim()}
      >
        <span className={selectedDate ? "text-slate-700" : "text-slate-400"}>{toDisplayValue(String(value))}</span>
        <Calendar size={17} className="text-slate-500" />
      </button>

      {open ? createPortal(
        <div
          ref={panelRef}
          style={{ top: panelPosition.top, left: panelPosition.left }}
          className="fixed z-[20000] w-[320px] max-w-[calc(100vw-2.5rem)] rounded-xl border border-slate-200 bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.12)]"
        >
          <div className="mb-2 grid grid-cols-[32px_1fr_32px] items-center">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <p className="text-center text-sm font-semibold text-slate-800">{monthLabel}</p>
            <button
              type="button"
              onClick={goToNextMonth}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
            {DAY_NAMES.map((day, index) => (
              <span key={`${day}-${index}`} className="py-1">
                {day}
              </span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map((date) => {
              const currentMonth = date.getMonth() === viewDate.getMonth();
              const selected = selectedDate ? isSameDay(date, selectedDate) : false;
              const isToday = isSameDay(date, today);
              const outOfRange = isOutOfRange(date);
              return (
                <button
                  key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
                  type="button"
                  disabled={outOfRange}
                  onClick={() => {
                    emitChange(toInputValue(date));
                    setOpen(false);
                  }}
                  className={`h-9 rounded-lg text-sm transition ${
                    selected
                      ? "bg-[#3C7ACB] font-semibold text-white"
                      : currentMonth
                        ? "text-slate-700 hover:bg-slate-100"
                        : "text-slate-300 hover:bg-slate-50"
                  } ${isToday && !selected ? "border border-[#3C7ACB]/30 text-[#3C7ACB]" : ""} ${outOfRange ? "cursor-not-allowed opacity-40" : ""}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => emitChange("")}
              className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                emitChange(toInputValue(today));
                setOpen(false);
              }}
              className="rounded-lg px-2 py-1 text-xs text-[#3C7ACB] hover:bg-[#EEF5FC]"
            >
              Today
            </button>
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}
