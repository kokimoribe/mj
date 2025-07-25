"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff } from "lucide-react";

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    // Check initial status
    updateOnlineStatus();

    // Listen for online/offline events
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="sticky top-0 z-50 w-full" data-testid="offline-indicator">
      <Alert className="rounded-none border-x-0 border-t-0 border-orange-300 bg-orange-100 dark:border-orange-800 dark:bg-orange-900/20">
        <WifiOff className="h-4 w-4" />
        <AlertDescription className="text-orange-800 dark:text-orange-200">
          You&apos;re offline. Data shown may not be up to date.
        </AlertDescription>
      </Alert>
    </div>
  );
}
