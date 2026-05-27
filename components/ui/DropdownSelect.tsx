"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";

export type DropdownOption = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

type DropdownSelectProps = {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  optionClassName?: string;
  selectedOptionClassName?: string;
  showSelectedCheck?: boolean;
};

export function DropdownSelect({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = "Select option",
  disabled = false,
  className = "",
  buttonClassName = "",
  menuClassName = "",
  optionClassName = "text-slate-700 hover:bg-slate-50",
  selectedOptionClassName = "bg-blue-50 text-blue-700",
  showSelectedCheck = false,
}: DropdownSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0,
  });

  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      const targetNode = event.target as Node;
      const inContainer = containerRef.current?.contains(targetNode);
      const inMenu = menuRef.current?.contains(targetNode);
      if (!inContainer && !inMenu) {
        setOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const updateMenuPosition = () => {
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

      const viewportPadding = 12;
      const gap = 6;
      const width = Math.max(220, triggerRect.width);
      const maxLeft = window.innerWidth - width - viewportPadding;
      const left = Math.min(Math.max(triggerRect.left, viewportPadding), Math.max(viewportPadding, maxLeft));
      const menuHeight = menuRef.current?.offsetHeight ?? 280;
      const spaceBelow = window.innerHeight - triggerRect.bottom - viewportPadding - gap;
      const spaceAbove = triggerRect.top - viewportPadding - gap;
      const shouldOpenAbove = spaceBelow < Math.min(240, menuHeight) && spaceAbove > spaceBelow;

      let top = shouldOpenAbove ? triggerRect.top - menuHeight - gap : triggerRect.bottom + gap;
      top = Math.max(viewportPadding, Math.min(top, window.innerHeight - menuHeight - viewportPadding));
      setMenuPosition({ top, left, width });
    };

    updateMenuPosition();
    const rafId = window.requestAnimationFrame(updateMenuPosition);
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={`relative ${className}`.trim()}>
      <input type="hidden" id={id} name={name} value={value} />
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-left text-sm text-slate-700 outline-none transition focus-visible:ring-2 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
          selected ? "text-slate-700" : "text-slate-400"
        } ${buttonClassName}`.trim()}
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <ChevronDown size={16} className={`text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open
        ? createPortal(
        <div
          ref={menuRef}
          style={{
            top: menuPosition.top,
            left: menuPosition.left,
            width: menuPosition.width || undefined,
          }}
          className={`fixed z-[20000] max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-[0_10px_30px_rgba(15,23,42,0.12)] ${menuClassName}`.trim()}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`mb-1 flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left last:mb-0 ${
                  option.disabled
                    ? "cursor-not-allowed text-slate-300"
                    : isSelected
                      ? selectedOptionClassName
                      : optionClassName
                }`}
              >
                {showSelectedCheck ? (
                  <span className={`mt-0.5 inline-flex h-4 w-4 items-center justify-center text-sm ${isSelected ? "" : "opacity-0"}`}>
                    ✓
                  </span>
                ) : null}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{option.label}</span>
                  {option.description ? (
                    <span className="mt-0.5 block truncate text-xs text-slate-500">{option.description}</span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
        ,
        document.body,
          )
        : null}
    </div>
  );
}
