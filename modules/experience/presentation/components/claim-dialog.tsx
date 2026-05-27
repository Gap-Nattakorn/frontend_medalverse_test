"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppToast } from "@/components/ui/AppToast";
import { CredentialEditorDialogShell } from "@/components/ui/CredentialEditorDialogShell";
import { CredentialSuccessDialog } from "@/components/ui/CredentialSuccessDialog";
import { ClaimDialogForm, ClaimToast } from "../experience-content.types";

function ClaimField({
  label,
  value,
  multiline = false,
  keepBorderOnLast = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  keepBorderOnLast?: boolean;
}) {
  return (
    <div className={`mt-2 border-b border-slate-200 pb-2 ${keepBorderOnLast ? "" : "last:border-b-0"}`}>
      <p className="text-xs text-slate-400">{label}</p>
      <p
        className={`mt-1 text-sm font-semibold leading-[1.35] text-(--color-text-readonly) ${
          multiline ? "whitespace-pre-wrap text-sm font-normal leading-6 text-(--color-text-readonly)" : ""
        }`}
      >
        {value || "-"}
      </p>
    </div>
  );
}

type ClaimDialogProps = {
  open: boolean;
  forms: ClaimDialogForm[];
  activeIndex: number;
  tab: "credential" | "event";
  isSubmitting: boolean;
  finalActionLabel?: string;
  showProgressDots?: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onTabChange: (tab: "credential" | "event") => void;
  onKeyLearningChange: (value: string) => void;
  onPrimaryAction: () => void;
};

