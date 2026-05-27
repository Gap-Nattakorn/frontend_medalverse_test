import { NextRequest, NextResponse } from "next/server";
import { DashboardEvent, EventsApiResponse, SortKey, TabKey } from "@/modules/experience/domain/dashboard.types";
import {
  extractBackendListPayload,
  mapBackendEventToDashboard,
} from "@/modules/experience/infrastructure/event-api.mapper";
import { getEventsFilterOptions, queryMockEvents } from "@/modules/experience/infrastructure/mock-events";
import { BACKEND_ACCESS_TOKEN_COOKIE } from "@/shared/auth/backend-access-token";
import { getAppDataMode, getBackendBaseUrl } from "@/shared/config/data-mode";

function parseList(value: string | null) {
  if (!value) {
    return [];
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseDateLabel(value: string) {
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.getTime();
  }
  return 0;
}

function isEventEnded(dateValue: string) {
  const parsed = parseDateLabel(dateValue);
  if (!parsed) {
    return false;
  }
  const eventDate = new Date(parsed);
  const now = new Date();
  const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()).getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return eventDay < today;
}

function sortItems(items: DashboardEvent[], sort: SortKey) {
  const sorted = [...items];

  if (sort === "oldest") {
    sorted.sort((a, b) => parseDateLabel(a.date) - parseDateLabel(b.date));
    return sorted;
  }

  if (sort === "title_asc") {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }

  if (sort === "title_desc") {
    sorted.sort((a, b) => b.title.localeCompare(a.title));
    return sorted;
  }

  sorted.sort((a, b) => parseDateLabel(b.date) - parseDateLabel(a.date));
  return sorted;
}

function inDateRange(dateValue: string, startDate: string, endDate: string) {
  const eventDate = new Date(dateValue);
  if (Number.isNaN(eventDate.getTime())) {
    return true;
  }

  const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()).getTime();

  if (startDate) {
    const start = new Date(startDate);
    if (!Number.isNaN(start.getTime())) {
      const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
      if (eventDay < startDay) {
        return false;
      }
    }
  }

  if (endDate) {
    const end = new Date(endDate);
    if (!Number.isNaN(end.getTime())) {
      const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
      if (eventDay > endDay) {
        return false;
      }
    }
  }

  return true;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const tab = (params.get("tab") ?? "all") as TabKey;
  const page = Number(params.get("page") ?? "1");
  const pageSize = Number(params.get("pageSize") ?? "10");
  const safePageInput = Number.isNaN(page) ? 1 : Math.max(1, page);
  const safePageSizeInput = Number.isNaN(pageSize) ? 10 : Math.max(1, pageSize);
  const search = params.get("search") ?? "";
  const sort = (params.get("sort") ?? "latest") as SortKey;
  const types = parseList(params.get("types"));
  const fields = parseList(params.get("fields"));
  const levels = parseList(params.get("levels"));
  const location = params.get("location") ?? "";
  const startDate = params.get("startDate") ?? "";
  const endDate = params.get("endDate") ?? "";
  const bookmarkedIds = new Set(parseList(params.get("bookmarkedIds")));
  const unbookmarkedIds = new Set(parseList(params.get("unbookmarkedIds")));
  const registeredIds = new Set(parseList(params.get("registeredIds")));
  
  const mode = getAppDataMode();
  // console.log("🔥 CURRENT DATA MODE IS:", mode);

  let items: DashboardEvent[] = [];

  if (mode === "mock") {
    const allItems = queryMockEvents({
      tab: "all",
      page: 1,
      pageSize: 1000,
      search: "",
      sort: "latest",
      types: [],
      fields: [],
      levels: [],
      location: "",
    }).items;

    items = allItems.map((item) => ({
      ...item,
      isBookmarked: (item.isBookmarked && !unbookmarkedIds.has(item.id)) || bookmarkedIds.has(item.id),
      isRegistered: item.isRegistered || registeredIds.has(item.id),
      isHistory: item.isHistory,
    }));
  } else {
    const authorization = request.headers.get("authorization");
    const cookieToken = request.cookies.get(BACKEND_ACCESS_TOKEN_COOKIE)?.value;
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length).trim()
      : cookieToken ?? "";

    const backendParams = new URLSearchParams({
      page: "1",
      page_size: "1000",
    });

    const backendResponse = await fetch(`${getBackendBaseUrl()}/api/v1/events?${backendParams.toString()}`, {
      cache: "no-store",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!backendResponse.ok) {
      const payload = await backendResponse.json().catch(() => null);
      const error = payload && typeof payload.error === "string" ? payload.error : "Unable to fetch events";
      return NextResponse.json({ success: false, error }, { status: backendResponse.status });
    }

    const backendPayload = await backendResponse.json().catch(() => null);
    const extracted = extractBackendListPayload(backendPayload);
    items = extracted.items.map((item, index) => mapBackendEventToDashboard(item, index));
    items = items.map((item) => ({
      ...item,
      isBookmarked: (item.isBookmarked && !unbookmarkedIds.has(item.id)) || bookmarkedIds.has(item.id),
      isRegistered: registeredIds.has(item.id),
      isHistory: item.isHistory,
    }));
  }

  const normalizedSearch = search.trim().toLowerCase();
  items = items.filter((item) => {
    const registered = item.isRegistered;
    const history = item.isHistory;

    // All tab: show only events that are not registered and not history.
    if (tab === "all" && (registered || history)) {
      return false;
    }
    // Bookmark tab: show all bookmarked items.
    if (tab === "bookmark" && !item.isBookmarked) {
      return false;
    }
    // Register tab: registered only, excluding history items.
    if (tab === "register" && (!registered || history)) {
      return false;
    }
    // History tab: history only.
    if (tab === "history" && !history) {
      return false;
    }
    if (normalizedSearch) {
      const searchable = `${item.title} ${item.university} ${item.location}`.toLowerCase();
      if (!searchable.includes(normalizedSearch)) {
        return false;
      }
    }
    if (types.length > 0 && !types.includes(item.type)) {
      return false;
    }
    if (fields.length > 0 && !fields.includes(item.field)) {
      return false;
    }
    if (levels.length > 0 && !levels.includes(item.level)) {
      return false;
    }
    if (location.trim()) {
      const loc = location.trim().toLowerCase();
      const target = `${item.city} ${item.country} ${item.location}`.toLowerCase();
      if (!target.includes(loc)) {
        return false;
      }
    }
    if (!inDateRange(item.date, startDate, endDate)) {
      return false;
    }
    return true;
  });

  items = sortItems(items, sort);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / safePageSizeInput));
  const safePage = Math.min(safePageInput, Math.max(1, totalPages));
  const pagedItems = items.slice((safePage - 1) * safePageSizeInput, (safePage - 1) * safePageSizeInput + safePageSizeInput);

  const response: EventsApiResponse = {
    success: true,
    data: {
      items: pagedItems,
      page: safePage,
      pageSize: safePageSizeInput,
      total,
      totalPages,
      filterOptions: getEventsFilterOptions(),
    },
  };

  return NextResponse.json(response);
}
