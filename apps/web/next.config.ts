import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
};

// Enhanced PWA configuration with TypeScript-first support
export default withPWA({
  dest: "public",
  register: true,
  disable: false, // Re-enable PWA with fixed configuration
  reloadOnOnline: true,
  cacheStartUrl: true,
  dynamicStartUrl: false,
  workboxOptions: {
    skipWaiting: true,
    cleanupOutdatedCaches: true,
    // Force new service worker on 2025-07-26T06:13:03.080Z
    additionalManifestEntries: [
      { url: "/_cache_bust", revision: "1753510383081" },
    ],
    clientsClaim: true,
    // Remove the problematic runtimeCaching for now
    // We'll use the default caching strategy
  },
})(nextConfig);
