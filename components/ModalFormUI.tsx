import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { createPortal } from "react-dom";

export function Modal({
  children,
  onClose,
  contentClassName,
}: {
  children: React.ReactNode;
  onClose: () => void;
  contentClassName?: string;
}) {
  return (
    <div className="fixed inset-0 z-10000 flex items-center justify-center bg-black/35 p-4">
      <div className={`relative w-full rounded-2xl bg-white p-5 shadow-2xl ${contentClassName ?? "max-w-lg"}`}>
        <button
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100"
        >
          <X size={15} />
        </button>
        {children}
      </div>
    </div>
  );
}

export function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-slate-600">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition hover:border-[#4A90E2] focus:border-[#4A90E2]"
      />
    </label>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-slate-600">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition hover:border-[#4A90E2] focus:border-[#4A90E2]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function LabeledInput({
  label,
  placeholder,
  value,
  onChange,
  trailingIcon,
  type = "text",
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  trailingIcon?: React.ReactNode;
  type?: "text" | "date";
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-slate-700">{label}</span>
      <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-white px-3 transition hover:border-[#4A90E2] focus-within:border-[#4A90E2] focus-within:shadow-[0_0_0_4px_rgba(74,144,226,0.24)]">
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-full w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
        {trailingIcon}
      </div>
    </label>
  );
}

export function LabeledSelect({
  label,
  placeholder,
  value,
  onChange,
  options,
  labels,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-slate-700">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm text-black outline-none focus:border-black"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {labels?.[option] ?? option}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
      </div>
    </label>
  );
}

export type SearchableSelectOption = {
  value: string;
  label: string;
  description?: string;
};

export function SearchableSelect({
  label,
  placeholder,
  value,
  onChange,
  options,
  searchPlaceholder,
  displayValue,
  emptyText = "No options found",
  creatable = false,
  onCreate,
  createLabel = "Create new",
  createInputPlaceholder = "Enter name",
  searchable = true,
  showSelectedCheck = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  options: SearchableSelectOption[];
  searchPlaceholder?: string;
  displayValue?: string;
  emptyText?: string;
  creatable?: boolean;
  onCreate?: (v: string) => void;
  createLabel?: string;
  createInputPlaceholder?: string;
  searchable?: boolean;
  showSelectedCheck?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [createDraft, setCreateDraft] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelPosition, setPanelPosition] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0,
  });

  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const filtered = useMemo(() => {
    if (!searchable) {
      return options;
    }
    const keyword = query.trim().toLowerCase();
    if (!keyword) {
      return options;
    }
    return options.filter((option) => {
      const labelMatch = option.label.toLowerCase().includes(keyword);
      const descriptionMatch = option.description?.toLowerCase().includes(keyword) ?? false;
      return labelMatch || descriptionMatch;
    });
  }, [options, query, searchable]);

  const canCreate = creatable;

  function commitCreate() {
    const name = createDraft.trim();
    if (!name) {
      return;
    }
    onCreate?.(name);
    setCreating(false);
    setCreateDraft("");
    setOpen(false);
    setQuery("");
  }

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const targetNode = event.target as Node;
      if (!rootRef.current?.contains(targetNode) && !panelRef.current?.contains(targetNode)) {
        setOpen(false);
        setCreating(false);
        setCreateDraft("");
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

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

      const viewportPadding = 12;
      const gap = 6;
      const width = Math.max(220, triggerRect.width);
      const maxLeft = window.innerWidth - width - viewportPadding;
      const left = Math.min(Math.max(triggerRect.left, viewportPadding), Math.max(viewportPadding, maxLeft));
      const panelHeight = panelRef.current?.offsetHeight ?? 320;
      const spaceBelow = window.innerHeight - triggerRect.bottom - viewportPadding - gap;
      const spaceAbove = triggerRect.top - viewportPadding - gap;
      const shouldOpenAbove = spaceBelow < Math.min(260, panelHeight) && spaceAbove > spaceBelow;

      let top = shouldOpenAbove ? triggerRect.top - panelHeight - gap : triggerRect.bottom + gap;
      top = Math.max(viewportPadding, Math.min(top, window.innerHeight - panelHeight - viewportPadding));
      setPanelPosition({ top, left, width });
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

  return (
    <div ref={rootRef} className="relative">
      <span className="mb-1 block text-sm text-slate-700">{label}</span>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex h-11 w-full items-center justify-between rounded-xl border bg-white px-3 text-left text-[15px] outline-none transition ${
          open ? "border-[#4A90E2] shadow-[0_0_0_4px_rgba(74,144,226,0.24)]" : "border-slate-200 hover:border-[#4A90E2]"
        } ${selected || displayValue ? "text-slate-800" : "text-slate-400"}`}
      >
        <span className="truncate">{selected?.label ?? displayValue ?? placeholder}</span>
        <ChevronDown size={16} className="text-slate-500" />
      </button>

      {open
        ? createPortal(
        <div
          ref={panelRef}
          style={{
            top: panelPosition.top,
            left: panelPosition.left,
            width: panelPosition.width || undefined,
          }}
          className="fixed z-[20000] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
        >
          {searchable ? (
            <div className="border-b border-slate-100 p-2">
              <label className="flex h-9 items-center gap-2 rounded-md border border-slate-200 px-2">
                <Search size={14} className="text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={searchPlaceholder ?? `Search ${label.toLowerCase()}`}
                  className="h-full w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  autoFocus
                />
              </label>
            </div>
          ) : null}

          <div className="max-h-64 overflow-y-auto p-1">
            {canCreate ? (
              creating ? (
                <div className="mb-1 rounded-md border-b border-slate-100 px-2.5 py-2">
                  <input
                    value={createDraft}
                    onChange={(event) => setCreateDraft(event.target.value)}
                    placeholder={createInputPlaceholder || createLabel}
                    className="h-9 w-full rounded-md border border-slate-200 px-2 text-sm text-slate-700 outline-none transition hover:border-[#4A90E2] focus:border-[#4A90E2] focus:shadow-[0_0_0_4px_rgba(74,144,226,0.24)]"
                    autoFocus
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        commitCreate();
                      }
                      if (event.key === "Escape") {
                        setCreating(false);
                        setCreateDraft("");
                      }
                    }}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setCreating(true)}
                  className="mb-1 flex w-full items-center rounded-md border-b border-slate-100 px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  + {createLabel}
                </button>
              )
            ) : null}

            {filtered.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                  setQuery("");
                }}
                className={`mb-0.5 flex w-full items-start justify-between rounded-md px-2.5 py-2 text-left hover:bg-slate-50 ${
                  option.value === value ? "bg-[#EEF5FC]" : ""
                }`}
              >
                <span>
                  <span className="block text-sm text-slate-800">{option.label}</span>
                  {option.description ? (
                    <span className="mt-0.5 block text-xs leading-4 text-slate-400">{option.description}</span>
                  ) : null}
                </span>
                {showSelectedCheck && option.value === value ? (
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#3C7ACB]/10 text-[#3C7ACB]">
                    <Check size={13} />
                  </span>
                ) : null}
              </button>
            ))}

            {filtered.length === 0 && !canCreate ? (
              <p className="px-2.5 py-2 text-sm text-slate-400">{emptyText}</p>
            ) : null}
          </div>
        </div>,
        document.body,
          )
        : null}
    </div>
  );
}

export function LabeledTextarea({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-slate-700">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition hover:border-[#4A90E2] focus:border-[#4A90E2] focus:shadow-[0_0_0_4px_rgba(74,144,226,0.24)]"
      />
    </label>
  );
}
