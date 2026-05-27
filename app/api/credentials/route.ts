import { NextRequest, NextResponse } from "next/server";
import { CredentialDetail, CredentialItem, CredentialsListResponse } from "@/modules/credentials/domain/credential.types";
import {
  extractCredentialListPayload,
  mapBackendCredentialToItem,
} from "@/modules/credentials/infrastructure/credential-api.mapper";
import { queryMockCredentials } from "@/modules/credentials/infrastructure/mock-credentials";
import { BACKEND_ACCESS_TOKEN_COOKIE } from "@/shared/auth/backend-access-token";
import { getAppDataMode, getBackendBaseUrl } from "@/shared/config/data-mode";
import { use } from "react";

type CreatedCredentialStore = {
  items: CredentialItem[];
};

type CredentialOverrideStore = {
  byId: Record<string, Partial<CredentialDetail>>;
};
type DeletedCredentialStore = {
  ids: string[];
};

declare global {
  var __mvCreatedCredentials: CreatedCredentialStore | undefined;
  var __mvCredentialOverrides: CredentialOverrideStore | undefined;
  var __mvDeletedCredentialIds: DeletedCredentialStore | undefined;
}

function getStore() {
  if (!globalThis.__mvCreatedCredentials) {
    globalThis.__mvCreatedCredentials = { items: [] };
  }
  return globalThis.__mvCreatedCredentials;
}

function getOverrideStore() {
  if (!globalThis.__mvCredentialOverrides) {
    globalThis.__mvCredentialOverrides = { byId: {} };
  }
  return globalThis.__mvCredentialOverrides;
}

function getDeletedStore() {
  if (!globalThis.__mvDeletedCredentialIds) {
    globalThis.__mvDeletedCredentialIds = { ids: [] };
  }
  return globalThis.__mvDeletedCredentialIds;
}

function inDateRange(dateValue: string, startDate: string, endDate: string) {
  const issuedDate = new Date(dateValue);
  if (Number.isNaN(issuedDate.getTime())) {
    return true;
  }

  const issuedDay = new Date(issuedDate.getFullYear(), issuedDate.getMonth(), issuedDate.getDate()).getTime();

  if (startDate) {
    const start = new Date(startDate);
    if (!Number.isNaN(start.getTime())) {
      const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
      if (issuedDay < startDay) {
        return false;
      }
    }
  }

  if (endDate) {
    const end = new Date(endDate);
    if (!Number.isNaN(end.getTime())) {
      const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
      if (issuedDay > endDay) {
        return false;
      }
    }
  }

  return true;
}

function formatIssueDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Date to be announced";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function toTitle(value: string) {
  return value
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function readBackendToken(request: NextRequest) {
  const authorization = request.headers.get("authorization") ?? "";
  if (authorization.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }
  return request.cookies.get(BACKEND_ACCESS_TOKEN_COOKIE)?.value ?? "";
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const search = params.get("search") ?? "";
  const tab = (params.get("tab") ?? "all") as "all" | "events";
  const page = Number(params.get("page") ?? "1");
  const pageSize = Number(params.get("pageSize") ?? "8");
  const startDate = params.get("startDate") ?? "";
  const endDate = params.get("endDate") ?? "";
  const safePage = Number.isNaN(page) ? 1 : Math.max(1, page);
  const safePageSize = Number.isNaN(pageSize) ? 8 : Math.max(1, pageSize);
  const mode = getAppDataMode();
    // console.log("🔥 CURRENT DATA MODE IS:", mode);

    // console.log('🧌');
    // console.log(getBackendBaseUrl());

  let merged: CredentialItem[] = [];

  if (mode === "mock") {
    const baseItems = queryMockCredentials({
      search,
      tab,
      page: 1,
      pageSize: 1000,
    }).items;

    const createdItems = getStore().items;
    merged = [...createdItems, ...baseItems];
  } else {
    const token = readBackendToken(request);
    const backendParams = new URLSearchParams({
      page: "1",
      page_size: "1000",
    });
    
    const backendResponse = await fetch(`${getBackendBaseUrl()}/api/v1/credentials?${backendParams.toString()}`, {
      cache: "no-store",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!backendResponse.ok) {
      const payload = await backendResponse.json().catch(() => null);
      const error = payload && typeof payload.error === "string" ? payload.error : "Unable to fetch credentials";
      return NextResponse.json({ success: false, error }, { status: backendResponse.status });
    }

    const backendPayload = await backendResponse.json().catch(() => null);
    const extracted = extractCredentialListPayload(backendPayload);
    merged = extracted.items.map((item) => mapBackendCredentialToItem(item));
  }

  const normalizedSearch = search.trim().toLowerCase();
  const overrides = getOverrideStore().byId;
  merged = merged.map((item) => {
    const override = overrides[item.id];
    if (!override?.credential) {
      return item;
    }
    return {
      ...item,
      ...override.credential,
    };
  });
  const deletedIdSet = new Set(getDeletedStore().ids);
  merged = merged.filter((item) => !deletedIdSet.has(item.id));

  let items = merged.filter((item) => {
    if (tab === "events" && item.category !== "events") {
      return false;
    }
    if (!inDateRange(item.issuedOn, startDate, endDate)) {
      return false;
    }
    if (!normalizedSearch) {
      return true;
    }
    return `${item.title} ${item.organization}`.toLowerCase().includes(normalizedSearch);
  });

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const safePageClamped = Math.min(safePage, totalPages);
  const start = (safePageClamped - 1) * safePageSize;
  const end = start + safePageSize;
  items = items.slice(start, end);

  const response: CredentialsListResponse = {
    success: true,
    data: {
      items,
      page: safePageClamped,
      pageSize: safePageSize,
      total,
      totalPages,
    },
  };

  return NextResponse.json(response);
}

export async function POST(request: NextRequest) {
  // console.log("🔥 [Next.js API] command received!");
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const credentialName = typeof payload.credentialName === "string" ? payload.credentialName.trim() : "";
  const credentialCategory = typeof payload.credentialCategory === "string" ? payload.credentialCategory.trim() : "";
  const organizationName = typeof payload.organizationName === "string" ? payload.organizationName.trim() : "";
  const issueDate = typeof payload.issueDate === "string" ? payload.issueDate : "";
  const eventId = typeof payload.eventId === "string" ? payload.eventId.trim() : "";

  if (!credentialName || !credentialCategory) {
    return NextResponse.json(
      { success: false, error: "credentialName and credentialCategory are required" },
      { status: 400 },
    );
  }

  const mode = getAppDataMode();

  if (mode === "api") {
    const token = readBackendToken(request);
    const backendBody = {
      user_id: "a0000000-0000-0000-0000-000000000008",// TODO: replace with actual user id if available
      event_id: eventId || undefined,
      name: credentialName,
      type: credentialCategory.toUpperCase() || "BADGE",
      recipient_name: typeof payload.recipientName === "string" ? payload.recipientName : "",
      field: typeof payload.eventField === "string" ? payload.eventField : "",
      rank: typeof payload.rank === "string" ? payload.rank : "",
      key_learning: typeof payload.keyLearning === "string" ? payload.keyLearning : "",
      private: (payload.visibility as string | undefined) === "private",
    };

    const backendResponse = await fetch(`${getBackendBaseUrl()}/api/v1/credentials`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(backendBody),
    });

    const backendPayload = await backendResponse.json().catch(() => null);
    if (!backendResponse.ok) {
      const error = backendPayload && typeof backendPayload.error === "string" ? backendPayload.error : "Unable to create credential";
      return NextResponse.json({ success: false, error }, { status: backendResponse.status });
    }

    const createdRecord = (
      (backendPayload && typeof backendPayload === "object" && "data" in backendPayload && backendPayload.data) ??
      backendPayload
    ) as unknown;
    const item = mapBackendCredentialToItem((createdRecord as Record<string, unknown>) ?? {});
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  }

  const nextItem: CredentialItem = {
    id: `mock-${Date.now()}`,
    type: toTitle(credentialCategory || "Badge"),
    title: credentialName,
    description: "Created from mock flow",
    issuedOn: formatIssueDate(issueDate),
    organization: organizationName || "Medalverze",
    isVerified: true,
    category: eventId ? "events" : "portfolio",
    issuerLogo: "/app/assets/icons/cone.svg",
    coverImage: "/app/assets/icons/cone.svg",
  };

  getStore().items = [nextItem, ...getStore().items];
  return NextResponse.json({ success: true, data: nextItem }, { status: 201 });
}
