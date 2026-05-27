import React, { useMemo, useState } from "react";
import { CircleHelp, CircleAlert, Trash, ArrowRight, CircleStar, Medal, Trophy, FileBadge } from "lucide-react";
import { Modal } from "./ModalFormUI";
import { CredentialItem } from "@/modules/credentials/domain/credential.types";
import { ClaimDialog, ClaimSuccessModal } from "@/modules/experience/presentation/components/claim-dialog";
import { ClaimDialogForm } from "@/modules/experience/presentation/experience-content.types";
import { withBackendAuthHeaders } from "@/shared/auth/backend-access-token.client"; 

type MedalverseCodeEntry = {
  code: string;
  credentialCode: string;
  recipientName: string; 
  credentialName: string;
  credentialCategory: "Certificate" | "Trophy" | "Medal" | "Badge";
  organizationAbbreviation: string;
  organizationName: string;
  rank: string;
  issueDate: string;
  keyLearning: string;
  visibility: "public" | "private";
  eventId: string;                 
  eventName: string;
  heldStartDate: string;
  heldEndDate: string;
  venue: string;
  activityType: string;
  eventField: string;
  participationMode: string;
  competitionLevel: string;
  eventDescription: string;
};

const USED_CODES_STORAGE_KEY = "medalverse.used.codes.v1";

const MEDALVERSE_CODE_CATALOG: Record<string, Omit<MedalverseCodeEntry, "code">> = {
  MDV2026UX01: {
    credentialCode: "MDV2026UX01",
    recipientName: "Daniel Lee",
    credentialName: "UX Research Excellence Award",
    credentialCategory: "Certificate",
    organizationAbbreviation: "MIT",
    organizationName: "Massachusetts Institute of Technology",
    rank: "Top Research Project",
    issueDate: "2025-12-24",
    keyLearning: "Applied user interview synthesis and usability testing in real product scenarios.",
    visibility: "public",
    eventId: "3c52edcf-a974-482b-916f-7078fb4256da",
    eventName: "UX Research for Digital Products",
    heldStartDate: "2025-12-24",
    heldEndDate: "2025-12-24",
    venue: "Bangkok, Thailand",
    activityType: "Workshop",
    eventField: "Business & Economics",
    participationMode: "Onsite",
    competitionLevel: "Local / District Level",
    eventDescription: "Intensive workshop focused on user research and applied product discovery.",
  },
  MDV2026AI02: {
    credentialCode: "MDV2026AI02",
    recipientName: "Daniel Lee",
    credentialName: "Global AI Innovation Award",
    credentialCategory: "Medal",
    organizationAbbreviation: "MV",
    organizationName: "Medalverse",
    rank: "Finalist",
    issueDate: "2026-01-28",
    keyLearning: "Built transformer-based NLP prototype and presented end-to-end model evaluation.",
    visibility: "public",
    eventId: "3c52edcf-a974-482b-916f-7078fb4256da",
    eventName: "Global AI Innovation Challenge 2026",
    heldStartDate: "2026-01-27",
    heldEndDate: "2026-01-28",
    venue: "Online Event",
    activityType: "Bootcamp",
    eventField: "Engineering & Technology",
    participationMode: "Online",
    competitionLevel: "National Level",
    eventDescription: "National challenge for practical AI innovation with panel judging and final showcase.",
  },
  MDV2026DS03: {
    credentialCode: "MDV2026DS03",
    recipientName: "Daniel Lee",
    credentialName: "Data Science Summit Champion",
    credentialCategory: "Trophy",
    organizationAbbreviation: "TU",
    organizationName: "Thammasat University",
    rank: "1st Place",
    issueDate: "2026-04-03",
    keyLearning: "Designed and deployed analytics pipeline for production-like data quality monitoring.",
    visibility: "public",
    eventId: "3c52edcf-a974-482b-916f-7078fb4256da",
    eventName: "Data Analytics with Python",
    heldStartDate: "2026-04-03",
    heldEndDate: "2026-04-03",
    venue: "Chiang Mai, Thailand",
    activityType: "Short Course",
    eventField: "Science & Research",
    participationMode: "Onsite",
    competitionLevel: "Provincial / City Level",
    eventDescription: "Hands-on summit on Python analytics workflows and real-world dataset problem solving.",
  },
  MDV2026WD04: {
    credentialCode: "MDV2026WD04",
    recipientName: "Daniel Lee",
    credentialName: "Web Development Bootcamp Completion",
    credentialCategory: "Badge",
    organizationAbbreviation: "CU",
    organizationName: "Chulalongkorn University",
    rank: "Completion",
    issueDate: "2026-06-15",
    keyLearning: "Completed full-stack web development bootcamp with project-based learning.",
    visibility: "public",
    eventId: "3c52edcf-a974-482b-916f-7078fb4256da",
    eventName: "Full-Stack Web Development Bootcamp",
    heldStartDate: "2026-06-01",
    heldEndDate: "2026-06-15",
    venue: "Bangkok, Thailand",
    activityType: "Bootcamp",
    eventField: "Engineering & Technology",
    participationMode: "Onsite",
    competitionLevel: "University Level",
    eventDescription: "Intensive bootcamp covering front-end and back-end web development technologies.",
  },
  MDV2026PM05: {
    credentialCode: "MDV2026PM05",
    recipientName: "Daniel Lee",
    credentialName: "Project Management Professional",
    credentialCategory: "Certificate",
    organizationAbbreviation: "PMI",
    organizationName: "Project Management Institute",
    rank: "Certified",
    issueDate: "2026-08-20",
    keyLearning: "Earned PMP certification demonstrating expertise in project management principles.",
    visibility: "public",
    eventId: "3c52edcf-a974-482b-916f-7078fb4256da",
    eventName: "PMP Certification Exam",
    heldStartDate: "2026-08-20",
    heldEndDate: "2026-08-20",
    venue: "Online Proctored Exam",
    activityType: "Certification Exam",
    eventField: "Business & Economics",
    participationMode: "Online",
    competitionLevel: "Global Certification",
    eventDescription: "Globally recognized certification for project management professionals.",
  },
  MDV2026PM06: {
    credentialCode: "MDV2026PM06",
    recipientName: "Daniel Lee",
    credentialName: "Agile Project Management Certification",
    credentialCategory: "Badge",
    organizationAbbreviation: "Scrum Alliance",
    organizationName: "Scrum Alliance",
    rank: "Certified",
    issueDate: "2026-10-10",
    keyLearning: "Certified in Agile project management methodologies and Scrum framework.",
    visibility: "public",
    eventId: "3c52edcf-a974-482b-916f-7078fb4256da",
    eventName: "Agile Project Management Certification",
    heldStartDate: "2026-10-10",
    heldEndDate: "2026-10-10",
    venue: "Online Proctored Exam",
    activityType: "Certification Exam",
    eventField: "Business & Economics",
    participationMode: "Online",
    competitionLevel: "Global Certification",
    eventDescription: "Certification for professionals in Agile project management and Scrum practices.",
  },
  MDV2026PM07: {
    credentialCode: "MDV2026PM07",
    recipientName: "Daniel Lee",
    credentialName: "Lean Six Sigma Green Belt",
    credentialCategory: "Medal",
    organizationAbbreviation: "ASQ",
    organizationName: "American Society for Quality",
    rank: "Certified",
    issueDate: "2026-11-05",
    keyLearning: "Certified in Lean Six Sigma Green Belt for process improvement expertise.",
    visibility: "public",
    eventId: "3c52edcf-a974-482b-916f-7078fb4256da",
    eventName: "Lean Six Sigma Green Belt Certification",
    heldStartDate: "2026-11-05",
    heldEndDate: "2026-11-05",
    venue: "Online Proctored Exam",
    activityType: "Certification Exam",
    eventField: "Business & Economics",
    participationMode: "Online",
    competitionLevel: "Global Certification",
    eventDescription: "Certification for professionals in Lean Six Sigma process improvement methodologies.",
  },
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (claimedItems: CredentialItem[]) => void;
};

