import { cookies } from "next/headers";
import { SessionPayload } from "@/modules/auth/domain/auth.types";
import { verifySessionToken, SESSION_CONFIG } from "@/shared/auth/session-token";

/** Default session for frontend_credential_test — no login required. */
export const TEST_SESSION: SessionPayload = {
  sub: "test-user",
  email: "candidate@test.local",
  role: "member",
  name: "Test User",
  exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
  iat: Math.floor(Date.now() / 1000),
};

export async function getServerSession(): Promise<SessionPayload> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_CONFIG.cookieName)?.value;

  if (token) {
    const session = await verifySessionToken(token);
    if (session) {
      return session;
    }
  }

  return TEST_SESSION;
}
