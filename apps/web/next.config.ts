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
    clientsClaim: true,
    // Use the default caching strategy
  },
})(nextConfig);
