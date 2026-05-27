"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Search, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import CredentialCard from "@/components/CredentialCard";
import { CredentialDetail, CredentialItem } from "@/modules/credentials/domain/credential.types";
import { withBackendAuthHeaders } from "@/shared/auth/backend-access-token.client";
import { apiPath } from "@/shared/constants/routes";

export function CredentialEventScreen({ credentialId }: { credentialId: string }) {
  const router = useRouter();
  const [detail, setDetail] = useState<CredentialDetail | null>(null);
  const [items, setItems] = useState<CredentialItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);

        const [detailResponse, listResponse] = await Promise.all([
          fetch(apiPath(`/api/credentials/${credentialId}`), {
            signal: controller.signal,
            cache: "no-store",
            headers: withBackendAuthHeaders(),
          }),
          fetch(apiPath("/api/credentials?search=&tab=all&page=1&pageSize=200"), {
            signal: controller.signal,
            cache: "no-store",
            headers: withBackendAuthHeaders(),
          }),
        ]);

        const detailPayload = await detailResponse.json().catch(() => null);
        const listPayload = await listResponse.json().catch(() => null);

        if (detailResponse.ok && detailPayload?.success && detailPayload?.data) {
          setDetail(detailPayload.data as CredentialDetail);
        }

        if (listResponse.ok && listPayload?.success && listPayload?.data?.items) {
          setItems(listPayload.data.items as CredentialItem[]);
        }
      } catch (error) {
        const isAbort =
          error instanceof DOMException &&
          (error.name === "AbortError" || error.message === "signal is aborted without reason");
        if (!isAbort) {
          setDetail(null);
          setItems([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => controller.abort();
  }, [credentialId]);

  const eventTitle = detail?.credential.title ?? "Event";
  const selectedEvent = useMemo(
    () => items.find((item) => item.id === credentialId),
    [items, credentialId],
  );
  const eventCoverImage =
    selectedEvent?.coverImage || detail?.credential.coverImage || "/assets/icons/cone.svg";
  const filteredByEvent = useMemo(() => {
    const byEvent = items.filter((item) => item.title === eventTitle);
    const q = search.trim().toLowerCase();
    if (!q) {
      return byEvent;
    }
    return byEvent.filter((item) =>
      `${item.title} ${item.organization}`.toLowerCase().includes(q),
    );
  }, [items, eventTitle, search]);

  const onShare = async () => {
    const url = `${window.location.origin}/credentials-cloud/credentials/${credentialId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-2">
        <div className="h-14 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
            <div className="h-[220px] animate-pulse rounded-2xl bg-slate-200" />
            <div className="space-y-3">
              <div className="h-9 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="h-16 w-full animate-pulse rounded bg-slate-200" />
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="h-12 animate-pulse rounded bg-slate-200" />
                <div className="h-12 animate-pulse rounded bg-slate-200" />
                <div className="h-12 animate-pulse rounded bg-slate-200" />
                <div className="h-12 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-2">
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => router.push("/credentials-cloud/credentials?tab=events")}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <button
          type="button"
          onClick={onShare}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
        >
          <Share2 size={14} />
          Share
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div>
            <img
              src={eventCoverImage}
              alt={eventTitle}
              className="h-[220px] w-full rounded-2xl object-cover"
            />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold text-slate-800">{eventTitle}</h1>
            <p className="text-slate-600">{detail?.credential.description}</p>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 text-sm">
              <div>
                <p className="text-slate-400">Held during</p>
                <p className="font-semibold text-slate-700">{detail?.issueDate || "-"}</p>
              </div>
              <div>
                <p className="text-slate-400">Venue</p>
                <p className="font-semibold text-slate-700">Central World Bangkok</p>
              </div>
              <div>
                <p className="text-slate-400">Organization</p>
                <p className="font-semibold text-slate-700">{detail?.organizationName || "-"}</p>
              </div>
              <div>
                <p className="text-slate-400">Competition level</p>
                <p className="font-semibold text-slate-700">Regional/state</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-4xl font-semibold text-slate-800">Credentials</h2>
          <button
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white"
          >
            <Plus size={16} />
            Add Credentials
          </button>
        </div>
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
          <Search size={18} className="text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search Credential"
            className="h-11 w-full border-0 bg-transparent text-sm text-slate-700 outline-none"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {filteredByEvent.length > 0 ? (
            filteredByEvent.map((item) => (
              <CredentialCard
                key={item.id}
                data={{
                  type: item.type,
                  title: item.title,
                  description: item.description,
                  issuedOn: item.issuedOn,
                  organization: item.organization,
                  isVerified: item.isVerified,
                  visibility: item.visibility,
                }}
              />
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No credentials found for this event.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
