"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, CircleAlert, ImagePlus, Pen, Trash, X } from "lucide-react";
import { withBackendAuthHeaders } from "@/shared/auth/backend-access-token.client";
import { apiPath } from "@/shared/constants/routes";
import { CredentialDetail, CredentialItem } from "@/modules/credentials/domain/credential.types";
import { DropdownSelect } from "@/components/ui";
import { getMockEventImages } from "@/modules/experience/presentation/mock-event-images";

type EditableCredentialDraft = {
  title: string;
  recipientName: string;
  credentialId: string;
  credentialCategory: string;
  organizationAbbreviation: string;
  organizationName: string;
  rank: string;
  issueDate: string;
  keyLearning: string;
  visibility: "public" | "private";
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

type Props = {
  open: boolean;
  credentialId: string | null;
  fallbackItem?: CredentialItem | null;
  onClose: () => void;
  onToast: (type: "success" | "error", message: string, title?: string) => void;
  onSaved?: () => void;
};

function draftFromDetail(detail: CredentialDetail): EditableCredentialDraft {
  return {
    title: detail.credential.title,
    recipientName: detail.recipientName,
    credentialId: detail.credentialId,
    credentialCategory: detail.credentialCategory,
    organizationAbbreviation: detail.organizationAbbreviation,
    organizationName: detail.organizationName,
    rank: detail.rank,
    issueDate: detail.issueDate,
    keyLearning: detail.keyLearning,
    visibility: "public",
    eventName: detail.credential.title,
    heldStartDate: detail.issueDate,
    heldEndDate: detail.issueDate,
    venue: "Online Event",
    activityType: "Workshop",
    eventField: "Science & Research",
    participationMode: "Online",
    competitionLevel: "Regional/State",
    eventDescription: detail.credential.description,
  };
}

function draftFromItem(item: CredentialItem): EditableCredentialDraft {
  return {
    title: item.title,
    recipientName: "Daniel Lee",
    credentialId: item.id.toUpperCase(),
    credentialCategory: item.type,
    organizationAbbreviation: "",
    organizationName: item.organization,
    rank: "",
    issueDate: item.issuedOn,
    keyLearning: item.description || "",
    visibility: "public",
    eventName: item.title,
    heldStartDate: item.issuedOn,
    heldEndDate: item.issuedOn,
    venue: "",
    activityType: "",
    eventField: "",
    participationMode: "",
    competitionLevel: "",
    eventDescription: item.description || "",
  };
}

function Field({
  label,
  value,
  onChange,
  className,
  multiline = false,
  labelClassName,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  multiline?: boolean;
  labelClassName?: string;
  readOnly?: boolean;
}) {
  return (
    <label className={`block border-b border-border-border-primary pb-2 pt-2 ${className ?? ""}`}>
      <span className={`text-xs font-medium ${labelClassName ?? "text-[#94A3B8]"}`}>{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          readOnly={readOnly}
          className={`mt-1 w-full resize-y rounded-xl border border-border-border-primary bg-background-bg-active px-3 py-2 text-sm text-[#545454] outline-none ${readOnly ? "cursor-not-allowed opacity-90" : ""}`}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          readOnly={readOnly}
          className={`mt-1 w-full border-0 bg-transparent p-0 text-sm font-semibold text-[#545454] outline-none ${readOnly ? "cursor-not-allowed opacity-90" : ""}`}
        />
      )}
    </label>
  );
}

