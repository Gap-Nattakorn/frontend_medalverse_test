"use client";

import { Check, Eye, EyeOff, KeyRound, X } from "lucide-react";

type Props = {
  newPassword: string;
  confirmPassword: string;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  hasMinLength: boolean;
  hasSpecial: boolean;
  passwordsMatched: boolean;
  canSubmit: boolean;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onToggleShowNewPassword: () => void;
  onToggleShowConfirmPassword: () => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function SecuritySetNewPasswordDialog({
  newPassword,
  confirmPassword,
  showNewPassword,
  showConfirmPassword,
  hasMinLength,
  hasSpecial,
  passwordsMatched,
  canSubmit,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onToggleShowNewPassword,
  onToggleShowConfirmPassword,
  onClose,
  onSubmit,
}: Props) {
  return (
    <div className="fixed inset-0 z-[13250] flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-[500px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="relative space-y-4 p-6">
          <button type="button" onClick={onClose} className="absolute right-4 top-4 text-slate-500">
            <X size={24} />
          </button>

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 text-[#3C7ACB]">
            <KeyRound size={28} />
          </div>

          <div className="text-center">
            <h3 className="text-3xl font-semibold text-slate-800">Set new password</h3>
            <p className="mt-2 text-base text-slate-500">Your new password must be different previously used password.</p>
          </div>

          <SecurityPasswordField
            label="Password"
            value={newPassword}
            visible={showNewPassword}
            onChange={onNewPasswordChange}
            onToggleVisibility={onToggleShowNewPassword}
          />
          <SecurityPasswordField
            label="Confirm Password"
            value={confirmPassword}
            visible={showConfirmPassword}
            onChange={onConfirmPasswordChange}
            onToggleVisibility={onToggleShowConfirmPassword}
          />
          {confirmPassword.length > 0 && !passwordsMatched ? (
            <p className="-mt-2 text-sm text-rose-500">Confirm password does not match password.</p>
          ) : null}

          <div className="space-y-2">
            <SecurityRequirementRow done={hasMinLength} text="Must be at least 8 characters" />
            <SecurityRequirementRow done={hasSpecial} text="Must contain one special character" />
          </div>

          <button
            type="button"
            disabled={!canSubmit}
            onClick={onSubmit}
            className={`h-12 w-full rounded-xl text-md font-medium ${
              canSubmit ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-slate-100 text-slate-400"
            }`}
          >
            Reset Password
          </button>
        </div>
      </div>
    </div>
  );
}

function SecurityRequirementRow({ done, text }: { done: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-md text-slate-500">
      <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${done ? "bg-[#3C7ACB] text-white" : "bg-slate-200 text-slate-200"}`}>
        <Check size={12} />
      </span>
      {text}
    </div>
  );
}

function SecurityPasswordField({
  label,
  value,
  visible,
  onChange,
  onToggleVisibility,
}: {
  label: string;
  value: string;
  visible: boolean;
  onChange: (value: string) => void;
  onToggleVisibility: () => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-base text-slate-700">{label}</span>
      <div className="flex h-12 items-center rounded-xl border border-slate-300 px-3">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-full w-full text-base text-slate-700 outline-none"
        />
        <button type="button" onClick={onToggleVisibility} className="text-slate-400">
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </label>
  );
}
