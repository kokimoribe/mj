"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// localStorage keys for persistence
const PWA_STORAGE_KEYS = {
  DISMISSED: "pwa-install-dismissed",
  DISMISSED_DATE: "pwa-install-dismissed-date",
};

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalledPWA, setIsInstalledPWA] = useState(false);

  useEffect(() => {
    // Check if running as installed PWA
    const checkIfInstalledPWA = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: fullscreen)").matches ||
        window.matchMedia("(display-mode: minimal-ui)").matches;

      // iOS Safari check
      const isIOSStandalone =
        "standalone" in window.navigator &&
        (window.navigator as Navigator & { standalone?: boolean }).standalone;

      // Android app check
      const isAndroidApp = document.referrer.includes("android-app://");

      return isStandalone || isIOSStandalone || isAndroidApp;
    };

    // Check localStorage for previous dismissal
    const checkDismissalStatus = () => {
      try {
        const dismissed = localStorage.getItem(PWA_STORAGE_KEYS.DISMISSED);
        return dismissed === "true";
      } catch {
        // localStorage might not be available
        return false;
      }
    };

    // Set initial states
    setIsInstalledPWA(checkIfInstalledPWA());
    setIsDismissed(checkDismissalStatus());

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();

      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for user response
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      // User accepted PWA installation
    } else {
      // User dismissed PWA installation
    }

    // Clear the prompt
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const handleDismiss = () => {
    // Persist dismissal preference
    try {
      localStorage.setItem(PWA_STORAGE_KEYS.DISMISSED, "true");
      localStorage.setItem(
        PWA_STORAGE_KEYS.DISMISSED_DATE,
        new Date().toISOString()
      );
    } catch {
      // localStorage might not be available
    }
    setIsDismissed(true);
  };

  // Don't show prompt if:
  // 1. User is already using installed PWA
  // 2. User has previously dismissed the prompt
  // 3. Browser doesn't support PWA installation
  if (isInstalledPWA || isDismissed) {
    return null;
  }

  if (!isInstallable) {
    return (
      <div
        className="text-muted-foreground relative rounded border-l-4 border-blue-500 bg-blue-500/10 p-4 text-sm"
        data-testid="pwa-install-prompt"
      >
        <button
          onClick={handleDismiss}
          aria-label="Dismiss notification"
          className="text-muted-foreground hover:text-foreground absolute top-2 right-2 transition-colors"
          data-testid="dismiss-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <strong>Welcome to River Terrace Mahjong Parlor:</strong> Ready to
        install?
        <br />
        <span className="text-xs">
          On mobile: Use browser menu → &ldquo;Add to Home Screen&rdquo;
        </span>
      </div>
    );
  }

  return (
    <div
      className="relative rounded border-l-4 border-green-500 bg-green-500/10 p-4"
      data-testid="pwa-install-prompt"
    >
      <button
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        className="text-muted-foreground hover:text-foreground absolute top-2 right-2 transition-colors"
        data-testid="dismiss-button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <h3 className="mb-2 font-semibold text-green-500">
        Welcome to River Terrace Mahjong Parlor.
      </h3>
      <p className="text-muted-foreground mb-3 text-sm">
        Click to this app on your device.
      </p>
      <button
        onClick={handleInstallClick}
        className="rounded bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
        data-testid="install-button"
      >
        Install App
      </button>
    </div>
  );
}
