"use client";

import { MoreVertical, Plus } from "lucide-react";

export function PaymentSettingsMenu() {
  return (
    <div>
      <h3 className="text-base font-semibold text-slate-800">Payment Methods</h3>
      <p className="mt-2 text-base text-slate-500">Manage payment methods for purchase on our platform</p>

      <div className="my-5 h-px bg-slate-200" />

      <div className="space-y-4">
        <PaymentMethodRow brand="VISA" cardName="Visa" isDefault />
        <PaymentMethodRow brand="MC" cardName="Mastercard" />
        <PaymentMethodRow brand="JCB" cardName="JCB" />
      </div>

      <button type="button" className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-base text-slate-700 transition hover:bg-slate-50">
        <Plus size={18} />
        Add Payment Method
      </button>
    </div>
  );
}

function PaymentMethodRow({
  brand,
  cardName,
  isDefault = false,
}: {
  brand: "VISA" | "MC" | "JCB";
  cardName: string;
  isDefault?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-20 items-center justify-center rounded-xl border border-slate-300 bg-slate-50">
          {brand === "VISA" ? (
            <span className="text-base font-bold italic text-[#1E3A8A]">VISA</span>
          ) : brand === "MC" ? (
            <div className="relative h-8 w-12">
              <span className="absolute left-0 top-0 h-8 w-8 rounded-full bg-red-500" />
              <span className="absolute left-4 top-0 h-8 w-8 rounded-full bg-amber-400/95" />
            </div>
          ) : (
            <span className="rounded bg-[#1B75BC] px-1.5 py-0.5 text-base font-bold text-white">JCB</span>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-base font-medium text-slate-900">{cardName}</p>
            {isDefault ? <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">Default</span> : null}
          </div>
          <p className="text-base text-slate-800">**** **** **** **** 9999</p>
        </div>
      </div>
      <button type="button" className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100">
        <MoreVertical size={20} />
      </button>
    </div>
  );
}
