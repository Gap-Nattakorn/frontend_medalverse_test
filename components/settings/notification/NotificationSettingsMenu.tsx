"use client";

import type { NotificationSettings } from "@/components/settings/types";

type Props = {
  settings: NotificationSettings;
  onChange: (settings: NotificationSettings) => void;
};

export function NotificationSettingsMenu({ settings, onChange }: Props) {
  return (
    <div className="space-y-7">
      <NotificationRow
        title="Account & Security Alerts"
        description="Important notifications related to your account and security."
        checked={settings.accountSecurity}
        onChange={(next) => onChange({ ...settings, accountSecurity: next })}
      />
      <NotificationRow
        title="Event Updates"
        description="Notifications about events and related activities."
        checked={settings.eventUpdates}
        onChange={(next) => onChange({ ...settings, eventUpdates: next })}
      />
      <NotificationRow
        title="Credential Updates"
        description="Notifications about your credentials and achievements."
        checked={settings.credentialUpdates}
        onChange={(next) => onChange({ ...settings, credentialUpdates: next })}
        disabled
      />
      <NotificationRow
        title="Offers & Announcements"
        description="Platform news, updates, and occasional offers."
        checked={settings.offers}
        onChange={(next) => onChange({ ...settings, offers: next })}
      />
    </div>
  );
}

function NotificationRow({
  title,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-5">
      <div>
        <h4 className="text-base font-semibold text-slate-800">{title}</h4>
        <p className="mt-1 text-base text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative mt-1 h-8 w-[50px] rounded-full transition ${
          disabled ? "cursor-not-allowed bg-slate-200" : checked ? "bg-[#4B8EDF]" : "bg-slate-300"
        }`}
      >
        <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition ${checked ? "left-[22px]" : "left-1"}`} />
      </button>
    </div>
  );
}
