"use client";

import { KeyRound, X } from "lucide-react";

type Props = {
  email: string;
  currentPassword: string;
  onCurrentPasswordChange: (value: string) => void;
  onClose: () => void;
  onNext: () => void;
};

export function SecurityChangePasswordDialog({ email, currentPassword, onCurrentPasswordChange, onClose, onNext }: Props) {
  return (
    <div className="fixed inset-0 z-[13250] flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-[500px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="relative flex min-h-[480px] flex-col p-6">
          <button type="button" onClick={onClose} className="absolute right-5 top-5 text-slate-500">
            <X size={22} />
          </button>

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-slate-200 text-[#3C7ACB]">
            <KeyRound size={24} />
          </div>

          <div className="mt-4 text-center">
            <h3 className="text-3xl font-semibold leading-tight text-slate-800">Change password?</h3>
            <p className="mx-auto mt-2 max-w-[92%] text-base leading-relaxed text-slate-500">
              For security purposes, please enter your current password to receive a password reset email.
            </p>
          </div>

          <div className="mt-5 space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-base text-slate-700">Email</span>
              <input
                value={email}
                disabled
                className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-base text-slate-700"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-base text-slate-700">Current password</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => onCurrentPasswordChange(event.target.value)}
                placeholder="Enter current password"
                className="h-12 w-full rounded-xl border border-slate-300 px-3 text-base text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>
          </div>

          <button
            type="button"
            disabled={!currentPassword.trim()}
            onClick={onNext}
            className={`mt-auto h-12 w-full rounded-xl text-md font-medium ${
              currentPassword.trim() ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-slate-100 text-slate-400"
            }`}
          >
            Reset Password
          </button>
        </div>
      </div>
    </div>
  );
}
