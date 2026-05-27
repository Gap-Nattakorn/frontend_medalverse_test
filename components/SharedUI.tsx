import React from "react";
import { X, ChevronDown } from "lucide-react";

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
        className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"
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
        className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"
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
      <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-white px-3">
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-full w-full border-0 bg-transparent text-sm text-slate-700 outline-none"
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
          className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 outline-none"
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
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none"
      />
    </label>
  );
}