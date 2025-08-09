"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useConfigStore } from "@/stores/configStore";

export function useConfigParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { setActiveConfig, checkDataAvailability } = useConfigStore();

  // Read config from URL on mount
  useEffect(() => {
    const handleConfigFromURL = async (hash: string) => {
      // Check if data exists
      const hasData = await checkDataAvailability(hash);

      if (hasData) {
        // Set active config
        setActiveConfig(hash);
      } else {
        // TODO: Handle case where config hash is unknown
        // For now, just set it and let the UI handle it
        setActiveConfig(hash);
      }
    };

    const configHash = searchParams.get("config");
    if (configHash) {
      // Load configuration from hash
      handleConfigFromURL(configHash);
    }
  }, [searchParams, setActiveConfig, checkDataAvailability]);

  const updateURLConfig = (hash: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (hash) {
      params.set("config", hash);
    } else {
      params.delete("config");
    }

    const search = params.toString();
    const query = search ? `?${search}` : "";

    router.replace(`${pathname}${query}`);
  };

  return {
    configHash: searchParams.get("config"),
    updateURLConfig,
  };
}
