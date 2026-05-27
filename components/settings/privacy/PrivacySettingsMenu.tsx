"use client";

type Props = {
  onOpenTerms: () => void;
  onOpenPolicy: () => void;
};

export function PrivacySettingsMenu({ onOpenTerms, onOpenPolicy }: Props) {
  return (
    <div className="space-y-8">
      <PrivacyRow title="Manage Cookie Preferences" description="Configure and manage how cookies are used across the platform." action="Manage Cookies" />
      <PrivacyRow
        title="Terms & Conditions"
        description="Review the terms and conditions for using the platform and its services."
        action="View Terms"
        onAction={onOpenTerms}
      />
      <PrivacyRow
        title="Privacy Notice"
        description="Learn how your personal data is collected, used, and protected in accordance with applicable laws."
        action="View Policy"
        onAction={onOpenPolicy}
      />
    </div>
  );
}

function PrivacyRow({
  title,
  description,
  action,
  onAction,
}: {
  title: string;
  description: string;
  action: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-5">
      <div className="max-w-[70%]">
        <h4 className="text-base font-semibold text-slate-800">{title}</h4>
        <p className="mt-2 text-base text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={onAction}
        className="h-11 w-[190px] rounded-2xl border border-slate-300 px-4 text-base text-slate-800 transition hover:bg-slate-50"
      >
        {action}
      </button>
    </div>
  );
}
