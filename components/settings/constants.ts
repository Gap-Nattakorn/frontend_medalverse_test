"use client";

import { BellRing, Cookie, CreditCard, Globe, LockKeyhole, UserRoundPen } from "lucide-react";
import type { SettingsTab } from "@/components/settings/types";

export const SETTINGS_TABS: Array<{
  id: SettingsTab;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}> = [
  { id: "profile", label: "Profile", icon: UserRoundPen },
  { id: "language", label: "Language", icon: Globe },
  { id: "notification", label: "Notification", icon: BellRing },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "security", label: "Security", icon: LockKeyhole },
  { id: "privacy", label: "Privacy", icon: Cookie },
];

export const DELETE_REASONS = [
  "Didn’t find it useful",
  "Missing features I need",
  "Too expensive",
  "Difficult to use",
  "Technical issues",
  "Found a better alternative",
  "Too many notifications/emails",
  "Privacy or security concerns",
  "Other",
] as const;