function getCategoryChipMeta(category: MedalverseCodeEntry["credentialCategory"]) {
  if (category === "Trophy") {
    return { Icon: Trophy, label: "Trophy" };
  }
  if (category === "Medal") {
    return { Icon: Medal, label: "Medal" };
  }
  if (category === "Badge") {
    return { Icon: CircleStar, label: "Badge" };
  }
  return { Icon: FileBadge, label: "Certificate" };
}

function mapClaimEntryToForm(entry: MedalverseCodeEntry): ClaimDialogForm {
  return {
    credentialCode: entry.credentialCode,
    recipientName: entry.recipientName,
    credentialName: entry.credentialName,
    credentialCategory: entry.credentialCategory,
    organizationAbbreviation: entry.organizationAbbreviation,
    organizationName: entry.organizationName,
    rank: entry.rank,
    issueDate: entry.issueDate,
    keyLearning: entry.keyLearning,
    eventName: entry.eventName,
    heldStartDate: entry.heldStartDate,
    heldEndDate: entry.heldEndDate,
    venue: entry.venue,
    activityType: entry.activityType,
    eventField: entry.eventField,
    participationMode: entry.participationMode,
    competitionLevel: entry.competitionLevel,
    eventDescription: entry.eventDescription,
    visibility: entry.visibility,
    eventId: entry.eventId,
  };
}

