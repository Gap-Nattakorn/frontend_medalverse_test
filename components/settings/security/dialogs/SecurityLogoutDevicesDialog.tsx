"use client";

import { SecurityBadgeIcon } from "@/components/settings/security/dialogs/SecurityBadgeIcon";

type Props = {
  onCancel: () => void;
  onConfirm: () => void;
};

export function SecurityLogoutDevicesDialog({ onCancel, onConfirm }: Props) {
  return (
    <div className="fixed inset-0 z-[13250] flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="space-y-4 p-6">
          <SecurityBadgeIcon />
          <div>
            <h3 className="text-base font-semibold text-slate-800">Log out of all other devices</h3>
            <p className="mt-2 text-base text-slate-500">All other devices will be signed out. You will remain signed in on this device.</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button type="button" onClick={onCancel} className="rounded-xl border border-slate-300 px-7 py-2 text-base text-slate-700">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="rounded-xl bg-[#E6174E] px-7 py-2 text-base font-semibold text-white">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
