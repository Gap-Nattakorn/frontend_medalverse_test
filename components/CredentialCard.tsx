"use client";

import Link from "next/link";
import { useState } from "react";
import { Earth, LockKeyhole } from "lucide-react";
import { VerifiedBadgeImage } from "@/components/ui/VerifiedBadgeImage";

type CredentialCardData = {
  type: string;
  title: string;
  description: string;
  issuedOn: string;
  organization: string;
  isVerified: boolean;
};

export default function CredentialCard({
  data,
  href,
  onClick,
}: {
  data: CredentialCardData;
  href?: string;
  onClick?: () => void;
}) {
  const [visibility, setVisibility] = useState<"Public" | "Private">("Public");
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);

  const cardBody = (
    <article className="group flex h-full min-h-[286px] flex-col overflow-hidden rounded-2xl border border-[#d8e7f5] bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(59,130,246,0.12)]">
      <div className="relative h-[98px] shrink-0 rounded-xl bg-gradient-to-b from-[#EEF5FC] to-[#DFECFA] m-2">
        <div className="absolute right-3 top-3 flex items-center gap-2">
          <span className="rounded-full bg-white/80 px-2 py-1 shadow-sm text-caption-caption-sm text-center text-text-brand-primary ">{data.type}</span>
          <div className="relative">
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setShowVisibilityMenu((prev) => !prev);
              }}
              className="inline-flex h-6 w-6 items-center justify-center shadow-sm rounded-full bg-white/80 text-text-brand-primary transition hover:bg-white"
              aria-label="Visibility"
            >
              {visibility === "Public" ? <Earth size={12} /> : <LockKeyhole size={12} />}
            </button>
            {showVisibilityMenu ? (
              <div className="absolute right-0 top-8 z-20 w-[108px] rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                {(["Public", "Private"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setVisibility(option);
                      setShowVisibilityMenu(false);
                    }}
                    className={`mb-1 w-full rounded-lg px-2 py-1.5 text-left text-body-sm-medium last:mb-0 ${
                      visibility === option ? "bg-slate-100 text-slate-800" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col px-6 pb-3 pt-9">
        <div className="absolute left-5 top-[-37px] flex h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-white bg-[#8fb6df] text-slate-700">
          <img src="/app/assets/icons/cone.svg" alt="Cone" className="h-9 w-9" />
        </div>

        <h3 className="mt-1 line-clamp-2 text-body-md-semibold text-text-primary">
          {data.title}
        </h3>

        <p className="mt-1.5 line-clamp-3 min-h-[50px] text-caption-caption-sm text-text-secondary">
          {data.description}
        </p>

        <div className="mt-auto pt-3">
          <div className="h-px w-full bg-[#e8eef5]" />
          <div className="mt-2.5 grid grid-cols-2 gap-3">
            <div className="min-w-0">
              <p className="font-body text-[10px] leading-[100%] text-text-secondary mb-1">Issued on</p>
              <p className="text-body-sm-medium text-text-primary">{data.issuedOn}</p>
            </div>
            <div className="min-w-0 text-left">
              <p className="font-body text-[10px] leading-[100%] text-text-secondary mb-0.5">Organization</p>
              <div className="flex items-start gap-2">
                <span className="line-clamp-2 text-body-sm-medium text-text-primary">
                  {data.organization}
                </span>
                {data.isVerified ? (
                  <VerifiedBadgeImage size={22} />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );

  if (onClick) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick();
          }
        }}
        className="h-full w-full cursor-pointer text-left"
      >
        {cardBody}
      </div>
    );
  }

  if (!href) {
    return cardBody;
  }

  return <Link href={href} className="h-full block">{cardBody}</Link>;
}
