"use client";

type Props = {
  twoFactorEnabled: boolean;
  onToggleTwoFactor: (next: boolean) => void;
  onOpenChangePassword: () => void;
  onOpenLogoutDevices: () => void;
};

export function SecuritySettingsMenu({
  twoFactorEnabled,
  onToggleTwoFactor,
  onOpenChangePassword,
  onOpenLogoutDevices,
}: Props) {
  return (
    <div className="space-y-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Two-factor Authentication</h3>
          <p className="mt-2 text-base text-slate-500">Add an extra verification step to secure your account.</p>
        </div>
        <Toggle checked={twoFactorEnabled} onChange={onToggleTwoFactor} />
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-base font-semibold text-slate-800">Change Password</h4>
          <p className="mt-2 text-base text-slate-500">Update your account password.</p>
        </div>
        <button
          type="button"
          onClick={onOpenChangePassword}
          className="h-11 rounded-2xl border border-slate-300 px-6 text-base text-slate-800 transition hover:bg-slate-50"
        >
          Change Password
        </button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-base font-semibold text-slate-800">Device Login</h4>
          <p className="mt-2 text-base text-slate-500">Sign out from all devices at once.</p>
        </div>
        <button
          type="button"
          onClick={onOpenLogoutDevices}
          className="h-11 rounded-2xl border border-rose-400 px-6 text-base text-rose-600 transition hover:bg-rose-50"
        >
          Logout All Devices
        </button>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative h-8 w-[50px] rounded-full transition ${
        disabled ? "cursor-not-allowed bg-slate-200" : checked ? "bg-[#4B8EDF]" : "bg-slate-300"
      }`}
      aria-pressed={checked}
    >
      <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition ${checked ? "left-[22px]" : "left-1"}`} />
    </button>
  );
}
