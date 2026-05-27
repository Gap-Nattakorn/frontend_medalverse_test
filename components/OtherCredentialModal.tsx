import React, { useEffect, useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { LabeledInput, LabeledTextarea, SearchableSelect, type SearchableSelectOption } from "./ModalFormUI";
import { CredentialEditorDialogShell } from "@/components/ui/CredentialEditorDialogShell";
import { DateInput } from "@/components/ui/DateInput";
import { withBackendAuthHeaders } from "@/shared/auth/backend-access-token.client";
import { apiPath } from "@/shared/constants/routes";
import { EventsApiResponse } from "@/modules/experience/domain/dashboard.types";
import { CredentialItem } from "@/modules/credentials/domain/credential.types";

// --- Types ---
type OtherCredentialForm = {
  recipientName: string;
  credentialName: string;
  credentialCategory: string;
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

// --- Initial State ---
const initialOtherCredentialForm: OtherCredentialForm = {
  recipientName: "Daniel Lee",
  credentialName: "",
  credentialCategory: "",
  organizationAbbreviation: "",
  organizationName: "",
  rank: "",
  issueDate: "",
  keyLearning: "",
  visibility: "public",
  eventId: "",
  eventName: "",
  heldStartDate: "",
  heldEndDate: "",
  venue: "",
  activityType: "",
  eventField: "",
  participationMode: "",
  competitionLevel: "",
  eventDescription: "",
};

// --- Helpers ---
function toDateInputValue(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
}

// --- Component Props ---
type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: { eventItem?: CredentialItem }) => void;
  notifyError: (message: string) => void;
};

function formatDisplayDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "dd/mm/yyyy";
  }
  const dd = String(parsed.getDate()).padStart(2, "0");
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const yyyy = parsed.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function OtherCredentialModal({ isOpen, onClose, onSuccess, notifyError }: Props) {
  // Local states for the multi-step form
  const [tab, setTab] = useState<"credential" | "event">("credential");
  const [form, setForm] = useState<OtherCredentialForm>(initialOtherCredentialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventOptionsLoading, setEventOptionsLoading] = useState(false);
  const [eventOptions, setEventOptions] = useState<Array<{
    id: string;
    title: string;
    date: string;
    location: string;
    type: string;
    field: string;
    level: string;
  }>>([]);
  const [credentialImage, setCredentialImage] = useState<string | null>(null);
  const [eventImages, setEventImages] = useState<string[]>([]);
  const credentialImageInputRef = useRef<HTMLInputElement>(null);
  const eventImagesInputRef = useRef<HTMLInputElement>(null);

  const credentialCategoryOptions: SearchableSelectOption[] = [
    { value: "Badge", label: "Badge" },
    { value: "Certificate", label: "Certificate" },
    { value: "Trophy", label: "Trophy" },
    { value: "Medal", label: "Medal" },
    { value: "Others", label: "Others" },
  ];
  const activityTypeOptions: SearchableSelectOption[] = [
    { value: "Short Course", label: "Short Course" },
    { value: "Bootcamp", label: "Bootcamp" },
    { value: "Workshop", label: "Workshop" },
    { value: "Internship", label: "Internship" },
    { value: "Volunteer Program", label: "Volunteer Program" },
    { value: "Social Event", label: "Social Event" },
    { value: "Competition", label: "Competition" },
    { value: "International Camp", label: "International Camp" },
    { value: "Self-Exploration Camp", label: "Self-Exploration Camp" },
    { value: "Summer Camp", label: "Summer Camp" },
    { value: "Field Trip", label: "Field Trip" },
    { value: "Company Visit", label: "Company Visit" },
  ];
  const eventFieldOptions: SearchableSelectOption[] = [
    { value: "Academic & Intellectual", label: "Academic & Intellectual" },
    { value: "Business & Economics", label: "Business & Economics" },
    { value: "Science & Research", label: "Science & Research" },
    { value: "Engineering & Technology", label: "Engineering & Technology" },
    { value: "Mathematics & Data", label: "Mathematics & Data" },
    { value: "Social Sciences", label: "Social Sciences" },
    { value: "Law, Policy & Governance", label: "Law, Policy & Governance" },
    { value: "Education & Teaching", label: "Education & Teaching" },
    { value: "Creative & Communication", label: "Creative & Communication" },
    { value: "Arts & Design", label: "Arts & Design" },
    { value: "Digital Technology", label: "Digital Technology" },
    { value: "Sports, Wellness & Lifestyle", label: "Sports, Wellness & Lifestyle" },
    { value: "Research & Independent Study", label: "Research & Independent Study" },
    { value: "Cultural & Global Exposure", label: "Cultural & Global Exposure" },
  ];
  const participationModeOptions: SearchableSelectOption[] = [
    { value: "Onsite", label: "Onsite" },
    { value: "Online", label: "Online" },
  ];
  const competitionLevelOptions: SearchableSelectOption[] = [
    { value: "School Level", label: "School Level", description: "Takes place within a single or multiple institutions" },
    { value: "Local / District Level", label: "Local / District Level", description: "Community/Sub-District/District competition" },
    { value: "Provincial / City Level", label: "Provincial / City Level", description: "Province competition / Major city competition" },
    { value: "Regional / State Level", label: "Regional / State Level", description: "Group of provinces / towns / cities" },
    { value: "National Level", label: "National Level", description: "Competition between states / major regions" },
    { value: "International Level", label: "International Level", description: "Competitions between 2+ countries / world championships" },
  ];
  const visibilityOptions: SearchableSelectOption[] = [
    { value: "public", label: "Public" },
    { value: "private", label: "Private" },
  ];

  async function filesToDataUrls(files: File[]) {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const dataUrls = await Promise.all(
      imageFiles.map(
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

  async function handleCredentialImageChange(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) {
      return;
    }
    const [first] = await filesToDataUrls([fileList[0]]);
    if (first) {
      setCredentialImage(first);
    }
  }

  async function handleEventImagesChange(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) {
      return;
    }
    const images = await filesToDataUrls(Array.from(fileList));
    if (!images.length) {
      return;
    }
    setEventImages((prev) => [...prev, ...images].slice(0, 7));
  }

  // Fetch event options when modal opens
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const controller = new AbortController();

    async function loadEventOptions() {
      setEventOptionsLoading(true);
      try {
        const response = await fetch(apiPath("/api/events?page=1&pageSize=100&tab=all"), {
          signal: controller.signal,
          cache: "no-store",
          headers: withBackendAuthHeaders(),
        });
        const payload = (await response.json()) as EventsApiResponse;
        if (!response.ok || !payload.success) {
          setEventOptions([]);
          return;
        }

        const options = payload.data.items.map((item) => ({
          id: item.id,
          title: item.title,
          date: item.date,
          location: item.location,
          type: item.type,
          field: item.field,
          level: item.level,
        }));
        setEventOptions(options);
      } catch {
        if (controller.signal.aborted) {
          return;
        }
      } finally {
        if (!controller.signal.aborted) {
          setEventOptionsLoading(false);
        }
      }
    }

    loadEventOptions();
    return () => controller.abort();
  }, [isOpen]);

  // Handle close action and reset form states
  function handleClose() {
    setTab("credential");
    setForm(initialOtherCredentialForm);
    setCredentialImage(null);
    setEventImages([]);
    onClose();
  }

  // Handle form submission and step validation
  async function handleSubmit() {
    // Validate Step 1 (Credential Details)
    if (tab === "credential") {
      if (!form.credentialName.trim() || !form.credentialCategory.trim()) {
        notifyError("Please fill credential name and category");
        return;
      }
      if (!form.recipientName.trim()) {
        notifyError("Please fill recipient name");
        return;
      }
      if (!form.rank.trim()) {
        notifyError("Please fill rank");
        return;
      }
      if (!form.keyLearning.trim()) {
        notifyError("Please fill key learning");
        return;
      }
      if (!form.issueDate.trim()) {
        notifyError("Please select issue date");
        return;
      }
      setTab("event");
      return;
    }

    // Validate Step 2 (Event Details)
    if (!form.eventId && !form.eventName.trim()) {
      notifyError("Please select or create event name");
      return;
    }
    if (!form.eventField.trim()) {
      notifyError("Please fill event field");
      return;
    }
    if (!form.heldStartDate || !form.heldEndDate) {
      notifyError("Please select held during start/end date");
      return;
    }
    if (new Date(form.heldStartDate).getTime() > new Date(form.heldEndDate).getTime()) {
      notifyError("Held during end date must be after start date");
      return;
    }

    // Submit data to API
    setIsSubmitting(true);
    try {
      const response = await fetch(apiPath("/api/credentials"), {
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
          credentialSource: "other",
          eventId: form.eventId || undefined,
          eventField: form.eventField,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { success?: boolean; error?: string }
        | null;
      if (!response.ok || !payload?.success) {
        const rawError = payload?.error ?? "Unable to create credential";
        if (rawError.toLowerCase().includes("user not found")) {
          notifyError("User not found in backend. Please sign out and sign in with a valid backend account.");
          return;
        }
        notifyError(rawError);
        return;
      }

      let eventItem: CredentialItem | undefined;
      const hasNewEventName = !form.eventId && form.eventName.trim().length > 0;
      if (hasNewEventName) {
        eventItem = {
          id: `local-event-${Date.now()}`,
          type: form.credentialCategory || "Event",
          title: form.eventName.trim(),
          description: form.eventDescription.trim() || form.credentialName.trim() || "Created from other credential",
          issuedOn: formatDisplayDate(form.heldStartDate || form.issueDate),
          organization: form.organizationName.trim() || "Medalverze",
          isVerified: true,
          visibility: form.visibility,
          category: "events",
          issuerLogo: "/assets/icons/cone.svg",
          coverImage: credentialImage || "/assets/icons/cone.svg",
        };
      }

      // Success: Call parent callback and reset local states
      handleClose();
      onSuccess({ eventItem });
    } catch {
      notifyError("Unable to create credential");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/35 p-4">
      <CredentialEditorDialogShell
        title="Other Credential"
        subtitle=""
        onClose={handleClose}
        className="max-h-[86vh] max-w-[700px]"
        bodyClassName="max-h-[68vh] overflow-y-auto bg-[#eaf4ff] px-5 py-4"
        body={
          <>
        {tab === "credential" ? (
          <>
            <p className="mb-2 text-sm font-medium text-slate-700">Credential Image</p>
            {credentialImage ? (
              <div className="mb-3 flex flex-col items-center">
                <div className="flex h-[172px] w-[172px] items-center justify-center rounded-full border-4 border-white bg-[#98bbdf]">
                  <img
                    src={credentialImage}
                    alt="Credential upload preview"
                    className="h-[78px] w-[110px] rounded-md object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => credentialImageInputRef.current?.click()}
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-8 text-sm font-medium text-[#545454] hover:bg-slate-50"
                >
                  Change Image
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => credentialImageInputRef.current?.click()}
                className="mb-3 flex h-[132px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-center"
              >
                <ImagePlus size={36} className="text-slate-400" />
                <p className="mt-2 text-[14px] text-slate-700">
                  <span className="font-semibold text-[#3C7ACB] underline">Click to upload</span> or drag and drop
                </p>
                <p className="mt-1 text-[11px] text-slate-400">SVG, PNG, JPG or GIF (max. 400x400px)</p>
              </button>
            )}
          </>
        ) : (
          <>
            <p className="mb-1 text-sm font-medium text-slate-700">Event Images</p>
            <p className="mb-2 text-sm text-slate-500">Upload images from when you attended this event.</p>
            {eventImages.length > 0 ? (
              <div className="mb-2 flex gap-3">
                <img
                  src={eventImages[0]}
                  alt="Event image 1"
                  className="h-[232px] w-[46%] shrink-0 rounded-lg object-cover"
                />
                <div className="grid flex-1 grid-cols-3 gap-2.5">
                  {eventImages.slice(1, 7).map((image, index) => (
                    <img
                      key={`event-image-${index + 2}`}
                      src={image}
                      alt={`Event image ${index + 2}`}
                      className="h-[110px] w-full rounded-lg object-cover"
                    />
                  ))}
                  {eventImages.length < 7 ? (
                    <button
                      type="button"
                      onClick={() => eventImagesInputRef.current?.click()}
                      className="inline-flex h-[110px] w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/80 text-slate-400 hover:text-slate-500"
                      aria-label="Add event image"
                    >
                      <ImagePlus size={34} />
                    </button>
                  ) : null}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => eventImagesInputRef.current?.click()}
                className="mb-2 flex h-[132px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-center"
              >
                <ImagePlus size={36} className="text-slate-400" />
                <p className="mt-2 text-[14px] text-slate-700">
                  <span className="font-semibold text-[#3C7ACB] underline">Click to upload</span> or drag and drop
                </p>
                <p className="mt-1 text-[11px] text-slate-400">SVG, PNG, JPG or GIF (max. 800x400px)</p>
              </button>
            )}
          </>
        )}
        <input
          ref={credentialImageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            void handleCredentialImageChange(event.target.files);
            event.target.value = "";
          }}
        />
        <input
          ref={eventImagesInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            void handleEventImagesChange(event.target.files);
            event.target.value = "";
          }}
        />

        {/* Navigation Tabs */}
        <div className="mt-4 flex items-center gap-2 border-b border-slate-300 text-sm">
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
        </div>

        {/* Tab Content: Credential Details */}
        {tab === "credential" ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="border-b border-slate-200 pb-3">
              <p className="text-xs text-slate-400">Recipient Name</p>
              <p className="mt-1 text-lg font-semibold text-slate-800">{form.recipientName}</p>
            </div>

            <div className="mt-3 space-y-2">
              <LabeledInput
                label="Credential Name"
                placeholder="Enter credential name"
                value={form.credentialName}
                onChange={(value) => setForm((prev) => ({ ...prev, credentialName: value }))}
              />
              <SearchableSelect
                label="Credential Category"
                placeholder="Select credential category"
                value={form.credentialCategory}
                onChange={(value) => setForm((prev) => ({ ...prev, credentialCategory: value }))}
                options={credentialCategoryOptions}
                searchable={false}
              />
              <LabeledInput
                label="Organization Abbreviation"
                placeholder="Enter organization abbreviation"
                value={form.organizationAbbreviation}
                onChange={(value) => setForm((prev) => ({ ...prev, organizationAbbreviation: value }))}
              />
              <LabeledInput
                label="Organization Name"
                placeholder="Enter organization name"
                value={form.organizationName}
                onChange={(value) => setForm((prev) => ({ ...prev, organizationName: value }))}
              />
              <div className="grid grid-cols-2 gap-2">
                <LabeledInput
                  label="Rank"
                  placeholder="Enter rank"
                  value={form.rank}
                  onChange={(value) => setForm((prev) => ({ ...prev, rank: value }))}
                />
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-700">Issue Date</span>
                  <DateInput
                    value={form.issueDate}
                    onChange={(event) => setForm((prev) => ({ ...prev, issueDate: event.target.value }))}
                  />
                </label>
              </div>
              <LabeledTextarea
                label="Key Learning"
                placeholder="What knowledge or skill did you acquire from this experience?"
                value={form.keyLearning}
                onChange={(value) => setForm((prev) => ({ ...prev, keyLearning: value }))}
              />
              <SearchableSelect
                label="Visibility"
                placeholder="Select visibility"
                value={form.visibility}
                onChange={(value) => setForm((prev) => ({ ...prev, visibility: value as "public" | "private" }))}
                options={visibilityOptions}
                searchable={false}
              />
            </div>
          </div>
        ) : (
          /* Tab Content: Event Details */
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="space-y-2">
              {eventOptionsLoading ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                  Loading event options...
                </div>
              ) : null}
              {!eventOptionsLoading && eventOptions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-500">
                  No events available. Please create or fetch events first.
                </div>
              ) : null}
              <SearchableSelect
                label="Event Name"
                placeholder="Select event name"
                value={form.eventId}
                onChange={(value) => {
                  const selected = eventOptions.find((item) => item.id === value);
                  setForm((prev) => ({
                    ...prev,
                    eventId: value,
                    eventName: selected?.title ?? "",
                    heldStartDate: selected ? toDateInputValue(selected.date) : prev.heldStartDate,
                    heldEndDate: selected ? toDateInputValue(selected.date) : prev.heldEndDate,
                    venue: selected?.location ?? prev.venue,
                    activityType: selected?.type ?? prev.activityType,
                    eventField: selected?.field ?? prev.eventField,
                    competitionLevel: selected?.level ?? prev.competitionLevel,
                  }));
                }}
                options={eventOptions.map((item) => ({
                  value: item.id,
                  label: item.title,
                }))}
                searchPlaceholder="Search event name"
                displayValue={!form.eventId ? form.eventName : undefined}
                creatable
                createLabel="Create new event"
                createInputPlaceholder="Enter new event name"
                onCreate={(name) => {
                  setEventImages([]);
                  setForm((prev) => ({
                    ...prev,
                    eventId: "",
                    eventName: name,
                    heldStartDate: "",
                    heldEndDate: "",
                    venue: "",
                    activityType: "",
                    eventField: "",
                    participationMode: "",
                    competitionLevel: "",
                    eventDescription: "",
                  }));
                }}
              />
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-700">Held During (Start)</span>
                  <DateInput
                    value={form.heldStartDate}
                    max={form.heldEndDate || undefined}
                    onChange={(event) => setForm((prev) => ({ ...prev, heldStartDate: event.target.value }))}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-700">Held During (End)</span>
                  <DateInput
                    value={form.heldEndDate}
                    min={form.heldStartDate || undefined}
                    onChange={(event) => setForm((prev) => ({ ...prev, heldEndDate: event.target.value }))}
                  />
                </label>
              </div>
              <LabeledInput
                label="Venue"
                placeholder="Enter venue"
                value={form.venue}
                onChange={(value) => setForm((prev) => ({ ...prev, venue: value }))}
              />
              <div className="grid grid-cols-2 gap-2">
                <SearchableSelect
                  label="Activity Type"
                  placeholder="Select activity type"
                  value={form.activityType}
                  onChange={(value) => setForm((prev) => ({ ...prev, activityType: value }))}
                  options={activityTypeOptions}
                  searchPlaceholder="Search activity type"
                />
                <SearchableSelect
                  label="Event Field"
                  placeholder="Select event field"
                  value={form.eventField}
                  onChange={(value) => setForm((prev) => ({ ...prev, eventField: value }))}
                  options={eventFieldOptions}
                  searchPlaceholder="Search event field"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <SearchableSelect
                  label="Participation Mode"
                  placeholder="Select participation mode"
                  value={form.participationMode}
                  onChange={(value) => setForm((prev) => ({ ...prev, participationMode: value }))}
                  options={participationModeOptions}
                  searchPlaceholder="Search participation mode"
                />
                <SearchableSelect
                  label="Competition Level"
                  placeholder="Select competition level"
                  value={form.competitionLevel}
                  onChange={(value) => setForm((prev) => ({ ...prev, competitionLevel: value }))}
                  options={competitionLevelOptions}
                  searchPlaceholder="Search competition level"
                />
              </div>
              <LabeledTextarea
                label="Event Description"
                placeholder="Describe the event"
                value={form.eventDescription}
                onChange={(value) => setForm((prev) => ({ ...prev, eventDescription: value }))}
              />
              <SearchableSelect
                label="Visibility"
                placeholder="Select visibility"
                value={form.visibility}
                onChange={(value) => setForm((prev) => ({ ...prev, visibility: value as "public" | "private" }))}
                options={visibilityOptions}
                searchable={false}
              />
            </div>
          </div>
        )}
          </>
        }
        footer={
          <>
        <button
          type="button"
          onClick={handleClose}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-7 text-sm font-medium text-slate-700"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            (tab === "credential"
              ? !form.credentialName.trim() || !form.credentialCategory.trim()
              : eventOptionsLoading || (!form.eventId && !form.eventName.trim()))
          }
          className="inline-flex h-10 items-center justify-center rounded-xl bg-[#212121] px-8 text-sm font-semibold text-white transition hover:bg-[#212121] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          {tab === "credential" ? "Next" : isSubmitting ? "Publishing..." : "Publish"}
        </button>
          </>
        }
      />
    </div>
  );
}
