"use client";

import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { AppToast, type AppToastPayload } from "@/components/ui/AppToast";
import { ROUTES } from "@/shared/constants/routes";
import { getPasswordValidationState } from "@/shared/auth/password-validation";
import {
  PROFILE_AVATAR_STORAGE_KEY,
  PROFILE_AVATAR_UPDATED_EVENT,
  PROFILE_SETTINGS_STORAGE_KEY,
} from "@/shared/constants/profile";
import { clearBackendAccessToken } from "@/shared/auth/backend-access-token.client";
import { SETTINGS_TABS } from "@/components/settings/constants";
import {
  type DeleteFlowStep,
  type LegalModalType,
  type PersistedProfileSettings,
  type SecurityModalStep,
  type SettingsTab,
} from "@/components/settings/types";
import { SettingsSectionCard } from "@/components/settings/shared/SettingsSectionCard";
import { SettingsSidebar } from "@/components/settings/shared/SettingsSidebar";
import { ProfileSettingsMenu } from "@/components/settings/profile/ProfileSettingsMenu";
import { DeleteAccountFlowDialog } from "@/components/settings/profile/dialogs/DeleteAccountFlowDialog";
import { LanguageSettingsMenu } from "@/components/settings/language/LanguageSettingsMenu";
import { NotificationSettingsMenu } from "@/components/settings/notification/NotificationSettingsMenu";
import { PaymentSettingsMenu } from "@/components/settings/payment/PaymentSettingsMenu";
import { SecuritySettingsMenu } from "@/components/settings/security/SecuritySettingsMenu";
import { SecurityLogoutDevicesDialog } from "@/components/settings/security/dialogs/SecurityLogoutDevicesDialog";
import { SecurityChangePasswordDialog } from "@/components/settings/security/dialogs/SecurityChangePasswordDialog";
import { SecuritySetNewPasswordDialog } from "@/components/settings/security/dialogs/SecuritySetNewPasswordDialog";
import { PrivacySettingsMenu } from "@/components/settings/privacy/PrivacySettingsMenu";
import { LegalDocumentDialog } from "@/components/settings/privacy/dialogs/LegalDocumentDialog";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  name: string;
};

function getInitial(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    return "U";
  }
  return trimmed.slice(0, 1).toUpperCase();
}

function toUsername(name: string) {
  const normalized = name.trim().toLowerCase().replace(/\s+/g, "");
  if (!normalized) {
    return "@member";
  }
  return `@${normalized}`;
}

function getInitialProfileSettings(name: string): PersistedProfileSettings {
  const fallback: PersistedProfileSettings = {
    fullName: name,
    username: toUsername(name),
    email: "Example@email.com",
    phone: "84 268 8558",
    platformLanguage: "English",
    avatarPreview: null,
  };

  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window.localStorage.getItem(PROFILE_SETTINGS_STORAGE_KEY);
  if (!raw) {
    const avatar = window.localStorage.getItem(PROFILE_AVATAR_STORAGE_KEY);
    return { ...fallback, avatarPreview: avatar };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedProfileSettings>;
    return {
      fullName: parsed.fullName || fallback.fullName,
      username: parsed.username || fallback.username,
      email: parsed.email || fallback.email,
      phone: parsed.phone || fallback.phone,
      platformLanguage: parsed.platformLanguage === "ไทย (Thai)" ? "ไทย (Thai)" : "English",
      avatarPreview: typeof parsed.avatarPreview === "string" ? parsed.avatarPreview : null,
    };
  } catch {
    return fallback;
  }
}

