import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import { config as appConfig } from "@/config";
import { toast } from "sonner";
import { generateConfigHash } from "@/lib/utils/config-hash";

export interface RatingConfiguration {
  timeRange: {
    startDate: string | null;
    endDate: string | null;
    name: string;
  };
  rating: {
    initialMu: number;
    initialSigma: number;
    confidenceFactor: number;
    decayRate: number;
  };
  scoring: {
    oka: number;
    uma: [number, number, number, number];
  };
  weights: {
    divisor: number;
    min: number;
    max: number;
  };
  qualification: {
    minGames: number;
    dropWorst: number;
  };
}

export interface ActiveConfiguration {
  hash: string;
  name: string;
  isOfficial: boolean;
  data: RatingConfiguration;
}

export interface StoredConfiguration {
  hash: string;
  name: string;
  data: RatingConfiguration;
  createdAt: string;
}

export interface MaterializationStatus {
  isLoading: boolean;
  progress?: number;
  error?: string;
  lastChecked?: Date;
}

interface ConfigState {
  // Current state
  activeConfig: ActiveConfiguration | null;
  isLoading: boolean;
  error: string | null;

  // Official configurations
  officialConfigs: ActiveConfiguration[];

  // Stored configurations (localStorage)
  customConfigs: Record<string, StoredConfiguration>;

  // Materialization status
  materializationStatus: Record<string, MaterializationStatus>;

  // Actions
  loadOfficialConfigs: () => Promise<void>;
  setActiveConfig: (
    hash: string,
    config?: RatingConfiguration,
    name?: string
  ) => void;
  saveCustomConfig: (name: string, config: RatingConfiguration) => string;
  checkDataAvailability: (hash: string) => Promise<boolean>;
  triggerMaterialization: (
    hash: string,
    config: RatingConfiguration
  ) => Promise<void>;
  updateConfigName: (hash: string, name: string) => void;
  deleteCustomConfig: (hash: string) => void;
  pollMaterializationStatus: (hash: string) => void;

  // Legacy actions (for compatibility)
  selectedConfig: string;
  previewMode: boolean;
  setSelectedConfig: (configHash: string) => void;
  setPreviewMode: (enabled: boolean) => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      // Initial state
      activeConfig: {
        hash: appConfig.season.hash,
        name: appConfig.season.name,
        isOfficial: true,
        data: {
          timeRange: {
            startDate: "2025-12-28",
            endDate: "2026-06-30",
            name: "Season 5",
          },
          rating: {
            initialMu: 25,
            initialSigma: 8.33,
            confidenceFactor: 2,
            decayRate: 0.02,
          },
          scoring: {
            oka: 20000,
            uma: [10000, 5000, -5000, -10000],
          },
          weights: {
            divisor: 40,
            min: 0.5,
            max: 1.5,
          },
          qualification: {
            minGames: 8,
            dropWorst: 2,
          },
        },
      },
      isLoading: false,
      error: null,
      officialConfigs: [],
      customConfigs: {},
      materializationStatus: {},

      // Legacy compatibility
      selectedConfig: appConfig.season.hash,
      previewMode: false,

