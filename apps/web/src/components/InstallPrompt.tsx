"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();

      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if already installed (development info)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      // PWA already installed, no need to show prompt
    }

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
    setIsDismissed(true);
  };

  if (isDismissed) {
    return null;
  }

  if (!isInstallable) {
    return (
      <div className="relative rounded border-l-4 border-blue-500 bg-blue-500/10 p-4 text-sm text-muted-foreground">
        <button
          onClick={handleDismiss}
          aria-label="Dismiss notification"
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
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
        <strong>PWA Status:</strong> Ready for installation
        <br />
        <span className="text-xs">
          On mobile: Use browser menu → &ldquo;Add to Home Screen&rdquo;
          <br />
          On desktop: Look for install icon in address bar
        </span>
      </div>
    );
  }

  return (
    <div className="relative rounded border-l-4 border-green-500 bg-green-500/10 p-4">
      <button
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
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
        Install Mahjong League App
      </h3>
      <p className="mb-3 text-sm text-muted-foreground">
        Install this app on your device for quick access and offline capability.
      </p>
      <button
        onClick={handleInstallClick}
        className="rounded bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
      >
        Install App
      </button>
    </div>
  );
}
