/**
 * Cache Invalidation Helper
 * Use this to force refresh all cached data
 */

import { useQueryClient } from "@tanstack/react-query";

export function useCacheInvalidation() {
  const queryClient = useQueryClient();

  const invalidateAll = async () => {
    console.log("🔄 Invalidating all queries...");

    // Invalidate all queries
    await queryClient.invalidateQueries();

    // Clear the query cache
    queryClient.clear();

    // Clear service worker cache if available
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log(`Deleting cache: ${cacheName}`);
          return caches.delete(cacheName);
        })
      );
    }

    // Force reload service worker
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.update();
      }
    }

    console.log("✅ Cache invalidation complete");
  };

  return { invalidateAll };
}

// Add cache busting timestamp to config
export const CACHE_VERSION = "1753510383080";
