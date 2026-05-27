import { NextRequest, NextResponse } from "next/server";
import { CredentialDetail, CredentialDetailResponse, CredentialItem } from "@/modules/credentials/domain/credential.types";
import {
  mapBackendCredentialToDetail,
  mapBackendCredentialToItem,
} from "@/modules/credentials/infrastructure/credential-api.mapper";
import { getMockCredentialById } from "@/modules/credentials/infrastructure/mock-credentials";
import { BACKEND_ACCESS_TOKEN_COOKIE } from "@/shared/auth/backend-access-token";
import { getAppDataMode, getBackendBaseUrl } from "@/shared/config/data-mode";

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

function toDetail(item: CredentialItem): CredentialDetail {
  return {
    credential: item,
    recipientName: "Daniel Lee",
    credentialId: `MV-${item.id.toUpperCase()}`,
    credentialCategory: item.type,
    organizationAbbreviation: "MV",
    organizationName: item.organization,
    rank: "First place",
    issueDate: item.issuedOn,
    expiryDate: "No Expiration",
    keyLearning:
      "This credential is generated from mock mode for frontend testing.",
    skills: ["Communication", "Collaboration"],
    evidence: ["Mock event data"],
    verifyUrl: `https://medalverse.ai/verify/${item.id}`,
  };
}

function isSharedRequest(request: NextRequest) {
  const value = request.nextUrl.searchParams.get("shared");
  return value === "1" || value === "true";
}

function blockPrivateShared(detail: CredentialDetail) {
  if (detail.credential.visibility !== "private") {
    return null;
  }
  return NextResponse.json(
    { success: false, error: "This credential is private and cannot be shared publicly" },
    { status: 403 },
  );
}

