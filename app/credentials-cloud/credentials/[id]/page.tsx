import { redirect } from "next/navigation";
import { CredentialDetailScreen } from "@/modules/credentials/presentation/credential-detail-screen";
import { CredentialEventScreen } from "@/modules/credentials/presentation/credential-event-screen";
import { getServerSession } from "@/shared/auth/server-session";
import { ROUTES } from "@/shared/constants/routes";

export default async function CredentialDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ shared?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const shared = resolvedSearchParams?.shared;
  const view = resolvedSearchParams?.view;
  const session = await getServerSession();

  if (session && view !== "event") {
    redirect(`${ROUTES.dashboard}?openCredential=${encodeURIComponent(id)}`);
  }

  if (view === "event") {
    return <CredentialEventScreen credentialId={id} />;
  }

  return <CredentialDetailScreen credentialId={id} sharedData={shared} />;
}
