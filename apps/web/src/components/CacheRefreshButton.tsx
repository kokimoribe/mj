"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useCacheInvalidation } from "@/lib/cache-invalidation";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function CacheRefreshButton() {
  const { invalidateAll } = useCacheInvalidation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await invalidateAll();
      // Force hard reload
      router.refresh();
      window.location.reload();
    } catch (error) {
      console.error("Cache refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      onClick={handleRefresh}
      disabled={isRefreshing}
      variant="outline"
      size="sm"
      className="fixed right-4 bottom-4 z-50"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      {isRefreshing ? "Refreshing..." : "Force Refresh"}
    </Button>
  );
}