export function CredentialDetailDialog({
  open,
  credentialId,
  fallbackItem = null,
  onClose,
  onToast,
  onSaved,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<"credential" | "event">("credential");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<EditableCredentialDraft | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [eventImages, setEventImages] = useState<string[]>([]);
  const [replaceImageIndex, setReplaceImageIndex] = useState<number | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isEditingKeyLearning, setIsEditingKeyLearning] = useState(false);
  const [isEditingVisibility, setIsEditingVisibility] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingCredential, setDeletingCredential] = useState(false);

  const addImagesInputRef = useRef<HTMLInputElement>(null);
  const replaceImageInputRef = useRef<HTMLInputElement>(null);

  const initializedRef = useRef(false);
  const lastSavedRef = useRef<string>("");
  const onToastRef = useRef(onToast);
  const onSavedRef = useRef(onSaved);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    onToastRef.current = onToast;
  }, [onToast]);

  useEffect(() => {
    onSavedRef.current = onSaved;
  }, [onSaved]);

  useEffect(() => {
    if (!open || !credentialId) {
      setDraft(null);
      setLoadError(null);
      setEventImages([]);
      setPreviewOpen(false);
      initializedRef.current = false;
      lastSavedRef.current = "";
      setTab("credential");
      setIsEditingKeyLearning(false);
      setIsEditingVisibility(false);
      setShowDeleteConfirmDialog(false);
      setDeleteConfirmText("");
      setDeletingCredential(false);
      return;
    }

    const canUseFallback = Boolean(fallbackItem && fallbackItem.id === credentialId);
    if (canUseFallback && fallbackItem) {
      const fallbackDraft = draftFromItem(fallbackItem);
      setDraft(fallbackDraft);
      lastSavedRef.current = JSON.stringify(fallbackDraft);
      initializedRef.current = true;
      setLoadError(null);
    } else {
      setLoadError(null);
    }

    const controller = new AbortController();

    async function loadDetail() {
      try {
        setLoading(true);
        const response = await fetch(apiPath(`/api/credentials/${credentialId}`), {
          signal: controller.signal,
          cache: "no-store",
          headers: withBackendAuthHeaders(),
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.success) {
          if (!initializedRef.current && !canUseFallback) {
            onToastRef.current("error", payload?.error ?? "Unable to load credential detail");
            setLoadError(payload?.error ?? "Unable to load credential detail");
          }
          return;
        }

        const nextDraft = draftFromDetail(payload.data as CredentialDetail);
        setDraft(nextDraft);
        lastSavedRef.current = JSON.stringify(nextDraft);
        initializedRef.current = true;
      } catch {
        if (controller.signal.aborted) {
          return;
        }
        if (!initializedRef.current && !canUseFallback) {
          onToastRef.current("error", "Unable to load credential detail");
          setLoadError("Unable to load credential detail");
        }
      } finally {
        setLoading(false);
      }
    }

    void loadDetail();
    return () => controller.abort();
  }, [open, credentialId, fallbackItem]);

  useEffect(() => {
    const mockImages = getMockEventImages(draft?.eventName);
    setEventImages(mockImages ? mockImages.slice(0, 7) : []);
  }, [credentialId, draft?.eventName]);

  const draftSnapshot = useMemo(() => (draft ? JSON.stringify(draft) : ""), [draft]);

  useEffect(() => {
    if (!previewOpen || eventImages.length === 0) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewOpen(false);
      } else if (event.key === "ArrowLeft") {
        setPreviewIndex((current) => (current - 1 + eventImages.length) % eventImages.length);
      } else if (event.key === "ArrowRight") {
        setPreviewIndex((current) => (current + 1) % eventImages.length);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewOpen, eventImages.length]);

  useEffect(() => {
    if (!open || !credentialId || !draft || !initializedRef.current) {
      return;
    }
    if (draftSnapshot === lastSavedRef.current) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSaving(true);
        const response = await fetch(apiPath(`/api/credentials/${credentialId}`), {
          method: "PATCH",
          headers: withBackendAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ draft }),
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.success) {
          onToastRef.current("error", payload?.error ?? "Auto-save failed");
          return;
        }
        lastSavedRef.current = draftSnapshot;
        onSavedRef.current?.();
      } catch {
        onToastRef.current("error", "Auto-save failed");
      } finally {
        setSaving(false);
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [open, credentialId, draft, draftSnapshot]);

  async function readImageFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) {
      return [] as string[];
    }
    const files = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
    const dataUrls = await Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result ?? ""));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          }),
      ),
    );
    return dataUrls.filter(Boolean);
  }

  async function handleAddEventImages(fileList: FileList | null) {
    const images = await readImageFiles(fileList);
    if (!images.length) {
      return;
    }
    setEventImages((prev) => [...prev, ...images].slice(0, 7));
  }

  async function handleReplaceEventImage(fileList: FileList | null) {
    if (replaceImageIndex === null) {
      return;
    }
    const images = await readImageFiles(fileList);
    if (!images.length) {
      return;
    }
    setEventImages((prev) => {
      const next = [...prev];
      next[replaceImageIndex] = images[0];
      return next;
    });
    setReplaceImageIndex(null);
  }

  function handleDeleteEventImage(index: number) {
    setEventImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (previewOpen) {
        if (next.length === 0) {
          setPreviewOpen(false);
        } else {
          setPreviewIndex((current) => Math.max(0, Math.min(current, next.length - 1)));
        }
      }
      return next;
    });
  }

  function openPreview(index: number) {
    setPreviewIndex(index);
    setPreviewOpen(true);
  }

  function showPrevPreviewImage() {
    if (!eventImages.length) {
      return;
    }
    setPreviewIndex((current) => (current - 1 + eventImages.length) % eventImages.length);
  }

  function showNextPreviewImage() {
    if (!eventImages.length) {
      return;
    }
    setPreviewIndex((current) => (current + 1) % eventImages.length);
  }

  const rightImages = eventImages.slice(1, 7);

  if (!open || !mounted) {
    return null;
  }

  const onShare = async () => {
    if (!credentialId || !draft) {
      return;
    }

    try {
      const shareDetail: CredentialDetail = {
        credential: {
          id: credentialId,
          type: draft.credentialCategory || "Trophy",
          title: draft.title || draft.eventName || "Credential",
          description: draft.eventDescription || draft.keyLearning || "",
          issuedOn: draft.issueDate || "",
          organization: draft.organizationName || "",
          isVerified: true,
          category: "events",
          issuerLogo: "/assets/icons/cone.svg",
          coverImage: "/assets/icons/cone.svg",
        },
        recipientName: draft.recipientName || "",
        credentialId: draft.credentialId || "",
        credentialCategory: draft.credentialCategory || "",
        organizationAbbreviation: draft.organizationAbbreviation || "",
        organizationName: draft.organizationName || "",
        rank: draft.rank || "",
        issueDate: draft.issueDate || "",
        expiryDate: "No Expiration",
        keyLearning: draft.keyLearning || "",
        skills: [],
        evidence: [],
        verifyUrl: `https://medalverse.ai/verify/${credentialId}`,
      };

      const encodedPayload = encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(shareDetail)))));
      const url = `${window.location.origin}/credentials-cloud/credentials/${credentialId}?shared=${encodedPayload}`;
      await navigator.clipboard.writeText(url);
      onToast("success", "Credential link copied");
    } catch {
      onToast("error", "Unable to copy link");
    }
  };

  const DELETE_CONFIRM_PHRASE = "I confirm deleting this credential";
  const canConfirmDelete = deleteConfirmText.trim() === DELETE_CONFIRM_PHRASE;

  const onDeleteCredential = async () => {
    if (!credentialId || !canConfirmDelete) {
      return;
    }
    try {
      setDeletingCredential(true);
      const response = await fetch(apiPath(`/api/credentials/${credentialId}`), {
        method: "DELETE",
        headers: withBackendAuthHeaders(),
      });
      const payload = (await response.json().catch(() => null)) as { success?: boolean; error?: string } | null;
      if (!response.ok || !payload?.success) {
        onToast("error", payload?.error ?? "Unable to delete credential", "Delete failed");
        return;
      }
      setShowDeleteConfirmDialog(false);
      setDeleteConfirmText("");
      onSavedRef.current?.();
      onClose();
      onToast("success", "Your changes have been saved.", "Successfully deleted credential");
    } catch {
      onToast("error", "Unable to delete credential", "Delete failed");
    } finally {
      setDeletingCredential(false);
    }
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/30">
        <div className="font-body w-full max-w-[700px] overflow-hidden rounded-2xl border border-border-border-primary bg-white shadow-2xl">
          <div className="flex items-start justify-between border-b border-border-border-primary px-5 py-3">
            <div>
              <h3 className="mt-5 text-[22px] leading-none font-medium text-slate-800">Medalverse Credential</h3>
              <p className="mt-3 text-sm text-slate-500">Don&apos;t worry - you can edit all information later.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <X size={16} />
            </button>
          </div>

          <div className="max-h-[68vh] overflow-y-auto bg-background-bg-brand-primary px-5 pb-5 pt-4">
            {tab === "event" ? (
              <div className="mb-4">
                <p className="text-sm font-medium text-[#545454]">Event Images</p>
                <p className="mt-1 text-xs text-[#94A3B8]">Upload images from when you attended this event.</p>

                {eventImages.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => addImagesInputRef.current?.click()}
                    className="mt-3 flex h-[132px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-border-border-primary bg-white/70 text-center"
                  >
                    <ImagePlus size={36} className="text-slate-400" />
                    <p className="mt-2 text-[14px] text-slate-700">
                      <span className="font-semibold text-blue-600 underline">Click to upload</span> or drag and drop
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">SVG, PNG, JPG or GIF</p>
                    <p className="text-[11px] text-slate-400">(max. 800x400px)</p>
                  </button>
                ) : (
                  <div className="mt-3 flex gap-3">
                    <div
                      className="group relative h-[232px] w-[46%] shrink-0 overflow-hidden rounded-lg"
                      role="button"
                      tabIndex={0}
                      onClick={() => openPreview(0)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          openPreview(0);
                        }
                      }}
                    >
                      <Image src={eventImages[0]} alt="Event image 1" fill className="object-cover" />
                      <div className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/30" />
                      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setReplaceImageIndex(0);
                            replaceImageInputRef.current?.click();
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#757575] text-white backdrop-blur-sm hover:bg-[#5f5f5f]"
                        >
                          <Pen size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeleteEventImage(0);
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#757575] text-white backdrop-blur-sm hover:bg-[#5f5f5f]"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="grid flex-1 grid-cols-3 gap-3">
                      {rightImages.map((image, idx) => {
                        const imageIndex = idx + 1;
                        return (
                          <div
                            key={`event-image-${imageIndex}`}
                            className="group relative h-[110px] overflow-hidden rounded-lg"
                            role="button"
                            tabIndex={0}
                            onClick={() => openPreview(imageIndex)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                openPreview(imageIndex);
                              }
                            }}
                          >
                            <Image src={image} alt={`Event image ${imageIndex + 1}`} fill className="object-cover" />
                            <div className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/30" />
                            <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setReplaceImageIndex(imageIndex);
                                  replaceImageInputRef.current?.click();
                                }}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#757575] text-white backdrop-blur-sm hover:bg-[#5f5f5f]"
                              >
                                <Pen size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleDeleteEventImage(imageIndex);
                                }}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#757575] text-white backdrop-blur-sm hover:bg-[#5f5f5f]"
                              >
                                <Trash size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {eventImages.length < 7 ? (
                        <button
                          type="button"
                          onClick={() => addImagesInputRef.current?.click()}
                          className="flex h-[110px] items-center justify-center rounded-lg border border-dashed border-border-border-primary bg-white/70 text-slate-400 hover:text-slate-500"
                          aria-label="Upload event image"
                        >
                          <ImagePlus size={28} />
                        </button>
                      ) : null}
                    </div>
                  </div>
                )}

                <input
                  ref={addImagesInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    void handleAddEventImages(event.target.files);
                    event.target.value = "";
                  }}
                />
                <input
                  ref={replaceImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    void handleReplaceEventImage(event.target.files);
                    event.target.value = "";
                  }}
                />
              </div>
            ) : (
              <div className="mb-4 flex justify-center">
                <div className="flex h-[172px] w-[172px] items-center justify-center rounded-full border-4 border-white bg-[#98bbdf] shadow-[0_12px_30px_rgba(74,144,226,0.18)]">
                  <Image src="/assets/icons/cone.svg" alt="Cone" width={86} height={86} className="h-[86px] w-[86px] object-contain" />
                </div>
              </div>
            )}

            <div className="mb-4 flex items-center gap-2 border-b border-border-border-primary text-sm">
              <button
                type="button"
                onClick={() => setTab("credential")}
                className={`relative rounded-lg px-3 pb-2 pt-1 font-semibold transition duration-300 ${
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
                onClick={() => setTab("event")}
                className={`relative rounded-lg px-3 pb-2 pt-1 font-semibold transition duration-300 ${
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
              <span className="ml-auto text-xs text-[#94A3B8]">{saving ? "Auto-saving..." : "Auto-saved"}</span>
            </div>

            {loading && !draft ? (
              <div className="rounded-2xl border border-border-border-primary bg-white p-4 text-sm text-text-tertiary">Loading credential detail...</div>
            ) : !draft ? (
              <div className="rounded-2xl border border-border-border-error bg-white p-4 text-sm text-rose-600">
                {loadError ?? "Credential detail is unavailable."}
              </div>
            ) : tab === "credential" ? (
              <div className="rounded-2xl border border-border-border-primary bg-white p-4">
                <span className="inline-flex rounded-lg border border-border-border-brand px-2 py-0.5 text-xs font-medium text-text-brand-primary">
                  {draft.credentialId}
                </span>
                <Field label="Credential Name" value={draft.title} onChange={(value) => setDraft((prev) => (prev ? { ...prev, title: value } : prev))} />
                <Field label="Recipient Name" value={draft.recipientName} onChange={(value) => setDraft((prev) => (prev ? { ...prev, recipientName: value } : prev))} />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Credential Category" value={draft.credentialCategory} onChange={(value) => setDraft((prev) => (prev ? { ...prev, credentialCategory: value } : prev))} />
                  <Field label="Organization Abbreviation" value={draft.organizationAbbreviation} onChange={(value) => setDraft((prev) => (prev ? { ...prev, organizationAbbreviation: value } : prev))} />
                </div>
                <Field label="Organization Name" value={draft.organizationName} onChange={(value) => setDraft((prev) => (prev ? { ...prev, organizationName: value } : prev))} />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Rank" value={draft.rank} onChange={(value) => setDraft((prev) => (prev ? { ...prev, rank: value } : prev))} />
                  <Field label="Issue Date" value={draft.issueDate} onChange={(value) => setDraft((prev) => (prev ? { ...prev, issueDate: value } : prev))} />
                </div>
                <div className="mt-2 border-b border-border-border-primary pb-2 pt-2">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium text-[#94A3B8]">Key Learning</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingKeyLearning((prev) => !prev)}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#6b7280] transition hover:bg-slate-100 hover:text-[#3C7ACB]"
                      aria-label={isEditingKeyLearning ? "Stop editing key learning" : "Edit key learning"}
                    >
                      {isEditingKeyLearning ? <X size={14} /> : <Pen size={14} />}
                    </button>
                  </div>
                  {isEditingKeyLearning ? (
                    <textarea
                      value={draft.keyLearning}
                      onChange={(event) => setDraft((prev) => (prev ? { ...prev, keyLearning: event.target.value } : prev))}
                      rows={4}
                      className="mt-1 w-full resize-y rounded-xl border border-border-border-primary bg-background-bg-active px-3 py-2 text-sm text-[#545454] outline-none transition hover:border-[#4A90E2] focus:border-[#4A90E2] focus:shadow-[0_0_0_4px_rgba(74,144,226,0.24)]"
                    />
                  ) : (
                    <p className="mt-1 text-sm font-semibold text-[#545454]">
                      {draft.keyLearning || "-"}
                    </p>
                  )}
                </div>

                <div className="mt-2 border-b border-border-border-primary pb-2 pt-2">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium text-[#94A3B8]">Visibility</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingVisibility((prev) => !prev)}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#6b7280] transition hover:bg-slate-100 hover:text-[#3C7ACB]"
                      aria-label={isEditingVisibility ? "Stop editing visibility" : "Edit visibility"}
                    >
                      {isEditingVisibility ? <X size={14} /> : <Pen size={14} />}
                    </button>
                  </div>
                  {isEditingVisibility ? (
                    <DropdownSelect
                      value={draft.visibility}
                      onChange={(value) => {
                        setDraft((prev) => (prev ? { ...prev, visibility: value as "public" | "private" } : prev));
                        setIsEditingVisibility(false);
                      }}
                      options={[
                        { value: "public", label: "Public" },
                        { value: "private", label: "Private" },
                      ]}
                      className="mt-1"
                      buttonClassName="rounded-2xl border-border-border-primary px-4 text-md font-medium text-[#545454] focus-visible:ring-0"
                      menuClassName="rounded-2xl border-border-border-primary p-2"
                      selectedOptionClassName="bg-[#EEF5FC] text-[#3C7ACB]"
                      optionClassName="text-[#545454] hover:bg-slate-50"
                    />
                  ) : (
                    <p className="mt-1 text-sm font-semibold text-[#545454]">
                      {draft.visibility === "public" ? "Public" : "Private"}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirmDialog(true)}
                    className="inline-flex h-9 items-center justify-center rounded-xl px-4 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    Delete Credential
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-border-border-primary bg-white p-4">
                <Field label="Event Name" value={draft.eventName} onChange={(value) => setDraft((prev) => (prev ? { ...prev, eventName: value } : prev))} />
                <Field
                  label="Held During"
                  readOnly
                  value={
                    draft.heldStartDate && draft.heldEndDate
                      ? `${draft.heldStartDate} - ${draft.heldEndDate}`
                      : draft.heldStartDate || draft.heldEndDate
                  }
                  onChange={() => {}}
                />
                <Field label="Venue" value={draft.venue} onChange={(value) => setDraft((prev) => (prev ? { ...prev, venue: value } : prev))} />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Activity Type" value={draft.activityType} onChange={(value) => setDraft((prev) => (prev ? { ...prev, activityType: value } : prev))} />
                  <Field label="Event Field" value={draft.eventField} onChange={(value) => setDraft((prev) => (prev ? { ...prev, eventField: value } : prev))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Participation Mode" value={draft.participationMode} onChange={(value) => setDraft((prev) => (prev ? { ...prev, participationMode: value } : prev))} />
                  <Field label="Competition Level" value={draft.competitionLevel} onChange={(value) => setDraft((prev) => (prev ? { ...prev, competitionLevel: value } : prev))} />
                </div>
                <Field
                  multiline
                  label="Event Description"
                  readOnly
                  value={draft.eventDescription}
                  onChange={(value) => setDraft((prev) => (prev ? { ...prev, eventDescription: value } : prev))}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border-border-primary px-5 py-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border-border-primary bg-white px-7 text-sm font-medium text-[#212121]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onShare}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#212121] px-7 text-sm font-semibold text-white transition hover:bg-[#212121]"
            >
              Share
            </button>
          </div>
        </div>
      </div>

      {showDeleteConfirmDialog ? (
        <div className="fixed inset-0 z-[12000] flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-[560px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="px-5 pb-4 pt-5">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-100">
                  <CircleAlert size={16} className="text-rose-500" />
                </div>
              </div>
              <p className="text-lg leading-[1.1] font-semibold text-[#2f3b52]">Are you sure you want to delete this credential?</p>
              <p className="mt-2 text-sm text-[#6b7280]">
                To confirm, type &ldquo;I confirm deleting this credential&rdquo; below.
              </p>
              <input
                value={deleteConfirmText}
                onChange={(event) => setDeleteConfirmText(event.target.value)}
                placeholder={DELETE_CONFIRM_PHRASE}
                className="mt-4 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-700 outline-none transition hover:border-[#4A90E2] focus:border-[#4A90E2] focus:shadow-[0_0_0_4px_rgba(74,144,226,0.24)]"
              />
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirmDialog(false);
                  setDeleteConfirmText("");
                }}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-7 text-sm font-medium text-[#212121]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onDeleteCredential}
                disabled={!canConfirmDelete || deletingCredential}
                className="inline-flex h-9 items-center justify-center rounded-xl bg-[#E11D48] px-7 text-sm font-semibold text-white transition hover:bg-[#E11D48] disabled:cursor-not-allowed disabled:bg-[#F5F5F5] disabled:text-[#A8AFBD]"
              >
                {deletingCredential ? "Deleting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {previewOpen && eventImages.length > 0 ? (
        <div className="fixed inset-0 z-[11000] flex items-center justify-center bg-black/65 p-4" onClick={() => setPreviewOpen(false)}>
          <div className="w-full max-w-[980px]" onClick={(event) => event.stopPropagation()}>
            <div className="relative h-[520px] overflow-hidden rounded-xl border border-white/20 bg-black/40">
              <Image src={eventImages[previewIndex]} alt={`Preview ${previewIndex + 1}`} fill className="object-contain" />
              {eventImages.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={showPrevPreviewImage}
                    className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl bg-black/45 text-white backdrop-blur-sm hover:bg-black/60"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={showNextPreviewImage}
                    className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl bg-black/45 text-white backdrop-blur-sm hover:bg-black/60"
                    aria-label="Next image"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              ) : null}
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black/45 text-white backdrop-blur-sm hover:bg-black/60"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {eventImages.map((img, index) => (
                <button
                  key={`preview-thumb-${index}`}
                  type="button"
                  onClick={() => setPreviewIndex(index)}
                  className={`relative h-16 min-w-24 overflow-hidden rounded-lg border ${
                    index === previewIndex ? "border-blue-400" : "border-white/30"
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>,
    document.body,
  );
}