export function ClaimDialog({
  open,
  forms,
  activeIndex,
  tab,
  isSubmitting,
  finalActionLabel = "Claim",
  showProgressDots = false,
  onClose,
  onPrev,
  onNext,
  onTabChange,
  onKeyLearningChange,
  onPrimaryAction,
}: ClaimDialogProps) {
  if (!open) {
    return null;
  }
  const claimForm = forms[activeIndex] ?? null;
  if (!claimForm) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/35 p-4">
      {forms.length > 1 ? (
        <button
          type="button"
          onClick={onPrev}
          disabled={activeIndex === 0}
          className="mr-3 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/80 bg-white/95 text-slate-600 shadow-xl disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Previous credential"
        >
          <ChevronLeft size={20} />
        </button>
      ) : null}

      <CredentialEditorDialogShell
        title="Medalverse Credential"
        subtitle="Don't worry - you can edit all information later."
        onClose={onClose}
        body={
          <>
          <div className="mb-4 flex justify-center">
            <div className="flex h-[172px] w-[172px] items-center justify-center rounded-full border-4 border-white bg-[#98bbdf] shadow-[0_12px_30px_rgba(59,130,246,0.18)]">
              <Image src="/app/assets/icons/cone.svg" alt="Cone" width={86} height={86} className="h-[86px] w-[86px] object-contain" />
            </div>
          </div>

          <div className="mb-4 flex items-center gap-2 border-b border-slate-300 text-sm">
            <button
              type="button"
              onClick={() => onTabChange("credential")}
              className={`relative rounded-lg px-3 pb-2 pt-1 font-medium transition duration-300 ${
                tab === "credential" ? "text-[#3C7ACB]" : "text-[#9E9E9E] hover:text-[#3C7ACB]"
              }`}
            >
              Credential Details
              <span
                className={`absolute inset-x-2 -bottom-[1px] h-0.5 origin-left rounded-full bg-[#3C7ACB] transition-transform duration-300 ${
                  tab === "credential" ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </button>
            <button
              type="button"
              onClick={() => onTabChange("event")}
              className={`relative rounded-lg px-3 pb-2 pt-1 font-medium transition duration-300 ${
                tab === "event" ? "text-[#3C7ACB]" : "text-[#9E9E9E] hover:text-[#3C7ACB]"
              }`}
            >
              Event Details
              <span
                className={`absolute inset-x-2 -bottom-[1px] h-0.5 origin-left rounded-full bg-[#3C7ACB] transition-transform duration-300 ${
                  tab === "event" ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </button>
          </div>

          {tab === "credential" ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <span className="inline-flex rounded-md border border-blue-200 px-2 py-0.5 text-xs font-medium text-brand-primary-400">
                {claimForm.credentialCode}
              </span>
              <p className="text-lg mt-2 font-display font-medium leading-[1.1] text-(--color-text-readonly) md:text-[16px]">
                {claimForm.credentialName}
              </p>

              <ClaimField label="Recipient Name" value={claimForm.recipientName} />
              <div className="mt-2 grid grid-cols-2 gap-4">
                <ClaimField label="Credential Category" value={claimForm.credentialCategory} />
                <ClaimField label="Organization Abbreviation" value={claimForm.organizationAbbreviation} keepBorderOnLast />
              </div>
              <ClaimField label="Organization Name" value={claimForm.organizationName} />
              <div className="mt-2 grid grid-cols-2 gap-4">
                <ClaimField label="Rank" value={claimForm.rank} />
                <ClaimField label="Issue Date" value={claimForm.issueDate} keepBorderOnLast />
              </div>
              <div className="mt-2 border-b border-slate-200 pb-2 last:border-b-0">
                <p className="text-xs text-slate-400">Key Learning</p>
                <textarea
                  value={claimForm.keyLearning}
                  onChange={(event) => onKeyLearningChange(event.target.value)}
                  placeholder="What knowledge or skill did you acquire from this experience?"
                  className="mt-1 min-h-[96px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-(--color-text-readonly) outline-none transition focus:border-blue-300 focus:bg-white"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <ClaimField label="Event Name" value={claimForm.eventName} />
              <ClaimField label="Held During" value={`${claimForm.heldStartDate} - ${claimForm.heldEndDate}`} />
              <ClaimField label="Venue" value={claimForm.venue} />
              <div className="mt-2 grid grid-cols-2 gap-4">
                <ClaimField label="Activity Type" value={claimForm.activityType} />
                <ClaimField label="Event Field" value={claimForm.eventField} keepBorderOnLast />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <ClaimField label="Participation Mode" value={claimForm.participationMode} />
                <ClaimField label="Competition Level" value={claimForm.competitionLevel} keepBorderOnLast />
              </div>
              <ClaimField label="Event Description" value={claimForm.eventDescription} multiline />
            </div>
          )}
          </>
        }
        footer={
          <>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-7 text-sm font-medium text-(--color-text-readonly)"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onPrimaryAction}
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#030303] px-7 text-sm font-semibold text-white transition hover:bg-[#434343] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            {tab === "credential" ? "Next" : isSubmitting ? `${finalActionLabel}ing...` : finalActionLabel}
          </button>
          </>
        }
      />

      {forms.length > 1 ? (
        <button
          type="button"
          onClick={onNext}
          disabled={activeIndex >= forms.length - 1}
          className="ml-3 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/80 bg-white/95 text-slate-600 shadow-xl disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Next credential"
        >
          <ChevronRight size={20} />
        </button>
      ) : null}

      {showProgressDots && forms.length > 1 ? (
        <div className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2">
          {forms.map((_, index) => (
            <span
              key={`claim-dot-${index}`}
              className={`h-2 w-2 rounded-full transition-colors ${index === activeIndex ? "bg-[#3b82f6]" : "bg-slate-300"}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ClaimSuccessModal({
  open,
  badgeCount = 0,
  onClose,
}: {
  open: boolean;
  badgeCount?: number;
  onClose: () => void;
}) {
  return (
    <CredentialSuccessDialog
      open={open}
      onClose={onClose}
      badgeCount={badgeCount}
      buttonLabel="View Credential"
      buttonHref="/credentials-cloud/credentials"
    />
  );
}

export function ClaimToastBanner({ toast, onClose }: { toast: ClaimToast | null; onClose: () => void }) {
  return <AppToast toast={toast} onClose={onClose} />;
}
