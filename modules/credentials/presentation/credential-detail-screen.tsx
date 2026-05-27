"use client";

import { useEffect, useMemo, useState } from "react";
import { CredentialDetail } from "@/modules/credentials/domain/credential.types";
import { withBackendAuthHeaders } from "@/shared/auth/backend-access-token.client";
import { apiPath } from "@/shared/constants/routes";

export function CredentialDetailScreen({
  credentialId,
  sharedData,
}: {
  credentialId: string;
  sharedData?: string;
}) {
  const isSharedView = useMemo(() => Boolean(sharedData), [sharedData]);
  const [detail, setDetail] = useState<CredentialDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(apiPath(`/api/credentials/${credentialId}${isSharedView ? "?shared=1" : ""}`), {
          signal: controller.signal,
          cache: "no-store",
          headers: isSharedView ? undefined : withBackendAuthHeaders(),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          const message =
            payload && typeof payload.error === "string" ? payload.error : "Failed to load credential detail";
          setError(message);
          setDetail(null);
          return;
        }

        const payload = await response.json().catch(() => null);
        if (payload?.success && payload?.data) {
          setDetail(payload.data as CredentialDetail);
          return;
        }

        setError("Credential not found");
        setDetail(null);
      } catch {
        if (!controller.signal.aborted) {
          setError("Failed to load credential detail");
          setDetail(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => controller.abort();
  }, [credentialId, isSharedView]);

  if (loading) {
    return (
      <div className="min-h-full rounded-3xl bg-gradient-to-br from-[#cfe4f8] to-[#dff2e9] p-5">
        <section className="mx-auto max-w-[1120px] overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
          <div className="h-[220px] animate-pulse rounded-[28px] bg-slate-200" />
          <div className="mt-16 space-y-3">
            <div className="h-7 w-1/2 animate-pulse rounded bg-slate-200" />
            <div className="h-5 w-1/3 animate-pulse rounded bg-slate-200" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="h-20 animate-pulse rounded bg-slate-200" />
              <div className="h-20 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="h-24 animate-pulse rounded bg-slate-200" />
          </div>
        </section>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="min-h-full rounded-3xl bg-gradient-to-br from-[#cfe4f8] to-[#dff2e9] p-5">
        <section className="mx-auto max-w-[1120px] rounded-3xl border border-rose-200 bg-rose-50/70 p-8 text-center">
          <h2 className="text-lg font-semibold text-rose-700">Unable to load credential</h2>
          <p className="mt-2 text-sm text-rose-600">{error ?? "Credential not found"}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-full rounded-3xl bg-gradient-to-br from-[#cfe4f8] to-[#dff2e9] p-5">
      <section className="mx-auto max-w-[1120px] overflow-hidden rounded-3xl border border-slate-200/80 bg-[#f9fbfd]/95 p-3 shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
        <div className="rounded-3xl bg-white p-4">
          <div className="relative">
            <div className="h-[220px] rounded-[28px] bg-[#d8e5f4]" />
            <div className="absolute -bottom-14 left-8 z-20 inline-flex h-[132px] w-[132px] items-center justify-center rounded-full border-[5px] border-white bg-[#94bce4] text-slate-700">
              <img src="/assets/icons/cone.svg" alt="Cone" className="h-[66px] w-[66px]" />
            </div>
          </div>

          <div className="px-6 pb-5 pt-20">

            <h1 className="text-[24px] font-semibold leading-tight text-slate-800">{detail.credential.title}</h1>

            <div className="mt-2 border-b border-[#dbe4ed] pb-3">
              <p className="text-[14px] text-slate-400">Recipient Name</p>
              <p className="mt-1 text-[18px] font-semibold leading-tight text-slate-800">{detail.recipientName}</p>
            </div>

            <div className="grid grid-cols-2 gap-x-4 border-b border-[#dbe4ed]">
              <InfoRow label="Credential Category" value={detail.credentialCategory} />
              <InfoRow label="Organization Abbreviation" value={detail.organizationAbbreviation} />
              <InfoRow className="col-span-2" label="Organization Name" value={detail.organizationName} />
            </div>

            <div className="grid grid-cols-2 gap-x-4 border-b border-[#dbe4ed]">
              <InfoRow label="Rank" value={detail.rank} />
              <InfoRow label="Issue Date" value={detail.issueDate} />
            </div>

            <div className="pt-3">
              <p className="text-[14px] text-slate-400">Key Learning</p>
              <p className="mt-1 text-[16px] leading-[1.7] font-medium text-slate-700">{detail.keyLearning}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoRow({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`border-b border-[#dbe4ed] py-3 last:border-b-0 ${className ?? ""}`}>
      <p className="text-[14px] text-slate-400">{label}</p>
      <p className="mt-1 text-[18px] font-semibold leading-tight text-slate-800">{value}</p>
    </div>
  );
}
