"use client";

import {
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search,
  ShieldCheck,
  Shapes,
  Award,
} from "lucide-react";

import EventItem from "@/components/EventItem";
import CredentialCard from "@/components/CredentialCard";
import { CredentialItem } from "@/modules/credentials/domain/credential.types";
import { Modal } from "@/components/ModalFormUI";
import {
  CredentialFilterPanel,
  SortByOption,
} from "@/components/CredentialFilterPanel";
import { MedalverseModal } from "@/components/MedalverseModal";
import { OtherCredentialModal } from "@/components/OtherCredentialModal";
import { CredentialSkeletonCard } from "@/components/CredentialSkeletonCard";
import { DraftCredentialModal } from "@/components/DraftCredentialModal";
import { CredentialDetailDialog } from "@/components/CredentialDetailDialog";
import { AppToast } from "@/components/ui/AppToast";
import { CredentialSuccessDialog } from "@/components/ui/CredentialSuccessDialog";
import { useCredentialsPage } from "@/hooks/useCredentials";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function CredentialsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    query,
    setQuery,
    tab,
    setTab,
    page,
    setPage,
    totalPages,
    loading,
    addMenuAnchor,
    setAddMenuAnchor,
    showCreateModal,
    setShowCreateModal,
    showMedalverseModal,
    setShowMedalverseModal,
    showOtherCredentialModal,
    setShowOtherCredentialModal,
    deleteTarget,
    setDeleteTarget,
    editTarget,
    setEditTarget,
    toast,
    setToast,
    setAddedCredentials,
    setRefreshVersion,
    showCreatedSuccessModal,
    setShowCreatedSuccessModal,
    showFilters,
    setShowFilters,
    showDatePicker,
    setShowDatePicker,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedCredentialTypes,
    selectedStatus,
    setSelectedStatus,
    showStatusOptions,
    setShowStatusOptions,
    filterMotionVersion,
    pages,
    visibleItems,
    filteredVisibleItems,
    activeFilterCount,
    dateRangeLabel,
    isHeaderAddMenuOpen,
    isEmptyAddMenuOpen,
    hasAnyCredentials,
    openOtherCredentialModal,
    openMedalverseModal,
    removeCredential,
    toggleCredentialTypeFilter,
    clearFilters,
    notifySuccess,
    notifyError,
  } = useCredentialsPage();

  const [sortBy, setSortBy] = useState<SortByOption>("recent");
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [openCredential, setOpenCredential] = useState<CredentialItem | null>(null);
  const [openCredentialId, setOpenCredentialId] = useState<string | null>(null);
  const queryCredentialId = searchParams.get("openCredential");
  const activeCredentialId = openCredential?.id ?? openCredentialId ?? queryCredentialId;

  const closeDetailDialog = () => {
    setOpenCredential(null);
    setOpenCredentialId(null);
    if (!searchParams.has("openCredential")) {
      return;
    }
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("openCredential");
    const next = nextParams.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  return (
    <div className="relative min-h-full rounded-3xl p-4">
      <header className="mb-3 flex items-center justify-between">
        <div className="text-heading-h3 text-text-primary">
          Credentials
        </div>

        <div className="relative">
          <button
            onClick={() =>
              setAddMenuAnchor((prev) => (prev === "header" ? null : "header"))
            }
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-background-bg-primary-solid px-4 text-body-sm-medium text-white transition duration-300  hover:bg-background-bg-primary-solid-hover hover:shadow-lg active:scale-95"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Credentials</span>
          </button>
          {isHeaderAddMenuOpen ? (
            <div className="absolute right-0 top-12 z-20 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              <button
                onClick={openMedalverseModal}
                className="flex w-full items-center gap-2 px-3 py-3 text-left text-body-sm-regular text-text-primary hover:bg-slate-50"
              >
                <img
                  src="/app/assets/logos/medalverse-logo.svg"
                  alt="medalverse-logo"
                  className="h-4 w-4"
                />
                Medalverse Credential
              </button>
              <button
                onClick={openOtherCredentialModal}
                className="flex w-full items-center gap-2 px-3 py-3 text-left text-body-sm-regular text-text-primary hover:bg-slate-50"
              >
                <Shapes size={15} className="text-foreground-fg-primary" />
                Others
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <div
        className={`mb-3 grid gap-3 ${hasAnyCredentials ? "grid-cols-[1fr_auto_auto]" : "grid-cols-[1fr_auto]"}`}
      >
        <div className="flex items-center gap-2 rounded-xl border border-[#d5e2f0] bg-white px-3">
          <Search size={18} className="text-text-secondary" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search Credential"
            className="h-11 w-full border-0 bg-transparent text-caption-caption-md placeholder:text-text-secondary text-text-secondary outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters((prev) => !prev)}
          className={`inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-body-md-medium text-white transition duration-300 
              bg-background-bg-brand-solid border border-border-border-brand-solid text-white hover:bg-background-bg-brand-solid-hover hover:shadow-lg active:scale-95`}
        >
          <Filter size={16} />
          <span className="hidden sm:inline">Filter</span>
          {activeFilterCount > 0 ? (
            <span className="rounded-md bg-[#EEF5FC] px-1.5 py-0.5 text-xs text-[#3C7ACB]">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
      </div>

      <div className="mb-3 flex items-center gap-6 border-b border-[#d5e2f0] pb-2 text-sm">
        <button
          onClick={() => {
            setTab("all");
            setPage(1);
          }}
          className={
            tab === "all"
              ? "relative rounded-lg px-3 pb-2 pt-1 text-body-md-medium text-[#3C7ACB] transition duration-300"
              : "relative rounded-lg px-3 pb-2 pt-1 text-body-md-medium text-text-tertiary transition duration-300 hover:text-[#3C7ACB]"
          }
        >
          <span className="inline-flex items-center gap-2">
            <Award size={14} />
            All Credentials
          </span>
          <span
            className={`absolute inset-x-2 -bottom-[1px] h-0.5 origin-left rounded-full bg-[#3C7ACB] transition-transform duration-300 ${tab === "all" ? "scale-x-100" : "scale-x-0"
              }`}
          />
        </button>
        <button
          onClick={() => {
            setTab("events");
            setPage(1);
          }}
          className={
            tab === "events"
              ? "relative rounded-lg px-3 pb-2 pt-1 text-body-md-medium text-[#3C7ACB] transition duration-300"
              : "relative rounded-lg px-3 pb-2 pt-1 text-body-md-medium text-text-tertiary transition duration-300 hover:text-[#3C7ACB]"
          }
        >
          <span className="inline-flex items-center gap-2">
            <CalendarDays size={14} />
            Events
          </span>
          <span
            className={`absolute inset-x-2 -bottom-[1px] h-0.5 origin-left rounded-full bg-[#3C7ACB] transition-transform duration-300 ${tab === "events" ? "scale-x-100" : "scale-x-0"
              }`}
          />
        </button>
      </div>

      {(() => {
        if (loading) {
          return (
            <div className="mt-3 flex min-h-0 flex-col gap-3 lg:flex-row">
              {showFilters ? (
                <div className="order-1 shrink-0 lg:order-2 lg:w-[252px]">
                  <CredentialFilterPanel
                    selectedCredentialTypes={selectedCredentialTypes}
                    selectedStatus={selectedStatus}
                    showStatusOptions={showStatusOptions}
                    onToggleType={toggleCredentialTypeFilter}
                    onToggleStatusOptions={() =>
                      setShowStatusOptions((prev) => !prev)
                    }
                    onSelectStatus={(status) => {
                      setSelectedStatus(status);
                      setShowStatusOptions(false);
                    }}
                    sortBy={sortBy}
                    showSortOptions={showSortOptions}
                    onToggleSortOptions={() => setShowSortOptions((p) => !p)}
                    onSelectSortBy={(next) => {
                      setSortBy(next);
                      setShowSortOptions(false);
                      setPage(1);
                    }}
                  />
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-body-md-medium bg-text-primary mt-3 h-10 w-full rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-0.5 hover:border-[#4A90E2] hover:bg-[#EEF5FC] hover:text-[#3C7ACB] md:w-fit md:px-6 lg:w-full"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : null}
              <section className="order-2 grid min-h-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:order-1 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 12 }).map((_, index) => (
                  <CredentialSkeletonCard key={index} />
                ))}
              </section>
            </div>
          );
        }
        if (visibleItems.length === 0) {
          return (
            <section className="mt-4 min-h-[560px] rounded-3xl bg-transparent px-6 py-10">
              <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                <div
                  aria-label="Empty credential cloud"
                  className="mb-5 h-[108px] w-[108px] bg-contain bg-center bg-no-repeat"
                  style={{
                    backgroundImage:
                      "url('/app/assets/illustration/illustration.png')",
                  }}
                />

                <h3 className="text-lg leading-[1.1] font-semibold text-[#334155]">
                  Your Credential Cloud is empty
                </h3>
                <p className="mt-3 max-w-[820px] text-sm leading-[1.45] text-[#5b7090]">
                  Discover opportunities in Experience Hub to earn verified
                  Medalverse Credentials or upload other awards.
                </p>

                <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
                  <button className="h-11 rounded-xl border border-slate-200 bg-white px-6 text-[14px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                    View Opportunities
                  </button>
                  <button
                    onClick={() =>
                      setAddMenuAnchor((prev) =>
                        prev === "empty" ? null : "empty",
                      )
                    }
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0f2f2a] px-6 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(6,37,32,0.22)] transition hover:bg-[#133e37]"
                  >
                    <Plus size={16} />
                    Add Credential
                  </button>
                  {isEmptyAddMenuOpen ? (
                    <div className="absolute right-0 top-[calc(100%+10px)] z-20 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                      <button
                        onClick={openMedalverseModal}
                        className="flex w-full items-center gap-2 px-3 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <img
                          src="/app/assets/logos/medalverse-logo.svg"
                          alt="Medalverse-logo"
                          className="h-4 w-4"
                        />
                        Medalverse Credential
                      </button>
                      <button
                        onClick={openOtherCredentialModal}
                        className="flex w-full items-center gap-2 px-3 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Shapes size={15} className="text-slate-500" />
                        Others
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          );
        }
        if (filteredVisibleItems.length === 0) {
          return (
            <div className="mt-3 flex min-h-0 flex-col gap-3 lg:flex-row">
              {showFilters ? (
                <div className="order-1 shrink-0 lg:order-2 lg:w-[252px]">
                  <CredentialFilterPanel
                    selectedCredentialTypes={selectedCredentialTypes}
                    selectedStatus={selectedStatus}
                    showStatusOptions={showStatusOptions}
                    onToggleType={toggleCredentialTypeFilter}
                    onToggleStatusOptions={() =>
                      setShowStatusOptions((prev) => !prev)
                    }
                    onSelectStatus={(status) => {
                      setSelectedStatus(status);
                      setShowStatusOptions(false);
                    }}
                    sortBy={sortBy}
                    showSortOptions={showSortOptions}
                    onToggleSortOptions={() => setShowSortOptions((p) => !p)}
                    onSelectSortBy={(next) => {
                      setSortBy(next);
                      setShowSortOptions(false);
                      setPage(1);
                    }}
                  />
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-body-md-medium bg-text-primary mt-3 h-10 w-full rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-0.5 hover:border-[#4A90E2] hover:bg-[#EEF5FC] hover:text-[#3C7ACB] md:w-fit md:px-6 lg:w-full"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : null}
              <section className="order-2 flex min-h-0 flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/80 p-8 text-center text-slate-500 lg:order-1">
                No credentials found for this filter.
              </section>
            </div>
          );
        }
        return (
          <div className="mt-3 flex min-h-0 flex-col gap-3 lg:flex-row">
            {showFilters ? (
              <div className="order-1 shrink-0 lg:order-2 lg:w-[252px]">
                <CredentialFilterPanel
                  selectedCredentialTypes={selectedCredentialTypes}
                  selectedStatus={selectedStatus}
                  showStatusOptions={showStatusOptions}
                  onToggleType={toggleCredentialTypeFilter}
                  onToggleStatusOptions={() =>
                    setShowStatusOptions((prev) => !prev)
                  }
                  onSelectStatus={(status) => {
                    setSelectedStatus(status);
                    setShowStatusOptions(false);
                  }}
                  sortBy={sortBy}
                  showSortOptions={showSortOptions}
                  onToggleSortOptions={() => setShowSortOptions((p) => !p)}
                  onSelectSortBy={(next) => {
                    setSortBy(next);
                    setShowSortOptions(false);
                    setPage(1);
                  }}
                />
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-body-md-medium bg-text-primary mt-3 h-10 w-full rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-0.5 hover:border-[#4A90E2] hover:bg-[#EEF5FC] hover:text-[#3C7ACB] md:w-fit md:px-6 lg:w-full"
                >
                  Clear Filters
                </button>
              </div>
            ) : null}
            <section className="order-2 grid min-h-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:order-1 lg:grid-cols-3 xl:grid-cols-4">
              {filteredVisibleItems.map((item, index) => (
                <div
                  key={`${item.id}-${filterMotionVersion}`}
                  className="flex flex-col h-full"
                >
                  {tab === "all" ? (
                    <CredentialCard
                      onClick={() => setOpenCredential(item)}
                      data={{
                        type: item.type,
                        title: item.title,
                        description: item.description,
                        issuedOn: item.issuedOn,
                        organization: item.organization,
                        isVerified: item.isVerified,
                      }}
                    />
                  ) : (
                    <EventItem
                      href={`/credentials-cloud/credentials/${item.id}?view=event`}
                      data={{
                        id: item.id,
                        title: item.title,
                        description: item.description,
                        eventDate: item.issuedOn,
                        organization: item.organization,
                        isVerified: item.isVerified,
                        badge: item.type || "Regional/State",
                        coverImage: item.coverImage,
                        tags: [
                          { label: "Workshop", theme: "blue" },
                          { label: "Hackathon", theme: "green" },
                          {
                            label: "On Vacation board another country",
                            theme: "orange",
                          },
                        ],
                      }}
                    />
                  )}

                </div>
              ))}
            </section>
          </div>
        );
      })()}

      {hasAnyCredentials ? (
        <footer className="mt-3 grid grid-cols-1 items-center gap-4 rounded-2xl border border-[#d5e2f0] bg-white px-5 py-2.5 text-slate-500 sm:grid-cols-[1fr_auto_1fr]">
          <span className="text-center text-body-sm-regular text-text-secondary sm:text-left">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center justify-center gap-2 text-sm sm:justify-self-center">
            <button
              className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 disabled:opacity-40"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft size={16} />
            </button>
            {pages.map((item, index) => {
              if (item === "...") {
                return <span key={`ellipsis-${index}`}>...</span>;
              }

              return (
                <button
                  key={item}
                  className={`h-8 w-8 rounded-full text-body-sm-semibold ${item === page ? "bg-[#EEF5FC] text-[#3C7ACB]" : "hover:bg-slate-100"}`}
                  onClick={() => setPage(Number(item))}
                >
                  {item}
                </button>
              );
            })}
            <button 
              className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 disabled:opacity-40"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="hidden sm:block" />
        </footer>
      ) : null}

      <MedalverseModal
        isOpen={showMedalverseModal}
        onClose={() => setShowMedalverseModal(false)}
        onSuccess={(claimedItems) => {
          setAddedCredentials((prev) => [...claimedItems, ...prev]);
          setShowMedalverseModal(false);
          notifySuccess("Medalverse credentials added");
        }}
      />

      <OtherCredentialModal
        isOpen={showOtherCredentialModal}
        onClose={() => setShowOtherCredentialModal(false)}
        onSuccess={({ eventItem }) => {
          setShowOtherCredentialModal(false);
          if (eventItem) {
            setAddedCredentials((prev) => [eventItem, ...prev]);
          }
          setPage(1);
          setRefreshVersion((prev) => prev + 1);
          setShowCreatedSuccessModal(true);
          notifySuccess("Credential created successfully");
        }}
        notifyError={notifyError}
      />

      <CredentialSuccessDialog
        open={showCreatedSuccessModal}
        onClose={() => setShowCreatedSuccessModal(false)}
        buttonLabel="View Credential"
      />

      <DraftCredentialModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditTarget(null);
        }}
        editData={
          editTarget
            ? {
              title: editTarget.title,
              description: editTarget.description,
              issuedOn: editTarget.issuedOn,
              organization: editTarget.organization,
              type: editTarget.type,
              category: editTarget.category,
            }
            : null
        }
        notifyError={notifyError}
        onSave={(finalDraft) => {
          const newItem: CredentialItem = {
            id: editTarget ? editTarget.id : `local-${Date.now()}`,
            title: finalDraft.title,
            description: finalDraft.description || "No description",
            issuedOn: finalDraft.issuedOn,
            organization: finalDraft.organization || "Medalverze",
            type: finalDraft.type,
            category: finalDraft.category,
            isVerified: true,
            issuerLogo: "/app/assets/icons/cone.svg",
            coverImage: "/app/assets/icons/cone.svg",
          };

          if (editTarget) {
            setAddedCredentials((prev) =>
              prev.map((item) =>
                item.id === editTarget.id ? { ...item, ...newItem } : item,
              ),
            );
            notifySuccess("Credential updated");
          } else {
            setAddedCredentials((prev) => [newItem, ...prev]);
            notifySuccess("Credential created");
          }
          setShowCreateModal(false);
          setEditTarget(null);
        }}
      />

      {deleteTarget ? (
        <Modal onClose={() => setDeleteTarget(null)}>
          <h3 className="text-xl font-semibold text-slate-800">
            Delete Credential
          </h3>
          <p className="mt-3 text-sm text-slate-600">
            Are you sure you want to delete &quot;{deleteTarget.title}&quot;?
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </button>
            <button
              className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white"
              onClick={() => removeCredential(deleteTarget)}
            >
              Delete
            </button>
          </div>
        </Modal>
      ) : null}

      <AppToast toast={toast} onClose={() => setToast(null)} />

      <CredentialDetailDialog
        open={Boolean(activeCredentialId)}
        credentialId={activeCredentialId}
        // fallbackItem={openCredential}
        onClose={closeDetailDialog}
        onSaved={() => setRefreshVersion((prev) => prev + 1)}
        onToast={(type, message, title) => setToast({ type, message, title })}
      />
    </div>
  );
}
