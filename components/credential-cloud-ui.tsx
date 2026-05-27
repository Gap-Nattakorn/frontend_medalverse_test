"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type CredentialCloudUIContextValue = {
  isSubmenuOpen: boolean;
  setIsSubmenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSubmenu: () => void;
  closeSubmenu: () => void;
  openSubmenu: () => void;
};

const CredentialCloudUIContext = createContext<CredentialCloudUIContextValue | null>(null);

export function CredentialCloudUIProvider({ children }: { children: React.ReactNode }) {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(true);

  const value = useMemo(
    () => ({
      isSubmenuOpen,
      setIsSubmenuOpen,
      toggleSubmenu: () => setIsSubmenuOpen((v) => !v),
      closeSubmenu: () => setIsSubmenuOpen(false),
      openSubmenu: () => setIsSubmenuOpen(true),
    }),
    [isSubmenuOpen]
  );

  return <CredentialCloudUIContext.Provider value={value}>{children}</CredentialCloudUIContext.Provider>;
}

export function useCredentialCloudUI() {
  const ctx = useContext(CredentialCloudUIContext);
  if (!ctx) throw new Error("useCredentialCloudUI must be used within CredentialCloudUIProvider");
  return ctx;
}