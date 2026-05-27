import React, { useState, useEffect } from "react";
import { Modal, Input, Select } from "./ModalFormUI";

// --- Types ---
export type DraftCredential = {
  title: string;
  description: string;
  issuedOn: string;
  organization: string;
  type: string;
  category: "events" | "portfolio";
};

const initialDraft: DraftCredential = {
  title: "",
  description: "",
  issuedOn: "",
  organization: "Medalverze",
  type: "Trophy",
  category: "events",
};

// --- Props ---
type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (draft: DraftCredential) => void;
  editData?: DraftCredential | null; 
  notifyError: (msg: string) => void;
};

export function DraftCredentialModal({ isOpen, onClose, onSave, editData, notifyError }: Props) {
  const [draft, setDraft] = useState<DraftCredential>(initialDraft);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDraft(editData ? { ...editData } : initialDraft);
    } else {
      setShowPreviewModal(false);
    }
  }, [isOpen, editData]);

  // Validation 
  function handleSave() {
    if (!draft.title.trim()) {
      notifyError("Please enter credential title");
      return;
    }
    if (!draft.issuedOn.trim()) {
      notifyError("Please enter issue date");
      return;
    }
    onSave(draft);
  }

  if (!isOpen) return null;

  return (
    <>
      <Modal onClose={onClose}>
        <h3 className="text-xl font-semibold text-slate-800">{editData ? "Edit Credential" : "Create Credential"}</h3>
        <div className="mt-4 space-y-3">
          <Input label="Title" value={draft.title} onChange={(val) => setDraft((prev) => ({ ...prev, title: val }))} />
          <Input label="Description" value={draft.description} onChange={(val) => setDraft((prev) => ({ ...prev, description: val }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Issued On" value={draft.issuedOn} onChange={(val) => setDraft((prev) => ({ ...prev, issuedOn: val }))} />
            <Input label="Organization" value={draft.organization} onChange={(val) => setDraft((prev) => ({ ...prev, organization: val }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Type"
              value={draft.type}
              onChange={(val) => setDraft((prev) => ({ ...prev, type: val }))}
              options={["Trophy", "Certificate", "Badge", "Others"]}
            />
            <Select
              label="Category"
              value={draft.category}
              onChange={(val) => setDraft((prev) => ({ ...prev, category: val as "events" | "portfolio" }))}
              options={["events", "portfolio"]}
            />
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <button className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600" onClick={() => setShowPreviewModal(true)}>
            Preview
          </button>
          <button className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white" onClick={handleSave}>
            Save
          </button>
        </div>
      </Modal>

      {/* Preview Modal */}
      {showPreviewModal ? (
        <Modal onClose={() => setShowPreviewModal(false)}>
          <h3 className="text-xl font-semibold text-slate-800">Credential Preview</h3>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Type</p>
            <p className="text-base font-semibold text-slate-800">{draft.type}</p>
            <p className="mt-2 text-sm text-slate-500">Title</p>
            <p className="text-base font-semibold text-slate-800">{draft.title || "-"}</p>
            <p className="mt-2 text-sm text-slate-500">Description</p>
            <p className="text-sm text-slate-700">{draft.description || "-"}</p>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