function applyDetailOverride(detail: CredentialDetail, id: string): CredentialDetail {
  const override = getOverrideStore().byId[id];
  if (!override) {
    return detail;
  }

  return {
    ...detail,
    ...override,
    credential: {
      ...detail.credential,
      ...(override.credential ?? {}),
    },
  };
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const sharedRequest = isSharedRequest(request);
  // console.log("🔥 Requested ID:", id)
  // console.log(`Handling GET /api/credentials/${id}`);
  // console.log(`Backend Base URL: ${getBackendBaseUrl()}`);

  if (getDeletedStore().ids.includes(id)) {
    return NextResponse.json({ success: false, error: "Credential not found" }, { status: 404 });
  }
  const mode = getAppDataMode();
  const created = getStore().items.find((item) => item.id === id);
  const localDetail = created ? toDetail(created) : getMockCredentialById(id);

  if (mode === "api") {
    const authorization = request.headers.get("authorization") ?? "";
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length).trim()
      : request.cookies.get(BACKEND_ACCESS_TOKEN_COOKIE)?.value ?? "";

    // Public shared link case (no login/token): serve local mock detail
    if (!token && !sharedRequest) {
      if (!localDetail) {
        return NextResponse.json({ success: false, error: "Credential not found" }, { status: 404 });
      }
      const mergedLocalDetail = applyDetailOverride(localDetail, id);
      const privateResponse = blockPrivateShared(mergedLocalDetail);
      if (privateResponse) {
        return privateResponse;
      }
      const response: CredentialDetailResponse = {
        success: true,
        data: mergedLocalDetail,
      };
      return NextResponse.json(response);
    }

    try {
      const backendResponse = await fetch(`${getBackendBaseUrl()}/api/v1/credentials/${id}${sharedRequest ? "?shared=1" : ""}`, {
        cache: "no-store",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!backendResponse.ok) {
        // If backend auth/record fails, allow public page to fallback to local/mock detail.
        if (localDetail) {
          const mergedLocalDetail = applyDetailOverride(localDetail, id);
          if (sharedRequest) {
            const privateResponse = blockPrivateShared(mergedLocalDetail);
            if (privateResponse) {
              return privateResponse;
            }
          }
          const response: CredentialDetailResponse = {
            success: true,
            data: mergedLocalDetail,
          };
          return NextResponse.json(response);
        }

        const payload = await backendResponse.json().catch(() => null);
        const error = payload && typeof payload.error === "string" ? payload.error : "Credential not found";
        return NextResponse.json({ success: false, error }, { status: backendResponse.status });
      }

      const backendPayload = await backendResponse.json().catch(() => null);

      // console.log(`\n🔥 === FETCHED DATA FROM BACKEND (ID: ${id}) === 🔥`);
      // console.log(JSON.stringify(backendPayload, null, 2));
      // console.log("==================================================\n");

      const raw = (backendPayload?.data ?? backendPayload) as Record<string, unknown>;
      const item = mapBackendCredentialToItem(raw);
      const detail = mapBackendCredentialToDetail(item, raw);
      if (sharedRequest) {
        const privateResponse = blockPrivateShared(detail);
        if (privateResponse) {
          return privateResponse;
        }
      }

      const response: CredentialDetailResponse = {
        success: true,
        data: detail,
      };
      return NextResponse.json(response);
    } catch {
      // Backend unreachable: keep UI usable with local/mock detail if possible.
      if (localDetail) {
        const mergedLocalDetail = applyDetailOverride(localDetail, id);
        const response: CredentialDetailResponse = {
          success: true,
          data: mergedLocalDetail,
        };
        return NextResponse.json(response);
      }

      return NextResponse.json(
        { success: false, error: "Unable to load credential detail" },
        { status: 502 },
      );
    }
  }

  const detail = localDetail;

  if (!detail) {
    return NextResponse.json({ success: false, error: "Credential not found" }, { status: 404 });
  }

  const mergedDetail = applyDetailOverride(detail, id);
  if (sharedRequest) {
    const privateResponse = blockPrivateShared(mergedDetail);
    if (privateResponse) {
      return privateResponse;
    }
  }

  const response: CredentialDetailResponse = {
    success: true,
    data: mergedDetail,
  };

  return NextResponse.json(response);
}
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  
  if (getDeletedStore().ids.includes(id)) {
    return NextResponse.json({ success: false, error: "Credential not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as { draft?: Record<string, unknown> } | null;
  if (!body?.draft) {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  const draft = body.draft;
  const mode = getAppDataMode();

  if (mode === "api") {
    const authorization = request.headers.get("authorization") ?? "";
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length).trim()
      : request.cookies.get(BACKEND_ACCESS_TOKEN_COOKIE)?.value ?? "";

    try {
      const backendPayload: Record<string, unknown> = {};

      if (draft.title !== undefined) backendPayload.name = draft.title;
      
      if (draft.credentialCategory !== undefined) backendPayload.type = String(draft.credentialCategory).toUpperCase(); 
      
      if (draft.recipientName !== undefined) backendPayload.recipient_name = draft.recipientName;
      if (draft.rank !== undefined) backendPayload.rank = draft.rank;
      if (draft.keyLearning !== undefined) backendPayload.key_learning = draft.keyLearning;
      
      if (draft.visibility !== undefined) backendPayload.is_private = draft.visibility === "private";

      const backendResponse = await fetch(`${getBackendBaseUrl()}/api/v1/credentials/${id}`, {
        method: "PUT", 
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(backendPayload),
      });

      if (!backendResponse.ok) {
        const payload = await backendResponse.json().catch(() => null);
        const error = payload && typeof payload.error === "string" ? payload.error : "Unable to update credential";
        return NextResponse.json({ success: false, error }, { status: backendResponse.status });
      }

      const updatedData = await backendResponse.json().catch(() => null);
      const raw = (updatedData?.data ?? updatedData) as Record<string, unknown>;
      
      const item = mapBackendCredentialToItem(raw);
      const detail = mapBackendCredentialToDetail(item, raw);

      return NextResponse.json({ success: true, data: detail });

    } catch (error) {
      console.error("Failed to update credential on backend:", error);
      return NextResponse.json({ success: false, error: "Unable to update credential" }, { status: 502 });
    }
  }

  // ==========================================
  // In mock/local mode, we update the in-memory store and return the merged result. 
  // ==========================================
  const created = getStore().items.find((item) => item.id === id);
  const baseDetail = created ? toDetail(created) : getMockCredentialById(id);

  if (!baseDetail) {
    return NextResponse.json({ success: false, error: "Credential not found" }, { status: 404 });
  }

  const nextDetail: CredentialDetail = {
    ...baseDetail,
    recipientName: String(draft.recipientName ?? baseDetail.recipientName),
    credentialId: String(draft.credentialId ?? baseDetail.credentialId),
    credentialCategory: String(draft.credentialCategory ?? baseDetail.credentialCategory),
    organizationAbbreviation: String(draft.organizationAbbreviation ?? baseDetail.organizationAbbreviation),
    organizationName: String(draft.organizationName ?? baseDetail.organizationName),
    rank: String(draft.rank ?? baseDetail.rank),
    issueDate: String(draft.issueDate ?? baseDetail.issueDate),
    keyLearning: String(draft.keyLearning ?? baseDetail.keyLearning),
    credential: {
      ...baseDetail.credential,
      title: String(draft.title ?? baseDetail.credential.title),
      description: String(draft.eventDescription ?? baseDetail.credential.description),
      organization: String(draft.organizationName ?? baseDetail.credential.organization),
      type: String(draft.credentialCategory ?? baseDetail.credential.type),
      issuedOn: String(draft.issueDate ?? baseDetail.credential.issuedOn),
      visibility:
        draft.visibility === "private" || draft.visibility === "public"
          ? draft.visibility
          : baseDetail.credential.visibility,
    },
  };

  getOverrideStore().byId[id] = nextDetail;

  const createdIndex = getStore().items.findIndex((item) => item.id === id);
  if (createdIndex >= 0) {
    getStore().items[createdIndex] = {
      ...getStore().items[createdIndex],
      title: nextDetail.credential.title,
      description: nextDetail.credential.description,
      organization: nextDetail.credential.organization,
      type: nextDetail.credential.type,
      issuedOn: nextDetail.credential.issuedOn,
      visibility: nextDetail.credential.visibility,
    };
  }

  return NextResponse.json({ success: true, data: nextDetail });
}


export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const mode = getAppDataMode();

  if (mode === "api") {
    const authorization = request.headers.get("authorization") ?? "";
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length).trim()
      : request.cookies.get(BACKEND_ACCESS_TOKEN_COOKIE)?.value ?? "";

    try {
      const backendResponse = await fetch(`${getBackendBaseUrl()}/api/v1/credentials/${id}`, {
        method: "DELETE",
        cache: "no-store",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!backendResponse.ok) {
        const payload = await backendResponse.json().catch(() => null);
        const error = payload && typeof payload.error === "string" ? payload.error : "Unable to delete credential";
        return NextResponse.json({ success: false, error }, { status: backendResponse.status });
      }
    } catch {
      return NextResponse.json({ success: false, error: "Unable to delete credential" }, { status: 502 });
    }
  }

  const deletedStore = getDeletedStore();
  if (!deletedStore.ids.includes(id)) {
    deletedStore.ids.push(id);
  }

  getStore().items = getStore().items.filter((item) => item.id !== id);
  delete getOverrideStore().byId[id];

  return NextResponse.json({ success: true });
}
