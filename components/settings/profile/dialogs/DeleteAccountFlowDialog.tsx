"use client";

import { ChevronDown, CircleAlert } from "lucide-react";
import { DELETE_REASONS } from "@/components/settings/constants";
import type { DeleteFlowStep } from "@/components/settings/types";

type Props = {
  step: DeleteFlowStep;
  reason: string;
  reasonDetail: string;
  reasonMenuOpen: boolean;
  password: string;
  onCancel: () => void;
  onReasonMenuToggle: () => void;
  onReasonSelect: (reason: string) => void;
  onReasonDetailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onContinueFromWarning: () => void;
  onContinueFromReason: () => void;
  onDeleteConfirmed: () => void;
  onBackToLogin: () => void;
};

export function DeleteAccountFlowDialog({
  step,
  reason,
  reasonDetail,
  reasonMenuOpen,
  password,
  onCancel,
  onReasonMenuToggle,
  onReasonSelect,
  onReasonDetailChange,
  onPasswordChange,
  onContinueFromWarning,
  onContinueFromReason,
  onDeleteConfirmed,
  onBackToLogin,
}: Props) {
  const canContinueReasonStep = Boolean(reason.trim());
  const canDelete = Boolean(password.trim());

  return (
    <div className="fixed inset-0 z-[13200] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-[510px] overflow-visible rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="space-y-4 p-5">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-500 ring-6 ring-rose-50/60">
            <CircleAlert size={18} />
          </div>

          {step === "warning" ? (
            <>
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Deleting your account will permanently remove:</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                  <li>Your profile information and personal data</li>
                  <li>All credentials and awards stored in your Credential Cloud</li>
                  <li>Any unclaimed credentials</li>
                  <li>Transaction history and related records</li>
                  <li>Event registrations and participation history</li>
                  <li>Bookmarked events and saved items</li>
                  <li>Any other associated data stored within our system</li>
                </ul>
                <p className="mt-3 text-sm text-slate-600">
                  This action is permanent and cannot be undone. Once deleted, your data cannot be recovered.
                </p>
              </div>
              <DeleteFlowFooter>
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-xl border border-slate-300 px-7 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onContinueFromWarning}
                  className="rounded-xl bg-[#E6174E] px-7 py-2 text-sm font-semibold text-white transition hover:bg-[#CF1648]"
                >
                  Continue
                </button>
              </DeleteFlowFooter>
            </>
          ) : null}

          {step === "reason" ? (
            <>
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Why are you leaving?</h3>
                <p className="mt-1.5 text-sm text-slate-600">We’re sorry to see you go. Help us improve by sharing your reason.</p>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={onReasonMenuToggle}
                  className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-300 px-3 text-left text-sm text-slate-800"
                >
                  <span>{reason || "Select your reason"}</span>
                  <ChevronDown size={16} className="text-slate-500" />
                </button>

                {reasonMenuOpen ? (
                  <div className="absolute left-0 top-[52px] z-20 max-h-[240px] w-full overflow-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                    {DELETE_REASONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => onReasonSelect(option)}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                          reason === option ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              {reason ? (
                <textarea
                  value={reasonDetail}
                  onChange={(event) => onReasonDetailChange(event.target.value)}
                  placeholder="What privacy or security concerns would you like us to address?"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              ) : null}

              <DeleteFlowFooter>
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-xl border border-slate-300 px-7 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!canContinueReasonStep}
                  onClick={onContinueFromReason}
                  className={`rounded-xl px-7 py-2 text-sm font-semibold transition ${
                    canContinueReasonStep ? "bg-[#E6174E] text-white hover:bg-[#CF1648]" : "cursor-not-allowed bg-slate-100 text-slate-400"
                  }`}
                >
                  {reason ? "Continue" : "Delete"}
                </button>
              </DeleteFlowFooter>
            </>
          ) : null}

          {step === "password" ? (
            <>
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Password Confirmation Required</h3>
                <p className="mt-1.5 text-sm text-slate-600">
                  Please enter your password to confirm it’s really you and proceed with deleting your account.
                </p>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-sm text-slate-700">Current password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => onPasswordChange(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-700 outline-none"
                />
              </label>

              <DeleteFlowFooter>
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-xl border border-slate-300 px-7 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!canDelete}
                  onClick={onDeleteConfirmed}
                  className={`rounded-xl px-7 py-2 text-sm font-semibold transition ${
                    canDelete ? "bg-[#E6174E] text-white hover:bg-[#CF1648]" : "cursor-not-allowed bg-slate-100 text-slate-400"
                  }`}
                >
                  Delete
                </button>
              </DeleteFlowFooter>
            </>
          ) : null}

          {step === "success" ? (
            <>
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Your account has been deleted.</h3>
                <p className="mt-1.5 text-sm text-slate-600">
                  We’re sorry to see you go. If we can serve you better in the future, you’re always welcome back.
                </p>
              </div>

              <DeleteFlowFooter>
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="rounded-xl bg-slate-900 px-7 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Back to Login
                </button>
              </DeleteFlowFooter>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DeleteFlowFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">{children}</div>;
}
