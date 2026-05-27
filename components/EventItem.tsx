"use client";

import Link from "next/link";
import { Earth } from "lucide-react";
import { VerifiedBadgeImage } from "@/components/ui/VerifiedBadgeImage";

// Define Type of Tag
export type EventTag = {
  label: string;
  theme: "blue" | "green" | "orange" | "gray";
};

export type EventItemData = {
  id?: string;
  coverImage: string;
  badge: string;
  title: string;
  description: string;
  tags: EventTag[];
  eventDate: string;
  organization: string;
  isVerified: boolean;
};

export default function EventItem({
  data,
  href,
  onClick,
}: {
  data: EventItemData;
  href?: string;
  onClick?: () => void;
}) {
  const getTagStyle = (theme: EventTag["theme"]) => {
    switch (theme) {
      case "blue":
        return "bg-background-bg-brand-primary text-text-brand-primary";
      case "green":
        return "bg-background-bg-success-primary text-text-success-primary";
      case "orange":
        return "bg-background-bg-warning-primary text-text-warning-primary";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const cardBody = (
    <article className="group flex h-full min-h-[380px] flex-col overflow-hidden rounded-2xl border border-[#d8e7f5] bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(59,130,246,0.12)]">
      {/* 1. Cover Image Section */}
      <div className="relative h-[140px] w-full shrink-0 bg-slate-200">
        <img
          src={data.coverImage || "/app/assets/images/event-placeholder.jpg"}
          alt={data.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute right-3 top-3 flex items-center gap-2">
          <span className="rounded-full bg-black/40 px-3 py-1 backdrop-blur-sm border border-white/20 text-caption-caption-sm text-center text-white">
            {data.badge}
          </span>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm border border-white/20 transition hover:bg-black/60"
          >
            <Earth size={14} />
          </button>
        </div>
      </div>

      {/* 2. Content Section */}
      <div className="relative flex flex-1 flex-col px-4 pb-4 pt-4">
        <h3 className="line-clamp-2  text-body-md-semibold text-text-primary">
          {data.title}
        </h3>

        <p className="mt-2 line-clamp-3 min-h-[40px] text-caption-caption-sm text-text-secondary">
          {data.description}
        </p>

        {/* 3. Tags Section */}
        <div className="mt-3 flex flex-wrap gap-2">
          {data.tags.map((tag, index) => (
            <span
              key={index}
              className={`rounded-full px-2.5 py-1 text-caption-caption-sm text-center ${getTagStyle(tag.theme)}`}
            >
              {tag.label}
            </span>
          ))}
        </div>

        {/* 4. Footer Section */}
        <div className="mt-auto pt-4">
          <div className="mb-3 h-px w-full bg-[#e8eef5]" />
          <div className="flex items-end justify-between">
            <div>
              <p className="font-body text-[10px] leading-[100%] text-text-secondary mb-1.5">Event Date</p>
              <p className="text-body-sm-medium text-text-primary">
                {data.eventDate}
              </p>
            </div>
            <div className="text-left">
              <p className="text-[10px] text-text-secondary mb-0.5">Organization</p>
              <div className="flex items-center gap-1 text-[13px] font-medium text-text-primary">
                <span>{data.organization}</span>
                {data.isVerified ? <VerifiedBadgeImage size={22} /> : null}
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

  if (!href) return cardBody;
  return (
    <Link href={href} className="h-full block">
      {cardBody}
    </Link>
  );
}
