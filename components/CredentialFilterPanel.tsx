import React, { useEffect, useRef, useState } from "react";
import { ChevronUp, ChevronDown, Trophy, Medal, FileBadge, CircleStar } from "lucide-react";
import { createPortal } from "react-dom";

export const CREDENTIAL_TYPE_OPTIONS = ["Trophy", "Medal", "Badge", "Certificate"];
export type SortByOption = "recent" | "oldest" | "title_az" | "title_za";

function sortLabel(sortBy: SortByOption) {
  switch (sortBy) {
    case "recent":
      return "Most Recent";
    case "oldest":
      return "Oldest";
    case "title_az":
      return "Title A - Z";
    case "title_za":
      return "Title Z - A";
    default:
      return "Most Recent";
  }
}

function CredentialTypeChip({
  type,
  active,
  onClick,
}: {
  type: string;
  active: boolean;
  onClick: () => void;
}) {
  const Icon =
    type === "Trophy" ? Trophy : type === "Medal" ? Medal : type === "Badge" ? CircleStar : FileBadge;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-fit px-3 flex h-8 items-center justify-center gap-1.5 rounded-full border text-caption-caption-sm text-text-primary transition ${active
        ? "border border-[#4A90E2] bg-[#EEF5FC] text-[#3C7ACB] shadow-[0_6px_14px_rgba(74,144,226,0.2)]"
        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        }`}
    >
      <Icon size={16} className={active ? "text-[#3C7ACB]" : "text-text-primary"} />
      <span className={active ? "text-[#3C7ACB]" : "text-text-primary"}>{type}</span>
    </button>
  );
}

export function CredentialFilterPanel({
  selectedCredentialTypes,
  selectedStatus,
  showStatusOptions,
  onToggleType,
  onToggleStatusOptions,
  onSelectStatus,

  sortBy,
  showSortOptions,
  onToggleSortOptions,
  onSelectSortBy
}: {
  selectedCredentialTypes: string[];
  selectedStatus: "all" | "public" | "private";
  showStatusOptions: boolean;
  onToggleType: (type: string) => void;
  onToggleStatusOptions: () => void;
  onSelectStatus: (status: "all" | "public" | "private") => void;
  sortBy: SortByOption;
  showSortOptions: boolean;
  onToggleSortOptions: () => void;
  onSelectSortBy: (sortBy: SortByOption) => void;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const statusButtonRef = useRef<HTMLButtonElement>(null);
  const statusPanelRef = useRef<HTMLDivElement>(null);
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const sortPanelRef = useRef<HTMLDivElement>(null);
  const [statusPanelPos, setStatusPanelPos] = useState({ top: 0, left: 0, width: 0 });
  const [sortPanelPos, setSortPanelPos] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const targetNode = event.target as Node;
      const inRoot = rootRef.current?.contains(targetNode);
      const inStatusPanel = statusPanelRef.current?.contains(targetNode);
      const inSortPanel = sortPanelRef.current?.contains(targetNode);

      if (showStatusOptions && !inRoot && !inStatusPanel) {
        onToggleStatusOptions();
      }
      if (showSortOptions && !inRoot && !inSortPanel) {
        onToggleSortOptions();
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [showStatusOptions, showSortOptions, onToggleSortOptions, onToggleStatusOptions]);

  useEffect(() => {
    if (!showStatusOptions) {
      return;
    }

    const updatePos = () => {
      const rect = statusButtonRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }
      const viewportPadding = 12;
      const width = Math.max(220, rect.width);
      const maxLeft = window.innerWidth - width - viewportPadding;
      const left = Math.min(Math.max(rect.left, viewportPadding), Math.max(viewportPadding, maxLeft));
      const top = rect.bottom + 6;
      setStatusPanelPos({ top, left, width });
    };

    updatePos();
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [showStatusOptions]);

  useEffect(() => {
    if (!showSortOptions) {
      return;
    }

    const updatePos = () => {
      const rect = sortButtonRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }
      const viewportPadding = 12;
      const width = Math.max(220, rect.width);
      const maxLeft = window.innerWidth - width - viewportPadding;
      const left = Math.min(Math.max(rect.left, viewportPadding), Math.max(viewportPadding, maxLeft));
      const top = rect.bottom + 6;
      setSortPanelPos({ top, left, width });
    };

    updatePos();
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [showSortOptions]);

  return (
    <aside ref={rootRef} className="rounded-2xl border border-slate-200 bg-white">
      <div className="">
        <div className="pt-3 px-4 mb-3 flex items-center justify-between border-b border-slate-200 pb-2">
          <h3 className="text-body-md-medium text-text-primary">Credential</h3>
          <ChevronUp size={18} className="text-slate-500" />
        </div>

        <div className="px-3">
          <p className="px-1 mb-2 text-body-sm-regular text-text-primary">Credential Type</p>
          <div className="flex flex-wrap gap-2">
            {CREDENTIAL_TYPE_OPTIONS.map((type) => (
              <div
                key={type}
                className="flex-[0_0_calc(50%-var(--spacing-spacing-sm))]"
              >
                <CredentialTypeChip
                  type={type}
                  active={selectedCredentialTypes.includes(type)}
                  onClick={() => onToggleType(type)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 px-3">
          <p className="mb-2 px-1 text-body-sm-regular text-text-primary">Status</p>
          <button
            ref={statusButtonRef}
            type="button"
            onClick={onToggleStatusOptions}
            className="flex h-9 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-left text-body-sm-regular text-text-primary transition duration-300 hover:-translate-y-0.5 hover:bg-slate-50"
          >
            <span>{selectedStatus === "all" ? "All Status" : selectedStatus === "public" ? "Public" : "Private"}</span>
            {showStatusOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showStatusOptions
            ? createPortal(
            <div
              ref={statusPanelRef}
              style={{ top: statusPanelPos.top, left: statusPanelPos.left, width: statusPanelPos.width }}
              className="fixed z-[20000] rounded-xl border border-slate-200 bg-white p-2 shadow-[0_10px_30px_rgba(15,23,42,0.12)]"
            >
              {[
                { key: "all", label: "All Status" },
                { key: "public", label: "Public" },
                { key: "private", label: "Private" },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => onSelectStatus(option.key as "all" | "public" | "private")}
                  className={`mb-1 flex w-full items-center rounded-lg px-3 py-2 text-left text-body-sm-medium text-text-primary last:mb-0 ${selectedStatus === option.key ? "bg-[#EEF5FC] text-[#3C7ACB]" : "text-slate-700 hover:bg-slate-50"
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>,
            document.body,
              )
            : null}
        </div>

        <div className="mt-3 px-3 pb-4">
          <p className="mb-2 px-1 text-body-sm-regular text-text-primary">Sort By</p>
          <button
            ref={sortButtonRef}
            type="button"
            onClick={onToggleSortOptions}
            className="flex h-9 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-left text-body-sm-regular text-text-primary transition duration-300 hover:-translate-y-0.5 hover:bg-slate-50"
          >
            <span>{sortLabel(sortBy)}</span>
            {showSortOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showSortOptions
            ? createPortal(
            <div
              ref={sortPanelRef}
              style={{ top: sortPanelPos.top, left: sortPanelPos.left, width: sortPanelPos.width }}
              className="fixed z-[20000] rounded-xl border border-slate-200 bg-white p-2 shadow-[0_10px_30px_rgba(15,23,42,0.12)]"
            >
              {[
                { key: "recent", label: "Most Recent" },
                { key: "oldest", label: "Oldest" },
                { key: "title_az", label: "Title A - Z" },
                { key: "title_za", label: "Title Z - A" },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => onSelectSortBy(option.key as SortByOption)}
                  className={`mb-1 flex w-full items-center rounded-lg px-3 py-2 text-left text-body-sm-medium text-text-primary last:mb-0 ${sortBy === option.key ? "bg-[#EEF5FC] text-[#3C7ACB]" : "text-slate-700 hover:bg-slate-50"
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>,
            document.body,
              )
            : null}
        </div>
      </div>
    </aside>
  );
}
