"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Globe, Settings } from "lucide-react";
import { SettingsDialog } from "@/components/SettingsDialog";
import { PROFILE_AVATAR_STORAGE_KEY, PROFILE_AVATAR_UPDATED_EVENT } from "@/shared/constants/profile";

type Props = {
  name: string;
};

function getInitial(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    return "U";
  }
  return trimmed.slice(0, 1).toUpperCase();
}

export function UserMenuPopover({ name }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsDialogVersion, setSettingsDialogVersion] = useState(0);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    function syncAvatar() {
      if (typeof window === "undefined") {
        return;
      }
      setAvatarPreview(window.localStorage.getItem(PROFILE_AVATAR_STORAGE_KEY));
    }

    syncAvatar();
    window.addEventListener(PROFILE_AVATAR_UPDATED_EVENT, syncAvatar);
    window.addEventListener("storage", syncAvatar);
    return () => {
      window.removeEventListener(PROFILE_AVATAR_UPDATED_EVENT, syncAvatar);
      window.removeEventListener("storage", syncAvatar);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  function onOpenSettings() {
    setOpen(false);
    setSettingsDialogVersion((prev) => prev + 1);
    setSettingsOpen(true);
  }

  const initial = getInitial(name);

  return (
    <div ref={rootRef} className="relative z-[12000]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-sm font-medium text-white transition ${
          avatarPreview ? "bg-white" : "bg-slate-800 hover:bg-slate-700"
        }`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open user menu"
      >
        {avatarPreview ? (
          <Image src={avatarPreview} alt={`${name} avatar`} width={40} height={40} className="h-10 w-10 object-cover" unoptimized />
        ) : (
          initial
        )}
      </button>

      {open ? (
        <div className="absolute bottom-0 left-full z-[12010] ml-3 w-[330px] rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-slate-100"
          >
            {avatarPreview ? (
              <Image src={avatarPreview} alt={`${name} avatar`} width={40} height={40} className="h-10 w-10 rounded-full object-cover" unoptimized />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm font-medium text-white">
                {initial}
              </div>
            )}
            <p className="text-lg font-medium leading-none text-slate-700">{name}</p>
          </button>

          <div className="my-2 h-px bg-slate-200" />

          <div className="space-y-1">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-[14px] text-slate-600 transition hover:bg-slate-100"
            >
              <span className="inline-flex items-center gap-3">
                <Globe size={18} />
                Languages
              </span>
              <span className="text-slate-400">
                <span className="font-semibold text-slate-600">EN</span> &nbsp;|&nbsp; TH
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-[14px] text-slate-600 transition hover:bg-slate-100"
            >
              <Settings size={18} />
              All Settings
            </button>
          </div>
        </div>
      ) : null}

      <SettingsDialog key={settingsDialogVersion} isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} name={name} />
    </div>
  );
}
