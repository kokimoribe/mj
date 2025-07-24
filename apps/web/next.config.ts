import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
};

// Enhanced PWA configuration with TypeScript-first support
export default withPWA({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "production", // Temporarily disable PWA in production due to service worker error
  reloadOnOnline: true,
  workboxOptions: {
    skipWaiting: true,
    runtimeCaching: [
      {
        urlPattern: /^https?.*$/,
        handler: "NetworkFirst",
        options: {
          cacheName: "offlineCache",
          expiration: {
            maxEntries: 200,
          },
        },
      },
    ],
  },
})(nextConfig);
