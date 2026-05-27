"use client";

import Image from "next/image";
import { type ChangeEvent } from "react";

type Props = {
  initial: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  avatarPreview: string | null;
  onFullNameChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDeleteAccount: () => void;
};

export function ProfileSettingsMenu({
  initial,
  fullName,
  username,
  email,
  phone,
  avatarPreview,
  onFullNameChange,
  onUsernameChange,
  onEmailChange,
  onPhoneChange,
  onAvatarChange,
  onDeleteAccount,
}: Props) {
  return (
    <>
      <h3 className="text-base font-medium text-slate-800">Profile Picture</h3>
      <div className="mt-5 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {avatarPreview ? (
            <Image src={avatarPreview} alt="Profile preview" width={80} height={80} className="h-20 w-20 rounded-full object-cover" unoptimized />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black text-5xl font-semibold text-white">{initial}</div>
          )}
          <div>
            <p className="text-base font-medium text-slate-800">{fullName}</p>
            <p className="text-base text-slate-400">{username}</p>
          </div>
        </div>
        <label className="cursor-pointer rounded-xl border border-[#3C7ACB] px-5 py-2 text-base font-medium text-[#3C7ACB] transition hover:bg-[#EEF5FC]">
          Change Image
          <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
        </label>
      </div>

      <h4 className="mt-7 text-base font-medium text-slate-800">Personal Information</h4>

      <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-base text-slate-700">Full Name</span>
          <input
            value={fullName}
            onChange={(event) => onFullNameChange(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-300 px-3 text-base outline-none focus:border-[#3C7ACB]"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-base text-slate-700">Username</span>
          <input
            value={username}
            onChange={(event) => onUsernameChange(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-300 px-3 text-base outline-none focus:border-[#3C7ACB]"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-base text-slate-700">Email</span>
          <input
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-300 px-3 text-base outline-none focus:border-[#3C7ACB]"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-base text-slate-700">Phone Number</span>
          <div className="flex h-11 items-center gap-3 rounded-xl border border-slate-300 px-3">
            <span className="text-base text-slate-700">+66</span>
            <span className="text-slate-300">|</span>
            <input value={phone} onChange={(event) => onPhoneChange(event.target.value)} className="h-full w-full text-base text-slate-700 outline-none" />
          </div>
        </label>
      </div>

      <div className="my-6 h-px bg-slate-200" />

      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-[70%] space-y-2">
          <h4 className="text-base font-medium text-slate-800">Account Deletion</h4>
          <p className="text-base leading-relaxed text-slate-600">
            Your account and all associated data will be permanently deleted after email confirmation. This action cannot be undone.
          </p>
        </div>
        <button
          type="button"
          onClick={onDeleteAccount}
          className="rounded-xl border border-rose-400 px-5 py-2 text-base font-medium text-rose-600 transition hover:bg-rose-50"
        >
          Delete Account
        </button>
      </div>
    </>
  );
}