export function MedalverseModal({ isOpen, onClose, onSuccess }: Props) {
  const [medalverseCode, setMedalverseCode] = useState("");
  const [medalverseCodeError, setMedalverseCodeError] = useState<string | null>(null);
  const [medalverseClaims, setMedalverseClaims] = useState<MedalverseCodeEntry[]>([]);

  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [showClaimSuccessModal, setShowClaimSuccessModal] = useState(false);
  const [claimDialogTab, setClaimDialogTab] = useState<"credential" | "event">("credential");
  const [claimForms, setClaimForms] = useState<ClaimDialogForm[]>([]);
  const [claimIndex, setClaimIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [usedCodes, setUsedCodes] = useState<string[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    const raw = window.localStorage.getItem(USED_CODES_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.map((code) => String(code).toUpperCase());
    } catch {
      return [];
    }
  });

  const usedCodeSet = useMemo(() => new Set(usedCodes), [usedCodes]);

  if (!isOpen && !showClaimDialog && !showClaimSuccessModal) {
    return null;
  }

  function persistUsedCodes(nextCodes: string[]) {
    setUsedCodes(nextCodes);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(USED_CODES_STORAGE_KEY, JSON.stringify(nextCodes));
    }
  }

  function resetState() {
    setMedalverseCode("");
    setMedalverseCodeError(null);
    setMedalverseClaims([]);
    setShowClaimDialog(false);
    setShowClaimSuccessModal(false);
    setClaimDialogTab("credential");
    setClaimForms([]);
    setClaimIndex(0);
    setIsSubmitting(false);
    setSuccessCount(0);
  }

  function applyMedalverseCode() {
    const code = medalverseCode.trim().toUpperCase();
    if (!code) {
      setMedalverseCodeError("Please enter Medalverse code.");
      return;
    }

    if (usedCodeSet.has(code)) {
      setMedalverseCodeError("This code has already been used.");
      return;
    }

    if (medalverseClaims.some((item) => item.code === code)) {
      setMedalverseCodeError("This code has already been added.");
      return;
    }

    const found = MEDALVERSE_CODE_CATALOG[code];
    if (!found) {
      setMedalverseCodeError("The code you entered doesn't exist.");
      return;
    }

    setMedalverseCodeError(null);
    setMedalverseClaims((prev) => [...prev, { code, ...found }]);
    setMedalverseCode("");
  }

  function removeMedalverseClaim(code: string) {
    setMedalverseClaims((prev) => prev.filter((item) => item.code !== code));
  }

  function continueMedalverseClaim() {
    if (medalverseClaims.length === 0) {
      return;
    }
    setClaimForms(medalverseClaims.map(mapClaimEntryToForm));
    setClaimIndex(0);
    setClaimDialogTab("credential");
    setShowClaimDialog(true);
  }

  function closeAll() {
    resetState();
    onClose();
  }

  async function submitClaims() {
    if (claimForms.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const postRequests = claimForms.map((form) => {
        return fetch("/app/api/credentials", {
          method: "POST",
          headers: withBackendAuthHeaders({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            recipientName: form.recipientName,
            credentialName: form.credentialName,
            credentialCategory: form.credentialCategory,
            organizationAbbreviation: form.organizationAbbreviation,
            organizationName: form.organizationName,
            rank: form.rank,
            issueDate: form.issueDate,
            keyLearning: form.keyLearning,
            visibility: form.visibility,
            eventId: form.eventId || undefined,
            eventField: form.eventField,
          }),
        }).then((res) => res.json());
      });

      const results = await Promise.all(postRequests);

      const failed = results.find((res) => !res.success);
      if (failed) {
        console.error("Some credentials failed to save:", failed.error);
        setIsSubmitting(false);
        return;
      }

      const claimedItems: CredentialItem[] = results.map((res) => res.data);

      const nextUsedCodes = Array.from(
        new Set([...usedCodes, ...medalverseClaims.map((item) => item.code.toUpperCase())]),
      );
      persistUsedCodes(nextUsedCodes);

      onSuccess(claimedItems);

      setSuccessCount(claimedItems.length);
      setShowClaimDialog(false);
      setShowClaimSuccessModal(true);
    } catch (error) {
      console.error("Error submitting claims to API:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handlePrimaryClaimAction() {
    if (claimDialogTab === "credential") {
      setClaimDialogTab("event");
      return;
    }

    if (claimIndex < claimForms.length - 1) {
      setClaimIndex((prev) => prev + 1);
      setClaimDialogTab("credential");
      return;
    }

    submitClaims();
  }

  function handleKeyLearningChange(value: string) {
    setClaimForms((prev) => prev.map((item, index) => (index === claimIndex ? { ...item, keyLearning: value } : item)));
  }

  return (
    <>
      {isOpen && !showClaimDialog && !showClaimSuccessModal ? (
        <Modal onClose={closeAll} contentClassName="max-w-[1080px] p-0">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div className="relative group inline-flex items-center gap-1.5">
              <h3 className="text-[22px] font-medium leading-none text-slate-800">Add Medalverse Credentials</h3>
              <button
                type="button"
                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="About Medalverse credentials"
              >
                <CircleHelp size={14} />
              </button>
              <div className="pointer-events-none absolute -top-2 left-0 z-30 w-[420px] -translate-y-full rounded-xl border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700 opacity-0 shadow-xl transition group-hover:opacity-100">
                A Medalverse Credential is a verified achievement earned from experiences in the Experience Hub hosted by Medalverse, its partners, or licensed organizations, issued with a unique Medalverse Code that users can store in the Credential Cloud for multiple uses, or access via notifications or the redeem section in the Experience Hub.
              </div>
            </div>
          </div>

          <div className="px-6 py-4">
            <div
              className={`flex items-center gap-2 rounded-xl border bg-white p-2 transition ${
                medalverseCodeError
                  ? "border-rose-300"
                  : "border-slate-200 hover:border-[#4A90E2] focus-within:border-[#4A90E2] focus-within:shadow-[0_0_0_4px_rgba(74,144,226,0.24)]"
              }`}
            >
              <input
                value={medalverseCode}
                onChange={(event) => {
                  setMedalverseCode(event.target.value);
                  setMedalverseCodeError(null);
                }}
                placeholder="Enter Medalverse Code"
                className="h-11 w-full border-0 bg-transparent px-1 text-base text-slate-700 outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={applyMedalverseCode}
                className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-[#4A90E2] bg-white px-4 text-sm font-medium text-[#3C7ACB] transition hover:bg-[#EEF5FC]"
              >
                Apply Code
              </button>
            </div>

            {medalverseCodeError ? (
              <p className="mt-2 inline-flex items-center gap-1 text-xs text-rose-600">
                <CircleAlert size={12} />
                {medalverseCodeError}
              </p>
            ) : null}

            {medalverseClaims.length > 0 ? (
              <div className="mt-3 max-h-[320px] overflow-y-auto rounded-xl border border-slate-200 bg-white">
                {medalverseClaims.map((claim) => {
                  const categoryMeta = getCategoryChipMeta(claim.credentialCategory);
                  const CategoryIcon = categoryMeta.Icon;

                  return (
                    <div key={claim.code} className="flex items-center justify-between border-b border-slate-100 px-5 py-3 last:border-b-0">
                      <div>
                        <p className="text-[18px] font-medium leading-tight text-slate-700">{claim.eventName}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="rounded-md border border-[#BDD7F4] px-2.5 py-1 text-sm font-normal text-[#3C7ACB]">
                            {claim.code}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-slate-300" />
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#BDD7F4] bg-[#EEF5FC] px-2.5 py-1 text-sm font-normal text-[#3C7ACB]">
                            <CategoryIcon size={14} />
                            {categoryMeta.label}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMedalverseClaim(claim.code)}
                        className="inline-flex h-10 w-10 items-center justify-center text-rose-500 transition hover:text-rose-600"
                        aria-label={`Remove ${claim.code}`}
                      >
                        <Trash size={22} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-8 text-lg font-medium text-slate-700 transition-colors hover:bg-slate-50"
              onClick={closeAll}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={continueMedalverseClaim}
              disabled={medalverseClaims.length === 0}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#272727] px-8 text-lg font-medium text-white transition-colors hover:bg-[#434343] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              Continue
              <ArrowRight size={18} />
            </button>
          </div>
        </Modal>
      ) : null}

      <ClaimDialog
        open={showClaimDialog}
        forms={claimForms}
        activeIndex={claimIndex}
        tab={claimDialogTab}
        isSubmitting={isSubmitting}
        finalActionLabel="Public"
        showProgressDots
        onClose={closeAll}
        onPrev={() => {
          if (claimIndex <= 0) {
            return;
          }
          setClaimIndex((prev) => prev - 1);
          setClaimDialogTab("credential");
        }}
        onNext={() => {
          if (claimIndex >= claimForms.length - 1) {
            return;
          }
          setClaimIndex((prev) => prev + 1);
          setClaimDialogTab("credential");
        }}
        onTabChange={setClaimDialogTab}
        onKeyLearningChange={handleKeyLearningChange}
        onPrimaryAction={handlePrimaryClaimAction}
      />

      <ClaimSuccessModal
        open={showClaimSuccessModal}
        badgeCount={successCount > 1 ? successCount : 0}
        onClose={closeAll}
      />
    </>
  );
}