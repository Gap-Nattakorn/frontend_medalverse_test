import { NextRequest, NextResponse } from "next/server";
import { EventDetailApiResponse } from "@/modules/experience/domain/dashboard.types";
import {
  extractBackendDetailPayload,
  mapBackendEventToDashboard,
  mapDashboardEventToDetail,
} from "@/modules/experience/infrastructure/event-api.mapper";
import { getMockEventDetail } from "@/modules/experience/infrastructure/mock-events";
import { BACKEND_ACCESS_TOKEN_COOKIE } from "@/shared/auth/backend-access-token";
import { getAppDataMode, getBackendBaseUrl } from "@/shared/config/data-mode";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const mode = getAppDataMode();

  if (mode === "api") {
    const authorization = request.headers.get("authorization");
    const cookieToken = request.cookies.get(BACKEND_ACCESS_TOKEN_COOKIE)?.value;
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length).trim()
      : cookieToken ?? "";

    const backendResponse = await fetch(`${getBackendBaseUrl()}/api/v1/events/${id}`, {
      cache: "no-store",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!backendResponse.ok) {
      const payload = await backendResponse.json().catch(() => null);
      const error = payload && typeof payload.error === "string" ? payload.error : "Event not found";
      return NextResponse.json({ success: false, error }, { status: backendResponse.status });
    }

    const backendPayload = await backendResponse.json().catch(() => null);
    const raw = extractBackendDetailPayload(backendPayload);
    if (!raw) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    const dashboardEvent = mapBackendEventToDashboard(raw, 0);
    const detail = mapDashboardEventToDetail(dashboardEvent, raw, []);
    const response: EventDetailApiResponse = {
      success: true,
      data: detail,
    };
    return NextResponse.json(response);
  }

  const detail = getMockEventDetail(id);

  if (!detail) {
    return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
  }

  const response: EventDetailApiResponse = {
    success: true,
    data: detail,
  };

  return NextResponse.json(response);
}
