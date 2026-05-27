"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonLabel?: string;
  buttonHref?: string;
  onAction?: () => void;
  badgeCount?: number;
  iconSrc?: string;
};

export function CredentialSuccessDialog({
  open,
  onClose,
  title = "Congratulation!",
  message = "Your achievements have been added",
  buttonLabel = "View Credential",
  buttonHref = "/credentials-cloud/credentials",
  onAction,
  badgeCount = 0,
  iconSrc = "/app/assets/icons/cone.svg",
}: Props) {
  if (!open) {
    return null;
  }

  const handleAction = () => {
    onAction?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/35 p-4">
      <div className="relative flex h-[420px] w-full max-w-[420px] flex-col rounded-2xl bg-[#eaf4ff] p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-white/70"
          aria-label="Close success dialog"
        >
          <X size={16} />
        </button>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h3 className="text-2xl font-medium text-slate-800">{title}</h3>
          <p className="mt-1 text-[17px] text-slate-600">{message}</p>

          <div className="relative mt-5">
            <div className="mx-auto flex h-[156px] w-[156px] items-center justify-center rounded-full border-4 border-white bg-[#8ab0d6]">
              <Image src={iconSrc} alt="Success badge" width={102} height={102} className="h-[102px] w-[102px] object-contain" />
            </div>
            {badgeCount > 0 ? (
              <span className="absolute -bottom-1 -right-1 inline-flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-white bg-[#9bc4ff] px-2 text-sm font-semibold text-white shadow">
                +{badgeCount}
              </span>
            ) : null}
          </div>
        </div>

        {buttonHref ? (
          <Link
            href={buttonHref}
            onClick={handleAction}
            className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-(--color-background-bg-primary-solid) text-sm font-semibold text-white transition bg-(--color-background-bg-primary-solid)"
          >
            {buttonLabel}
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleAction}
            className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-(--color-background-bg-primary-solid) text-sm font-semibold text-white transition bg-(--color-background-bg-primary-solid)"
          >
            {buttonLabel}
          </button>
        )}
      </div>
    </div>
  );
}
