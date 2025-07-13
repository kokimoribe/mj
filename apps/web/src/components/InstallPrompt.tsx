"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();

      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      console.log("PWA is already installed");
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
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
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }

    // Clear the prompt
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (!isInstallable) {
    return (
      <div className="text-sm text-gray-500 p-4 border-l-4 border-blue-500 bg-blue-50 rounded">
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
    <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded">
      <h3 className="font-semibold text-green-800 mb-2">
        Install Mahjong League App
      </h3>
      <p className="text-sm text-green-700 mb-3">
        Install this app on your device for quick access and offline capability.
      </p>
      <button
        onClick={handleInstallClick}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
      >
        Install App
      </button>
    </div>
  );
}
