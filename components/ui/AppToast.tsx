"use client";

import Image from "next/image";
import { X } from "lucide-react";

export type AppToastPayload = {
  type: "success" | "fail" | "error";
  message: string;
  title?: string;
};

type Props = {
  toast: AppToastPayload | null;
  onClose: () => void;
  className?: string;
};

export function AppToast({ toast, onClose, className }: Props) {
  if (!toast) {
    return null;
  }

  const isSuccess = toast.type === "success";
  const title = toast.title ?? (isSuccess ? "Successfully updated" : "Update failed");

  return (
    <div className={className ?? "fixed right-8 top-8 z-[13100]"}>
      <div className="flex min-w-[350px] items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
        <div className="mt-0.5">
          {isSuccess ? (
            <Image src="/app/assets/icons/toast-success-icon.svg" alt="Success" width={22} height={22} />
          ) : (
            <Image src="/app/assets/icons/toast-fail-icon.svg" alt="Failed" width={22} height={22} />
          )}
        </div>

        <div className="flex-1">
          <p className="text-base font-semibold text-slate-800">{title}</p>
          <p className="mt-1 text-sm text-slate-500">{toast.message}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close notification"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