export function SettingsDialog({ isOpen, onClose, name }: Props) {
  const router = useRouter();
  const initialProfileSettings = getInitialProfileSettings(name);

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [fullName, setFullName] = useState(initialProfileSettings.fullName);
  const [username, setUsername] = useState(initialProfileSettings.username);
  const [email, setEmail] = useState(initialProfileSettings.email);
  const [phone, setPhone] = useState(initialProfileSettings.phone);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [platformLanguage, setPlatformLanguage] = useState<"English" | "ไทย (Thai)">(initialProfileSettings.platformLanguage);
  const [notificationSettings, setNotificationSettings] = useState({
    accountSecurity: true,
    eventUpdates: true,
    credentialUpdates: false,
    offers: true,
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [securityModalStep, setSecurityModalStep] = useState<SecurityModalStep>("none");
  const [hasOtherActiveSessions, setHasOtherActiveSessions] = useState(true);
  const [securityCurrentPassword, setSecurityCurrentPassword] = useState("");
  const [securityNewPassword, setSecurityNewPassword] = useState("");
  const [securityConfirmPassword, setSecurityConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialProfileSettings.avatarPreview);
  const [toast, setToast] = useState<AppToastPayload | null>(null);

  const [deleteFlowStep, setDeleteFlowStep] = useState<DeleteFlowStep>("none");
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteReasonDetail, setDeleteReasonDetail] = useState("");
  const [deleteReasonMenuOpen, setDeleteReasonMenuOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  const [legalModalType, setLegalModalType] = useState<LegalModalType | null>(null);
  const [legalModalContent, setLegalModalContent] = useState("");
  const [legalModalLoading, setLegalModalLoading] = useState(false);
  const [legalModalError, setLegalModalError] = useState<string | null>(null);

  const initial = getInitial(name);

  const resetDeleteFlow = useCallback(() => {
    setDeleteFlowStep("none");
    setDeleteReason("");
    setDeleteReasonDetail("");
    setDeleteReasonMenuOpen(false);
    setDeletePassword("");
  }, []);

  const onDeleteComplete = useCallback(() => {
    clearBackendAccessToken();
    resetDeleteFlow();
    onClose();
    router.replace(ROUTES.dashboard);
    router.refresh();
  }, [onClose, resetDeleteFlow, router]);

  const resetSecurityFlow = useCallback(() => {
    setSecurityModalStep("none");
    setSecurityCurrentPassword("");
    setSecurityNewPassword("");
    setSecurityConfirmPassword("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (legalModalType) {
          setLegalModalType(null);
          return;
        }
        if (securityModalStep !== "none") {
          resetSecurityFlow();
          return;
        }
        if (deleteFlowStep !== "none") {
          resetDeleteFlow();
          return;
        }
        onClose();
      }
    }

    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [isOpen, onClose, deleteFlowStep, legalModalType, resetDeleteFlow, resetSecurityFlow, securityModalStep]);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timeout = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const tabLabel = useMemo(() => SETTINGS_TABS.find((tab) => tab.id === activeTab)?.label ?? "Profile", [activeTab]);

  if (!isOpen) {
    return null;
  }

  const showProfile = activeTab === "profile";

  function onAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  const passwordValidation = getPasswordValidationState(securityNewPassword, securityConfirmPassword);
  const hasMinLength = passwordValidation.hasMinLength;
  const hasSpecial = passwordValidation.hasSpecial;
  const passwordsMatched = passwordValidation.matched;
  const canResetNewPassword = passwordValidation.isValid;

  function onConfirmLogoutAllDevices() {
    setSecurityModalStep("none");
    if (!hasOtherActiveSessions) {
      setToast({
        type: "success",
        title: "No other active sessions found.",
        message: "You’re currently signed in on this device only.",
      });
      return;
    }

    setHasOtherActiveSessions(false);
    setToast({
      type: "success",
      title: "Successfully signed out from all other devices.",
      message: "All other devices will be signed out. You’ll stay signed in on this device.",
    });
  }

  function openDeleteFlow() {
    setDeleteFlowStep("warning");
    setDeleteReasonMenuOpen(false);
  }

  function openLegalModal(type: LegalModalType) {
    const isThai = platformLanguage === "ไทย (Thai)";
    const pathByType: Record<LegalModalType, string> = {
      policy: isThai ? "/app/assets/legal/policy-th.txt" : "/app/assets/legal/policy-en.txt",
      terms: isThai ? "/app/assets/legal/terms-th.txt" : "/app/assets/legal/terms-en.txt",
    };

    setLegalModalType(type);
    setLegalModalLoading(true);
    setLegalModalError(null);
    setLegalModalContent("");

    fetch(pathByType[type], { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load document");
        }
        const text = await response.text();
        setLegalModalContent(text);
      })
      .catch(() => {
        setLegalModalError("Unable to load document content.");
      })
      .finally(() => {
        setLegalModalLoading(false);
      });
  }

  function onSaveSettings() {
    if (typeof window !== "undefined") {
      const payload: PersistedProfileSettings = {
        fullName,
        username,
        email,
        phone,
        platformLanguage,
        avatarPreview,
      };
      window.localStorage.setItem(PROFILE_SETTINGS_STORAGE_KEY, JSON.stringify(payload));
      if (avatarPreview) {
        window.localStorage.setItem(PROFILE_AVATAR_STORAGE_KEY, avatarPreview);
      } else {
        window.localStorage.removeItem(PROFILE_AVATAR_STORAGE_KEY);
      }
      window.dispatchEvent(new Event(PROFILE_AVATAR_UPDATED_EVENT));
    }

    setToast({
      type: "success",
      title: "Successfully updated",
      message: "Your changes have been saved.",
    });
  }

  return (
    <div className="fixed inset-0 z-[13000] flex items-center justify-center bg-black/35 p-4">
      <AppToast toast={toast} onClose={() => setToast(null)} />

      {securityModalStep === "logout-devices" ? (
        <SecurityLogoutDevicesDialog onCancel={resetSecurityFlow} onConfirm={onConfirmLogoutAllDevices} />
      ) : null}
      {securityModalStep === "change-password" ? (
        <SecurityChangePasswordDialog
          email={email}
          currentPassword={securityCurrentPassword}
          onCurrentPasswordChange={setSecurityCurrentPassword}
          onClose={resetSecurityFlow}
          onNext={() => setSecurityModalStep("set-new-password")}
        />
      ) : null}
      {securityModalStep === "set-new-password" ? (
        <SecuritySetNewPasswordDialog
          newPassword={securityNewPassword}
          confirmPassword={securityConfirmPassword}
          showNewPassword={showNewPassword}
          showConfirmPassword={showConfirmPassword}
          hasMinLength={hasMinLength}
          hasSpecial={hasSpecial}
          passwordsMatched={passwordsMatched}
          canSubmit={canResetNewPassword}
          onNewPasswordChange={setSecurityNewPassword}
          onConfirmPasswordChange={setSecurityConfirmPassword}
          onToggleShowNewPassword={() => setShowNewPassword((prev) => !prev)}
          onToggleShowConfirmPassword={() => setShowConfirmPassword((prev) => !prev)}
          onClose={resetSecurityFlow}
          onSubmit={() => {
            resetSecurityFlow();
            setToast({
              type: "success",
              title: "Password updated successfully.",
              message: "Your password has been changed.",
            });
          }}
        />
      ) : null}

      {legalModalType ? (
        <LegalDocumentDialog
          title={legalModalType === "terms" ? "Term of Service" : "Privacy Notice"}
          content={legalModalContent}
          loading={legalModalLoading}
          error={legalModalError}
          onClose={() => setLegalModalType(null)}
        />
      ) : null}

      {deleteFlowStep !== "none" ? (
        <DeleteAccountFlowDialog
          step={deleteFlowStep}
          reason={deleteReason}
          reasonDetail={deleteReasonDetail}
          reasonMenuOpen={deleteReasonMenuOpen}
          password={deletePassword}
          onCancel={resetDeleteFlow}
          onReasonMenuToggle={() => setDeleteReasonMenuOpen((prev) => !prev)}
          onReasonSelect={(nextReason) => {
            setDeleteReason(nextReason);
            setDeleteReasonMenuOpen(false);
          }}
          onReasonDetailChange={setDeleteReasonDetail}
          onPasswordChange={setDeletePassword}
          onContinueFromWarning={() => setDeleteFlowStep("reason")}
          onContinueFromReason={() => setDeleteFlowStep("password")}
          onDeleteConfirmed={() => setDeleteFlowStep("success")}
          onBackToLogin={onDeleteComplete}
        />
      ) : null}

      {deleteFlowStep === "none" ? (
        <div className="flex h-[min(88vh,760px)] w-full max-w-[1040px] flex-col overflow-hidden rounded-2xl bg-white text-base font-medium shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h1 className="text-2xl font-medium text-slate-800">Settings</h1>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close settings dialog"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex min-h-0 flex-1">
            <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />

            <section className="min-h-0 flex-1 overflow-y-auto bg-slate-50/70 p-4">
              <SettingsSectionCard>
                {showProfile ? (
                  <ProfileSettingsMenu
                    initial={initial}
                    fullName={fullName}
                    username={username}
                    email={email}
                    phone={phone}
                    avatarPreview={avatarPreview}
                    onFullNameChange={setFullName}
                    onUsernameChange={setUsername}
                    onEmailChange={setEmail}
                    onPhoneChange={setPhone}
                    onAvatarChange={onAvatarChange}
                    onDeleteAccount={openDeleteFlow}
                  />
                ) : activeTab === "language" ? (
                  <LanguageSettingsMenu
                    platformLanguage={platformLanguage}
                    isMenuOpen={languageMenuOpen}
                    onToggleMenu={() => setLanguageMenuOpen((prev) => !prev)}
                    onSelectLanguage={(option) => {
                      setPlatformLanguage(option);
                      setLanguageMenuOpen(false);
                    }}
                  />
                ) : activeTab === "notification" ? (
                  <NotificationSettingsMenu settings={notificationSettings} onChange={setNotificationSettings} />
                ) : activeTab === "payment" ? (
                  <PaymentSettingsMenu />
                ) : activeTab === "security" ? (
                  <SecuritySettingsMenu
                    twoFactorEnabled={twoFactorEnabled}
                    onToggleTwoFactor={setTwoFactorEnabled}
                    onOpenChangePassword={() => setSecurityModalStep("change-password")}
                    onOpenLogoutDevices={() => setSecurityModalStep("logout-devices")}
                  />
                ) : activeTab === "privacy" ? (
                  <PrivacySettingsMenu onOpenTerms={() => openLegalModal("terms")} onOpenPolicy={() => openLegalModal("policy")} />
                ) : (
                  <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8">
                    <div className="text-center">
                      <h3 className="text-base font-medium text-slate-800">{tabLabel}</h3>
                      <p className="mt-2 text-base text-slate-500">This section will be available soon.</p>
                    </div>
                  </div>
                )}
              </SettingsSectionCard>
            </section>
          </div>

          <div className="flex items-center justify-end gap-4 border-t border-slate-200 px-6 py-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-8 py-2.5 text-base font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSaveSettings}
              className="rounded-xl bg-slate-900 px-10 py-2.5 text-base font-medium text-white transition hover:bg-slate-800"
            >
              Save
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
