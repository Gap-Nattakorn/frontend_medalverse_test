"use client";

import { X } from "lucide-react";

type Props = {
  title: string;
  subtitle?: string;
  onClose: () => void;
  body: React.ReactNode;
  footer: React.ReactNode;
  className?: string;
  bodyClassName?: string;
};

export function CredentialEditorDialogShell({
  title,
  subtitle,
  onClose,
  body,
  footer,
  className,
  bodyClassName,
}: Props) {
  return (
    <div className={`w-full overflow-hidden rounded-2xl border border-slate-200 bg-white ${className ?? "max-w-[700px]"}`}>
      <div className="flex items-start justify-between border-b border-slate-200 px-5 py-3">
        <div>
          {subtitle ? <h3 className="text-[22px] mt-3 leading-none font-medium text-slate-800">{title}</h3> : <h3 className="text-[22px] mt-5 leading-none font-medium text-slate-800">{title}</h3>}
          {subtitle ? <p className="mt-3 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label="Close dialog"
        >
          <X size={16} />
        </button>
      </div>

      <div className={bodyClassName ?? "max-h-[68vh] overflow-y-auto bg-[#eaf4ff] px-5 py-4"}>{body}</div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-3">{footer}</div>
    </div>
  );
}
