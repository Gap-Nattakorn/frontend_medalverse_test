"use client";

export type SettingsTab = "profile" | "language" | "notification" | "payment" | "security" | "privacy";

export type DeleteFlowStep = "none" | "warning" | "reason" | "password" | "success";
export type LegalModalType = "policy" | "terms";
export type SecurityModalStep = "none" | "logout-devices" | "change-password" | "set-new-password";

export type LanguageOption = "English" | "ไทย (Thai)";

export type NotificationSettings = {
  accountSecurity: boolean;
  eventUpdates: boolean;
  credentialUpdates: boolean;
  offers: boolean;
};

export type PersistedProfileSettings = {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  platformLanguage: LanguageOption;
  avatarPreview: string | null;
};
