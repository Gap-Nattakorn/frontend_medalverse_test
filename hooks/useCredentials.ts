import { useEffect, useMemo, useState } from "react";
import { CredentialItem, CredentialsListResponse, CredentialVisibility } from "@/modules/credentials/domain/credential.types";
import { withBackendAuthHeaders } from "@/shared/auth/backend-access-token.client";
import { apiPath } from "@/shared/constants/routes";
import { type AppToastPayload } from "@/components/ui/AppToast";

export type ToastState = AppToastPayload;

export function formatDateLabel(value: string) {
  if (!value) {
    return "Any";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function useCredentialsPage() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | "events">("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [items, setItems] = useState<CredentialItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [addMenuAnchor, setAddMenuAnchor] = useState<"header" | "empty" | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMedalverseModal, setShowMedalverseModal] = useState(false);
  const [showOtherCredentialModal, setShowOtherCredentialModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CredentialItem | null>(null);
  const [editTarget, setEditTarget] = useState<CredentialItem | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const [addedCredentials, setAddedCredentials] = useState<CredentialItem[]>([]);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [showCreatedSuccessModal, setShowCreatedSuccessModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCredentialTypes, setSelectedCredentialTypes] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<"all" | "public" | "private">("all");
  const [showStatusOptions, setShowStatusOptions] = useState(false);
  const [filterMotionVersion, setFilterMotionVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCredentials() {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          search: query,
          tab,
          page: String(page),
          pageSize: String(pageSize),
          startDate,
          endDate,
        });

        const response = await fetch(apiPath(`/api/credentials?${params.toString()}`), {
          signal: controller.signal,
          cache: "no-store",
          headers: withBackendAuthHeaders(),
        });

        const payload = (await response.json()) as CredentialsListResponse;
        if (!response.ok || !payload.success) {
          return;
        }

        setItems(payload.data.items);
        setTotalPages(payload.data.totalPages);
      } catch {
        if (controller.signal.aborted) {
          return;
        }
      } finally {
        setLoading(false);
      }
    }

    fetchCredentials();
    return () => controller.abort();
  }, [query, tab, page, pageSize, startDate, endDate, refreshVersion]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  function notifySuccess(message: string) {
    setToast({ type: "success", message });
  }

  function notifyError(message: string) {
    setToast({ type: "error", message });
  }

  const pages = useMemo(() => {
    const result: Array<number | "..."> = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i += 1) {
        result.push(i);
      }
      return result;
    }

    if (page <= 3) {
      return [1, 2, 3, "...", totalPages];
    }

    if (page >= totalPages - 2) {
      return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  }, [page, totalPages]);

  const visibleItems = useMemo(() => {
    if (page !== 1) {
      return items;
    }
    const merged = [...addedCredentials, ...items];
    return merged.slice(0, pageSize);
  }, [addedCredentials, items, page, pageSize]);

  const filteredVisibleItems = useMemo(() => {
    return visibleItems.filter((item) => {

      if (tab === "events" && item.category !== "events") {
        return false;
      }

      if (selectedCredentialTypes.length > 0 && !selectedCredentialTypes.includes(item.type)) {
        return false;
      }

      if (selectedStatus === "public" && item.visibility !== "public") {
        return false;
      }

      if (selectedStatus === "private" && item.visibility !== "private") {
        return false;
      }

      return true;
    });
  }, [visibleItems, selectedCredentialTypes, selectedStatus, tab]);

  const activeFilterCount = selectedCredentialTypes.length + (selectedStatus === "all" ? 0 : 1);
  const dateRangeLabel = `${formatDateLabel(startDate)} - ${formatDateLabel(endDate)}`;
  const isHeaderAddMenuOpen = addMenuAnchor === "header";
  const isEmptyAddMenuOpen = addMenuAnchor === "empty";
  const hasAnyCredentials = visibleItems.length > 0;

  useEffect(() => {
    setFilterMotionVersion((prev) => prev + 1);
  }, [selectedCredentialTypes, selectedStatus, tab, query]);

  function openOtherCredentialModal() {
    setAddMenuAnchor(null);
    setShowOtherCredentialModal(true);
  }

  function openMedalverseModal() {
    setAddMenuAnchor(null);
    notifyError("Metaverse credential creation is currently disabled");
  }

  function openEdit(item: CredentialItem) {
    setEditTarget(item);
    setShowCreateModal(true);
  }

  function removeCredential(item: CredentialItem) {
    setAddedCredentials((prev) => prev.filter((cred) => cred.id !== item.id));
    setDeleteTarget(null);
    notifySuccess("Credential deleted");
  }

  async function updateCredentialVisibility(item: CredentialItem, visibility: CredentialVisibility) {
    const previousVisibility = item.visibility;
    if (previousVisibility === visibility) {
      return;
    }

    const applyVisibility = (credential: CredentialItem) =>
      credential.id === item.id ? { ...credential, visibility } : credential;
    const rollbackVisibility = (credential: CredentialItem) =>
      credential.id === item.id ? { ...credential, visibility: previousVisibility } : credential;

    setItems((prev) => prev.map(applyVisibility));
    setAddedCredentials((prev) => prev.map(applyVisibility));

    try {
      const response = await fetch(apiPath(`/api/credentials/${item.id}`), {
        method: "PATCH",
        headers: withBackendAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ draft: { visibility } }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error ?? "Unable to update visibility");
      }
      notifySuccess(`Credential set to ${visibility}`);
      setRefreshVersion((prev) => prev + 1);
    } catch (error) {
      setItems((prev) => prev.map(rollbackVisibility));
      setAddedCredentials((prev) => prev.map(rollbackVisibility));
      notifyError(error instanceof Error ? error.message : "Unable to update visibility");
    }
  }

  function toggleCredentialTypeFilter(type: string) {
    setSelectedCredentialTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((item) => item !== type);
      }
      return [...prev, type];
    });
  }

  function clearFilters() {
    setSelectedCredentialTypes([]);
    setSelectedStatus("all");
    setShowStatusOptions(false);
  }

  return {
    query, setQuery,
    tab, setTab,
    page, setPage,
    totalPages,
    loading,
    addMenuAnchor, setAddMenuAnchor,
    showCreateModal, setShowCreateModal,
    showMedalverseModal, setShowMedalverseModal,
    showOtherCredentialModal, setShowOtherCredentialModal,
    deleteTarget, setDeleteTarget,
    editTarget, setEditTarget,
    toast,
    setToast,
    addedCredentials, setAddedCredentials,
    refreshVersion, setRefreshVersion,
    showCreatedSuccessModal, setShowCreatedSuccessModal,
    showFilters, setShowFilters,
    showDatePicker, setShowDatePicker,
    startDate, setStartDate,
    endDate, setEndDate,
    selectedCredentialTypes, setSelectedCredentialTypes,
    selectedStatus, setSelectedStatus,
    showStatusOptions, setShowStatusOptions,
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
    openEdit,
    removeCredential,
    updateCredentialVisibility,
    toggleCredentialTypeFilter,
    clearFilters,
    notifySuccess,
    notifyError,
  };
}