      // Actions
      loadOfficialConfigs: async () => {
        set({ isLoading: true, error: null });
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from("rating_configurations")
            .select("config_hash, name, config_data")
            .eq("is_official", true)
            .order("name");

          if (error) throw error;

          const configs =
            data?.map(item => {
              // Supabase returns JSONB columns as objects, not strings
              // But handle both cases for safety
              let configData: RatingConfiguration;
              if (typeof item.config_data === "string") {
                configData = JSON.parse(
                  item.config_data
                ) as RatingConfiguration;
              } else {
                configData = item.config_data as RatingConfiguration;
              }

              return {
                hash: item.config_hash,
                name: item.name,
                isOfficial: true,
                data: configData,
              };
            }) || [];

          set({ officialConfigs: configs, isLoading: false });
        } catch (error) {
          console.error("Failed to load official configs:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to load configurations",
            isLoading: false,
          });
        }
      },

      setActiveConfig: (hash, config, name) => {
        const state = get();

        // Check if it's an official config
        const officialConfig = state.officialConfigs.find(c => c.hash === hash);
        if (officialConfig) {
          set({
            activeConfig: officialConfig,
            selectedConfig: hash, // Legacy compatibility
          });
          return;
        }

        // Check if it's a custom config
        const customConfig = state.customConfigs[hash];
        if (customConfig) {
          set({
            activeConfig: {
              hash,
              name: customConfig.name,
              isOfficial: false,
              data: customConfig.data,
            },
            selectedConfig: hash, // Legacy compatibility
          });
          return;
        }

        // If config provided, it's a new config
        if (config) {
          set({
            activeConfig: {
              hash,
              name: name || "Custom Configuration",
              isOfficial: false,
              data: config,
            },
            selectedConfig: hash, // Legacy compatibility
          });
        }
      },

      saveCustomConfig: (name, config) => {
        // For now, generate a temporary hash synchronously
        // In a real app, you might want to handle this differently
        const tempHash = `temp-${Date.now()}`;

        // Generate the real hash asynchronously and update
        generateConfigHash(config).then(hash => {
          const state = get();
          const tempConfig = state.customConfigs[tempHash];

          if (tempConfig) {
            // Remove temp entry and add with real hash
            const updatedConfigs = { ...state.customConfigs };
            delete updatedConfigs[tempHash];
            set({
              customConfigs: {
                ...updatedConfigs,
                [hash]: {
                  hash,
                  name,
                  data: config,
                  createdAt: new Date().toISOString(),
                },
              },
            });

            // If this was the active config, update it
            if (state.activeConfig?.hash === tempHash) {
              set({
                activeConfig: {
                  hash,
                  name,
                  isOfficial: false,
                  data: config,
                },
              });
            }
          }
        });

        // Add temporary entry
        set(state => ({
          customConfigs: {
            ...state.customConfigs,
            [tempHash]: {
              hash: tempHash,
              name,
              data: config,
              createdAt: new Date().toISOString(),
            },
          },
        }));

        return tempHash;
      },

      checkDataAvailability: async hash => {
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from("cached_player_ratings")
            .select("player_id")
            .eq("config_hash", hash)
            .limit(1);

          if (error) throw error;
          return data && data.length > 0;
        } catch (error) {
          console.error("Failed to check data availability:", error);
          return false;
        }
      },

      triggerMaterialization: async (hash, config) => {
        set(state => ({
          materializationStatus: {
            ...state.materializationStatus,
            [hash]: { isLoading: true, error: undefined },
          },
        }));

        try {
          const response = await fetch("/api/materialize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              config_hash: hash,
              configuration: config,
            }),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Materialization failed");
          }

          // Start polling for completion
          get().pollMaterializationStatus(hash);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Materialization failed";
          set(state => ({
            materializationStatus: {
              ...state.materializationStatus,
              [hash]: { isLoading: false, error: errorMessage },
            },
          }));
          toast.error(errorMessage);
        }
      },

      pollMaterializationStatus: hash => {
        let attempts = 0;
        const maxAttempts = 30; // 30 attempts over ~60 seconds
        const delays = [2000, 4000, 8000]; // Exponential backoff

        const poll = async () => {
          attempts++;

          const hasData = await get().checkDataAvailability(hash);

          if (hasData) {
            set(state => ({
              materializationStatus: {
                ...state.materializationStatus,
                [hash]: { isLoading: false, error: undefined },
              },
            }));
            toast.success("Configuration data is ready!");
            // Trigger a data refresh
            window.location.reload();
            return;
          }

          if (attempts < maxAttempts) {
            const delay = delays[Math.min(attempts - 1, delays.length - 1)];
            setTimeout(poll, delay);
          } else {
            set(state => ({
              materializationStatus: {
                ...state.materializationStatus,
                [hash]: {
                  isLoading: false,
                  error: "Materialization timed out. Please try again.",
                },
              },
            }));
            toast.error("Configuration calculation timed out");
          }
        };

        poll();
      },

      updateConfigName: (hash, name) => {
        set(state => {
          const customConfig = state.customConfigs[hash];
          if (customConfig) {
            return {
              customConfigs: {
                ...state.customConfigs,
                [hash]: {
                  ...customConfig,
                  name,
                },
              },
            };
          }
          return state;
        });
      },

      deleteCustomConfig: hash => {
        set(state => {
          const newCustomConfigs = { ...state.customConfigs };
          delete newCustomConfigs[hash];
          return { customConfigs: newCustomConfigs };
        });
      },

      // Legacy compatibility
      setSelectedConfig: configHash => {
        get().setActiveConfig(configHash);
      },

      setPreviewMode: enabled => {
        set({ previewMode: enabled });
      },
    }),
    {
      name: "mahjong-config-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        customConfigs: state.customConfigs,
        activeConfig: state.activeConfig,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Error rehydrating config store:", error);
          return;
        }

        if (state?.activeConfig) {
          // If the restored config doesn't match the current default season,
          // reset it to the default Season 5
          if (state.activeConfig.hash !== appConfig.season.hash) {
            state.activeConfig = {
              hash: appConfig.season.hash,
              name: appConfig.season.name,
              isOfficial: true,
              data: {
                timeRange: {
                  startDate: "2025-12-28",
                  endDate: "2026-06-30",
                  name: "Season 5",
                },
                rating: {
                  initialMu: 25,
                  initialSigma: 8.33,
                  confidenceFactor: 2,
                  decayRate: 0.02,
                },
                scoring: {
                  oka: 20000,
                  uma: [10000, 5000, -5000, -10000],
                },
                weights: {
                  divisor: 40,
                  min: 0.5,
                  max: 1.5,
                },
                qualification: {
                  minGames: 8,
                  dropWorst: 2,
                },
              },
            };
            state.selectedConfig = appConfig.season.hash;
          }
        }
      },
    }
  )
);
