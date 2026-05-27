import Link from "next/link";
import { ROUTES } from "@/shared/constants/routes";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Page not found</h1>
      <p className="text-sm text-slate-600">The page you are looking for does not exist.</p>
      <Link href={ROUTES.dashboard} className="text-sm font-medium text-blue-600 hover:underline">
        Go to credentials
      </Link>
    </div>
  );
}
