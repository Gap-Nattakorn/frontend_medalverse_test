/** Must match `basePath` in next.config.ts */
export const APP_BASE_PATH = "/app" as const;

/** Prefix Next.js route handlers when `basePath` is set (fetch does not add it automatically). */
export function apiPath(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${APP_BASE_PATH}${normalized}`;
}

export const ROUTES = {
  home: "/",
  /** Legacy path — middleware redirects to dashboard (login removed). */
  login: "/login",
  dashboard: "/credentials-cloud/credentials",
} as const;
