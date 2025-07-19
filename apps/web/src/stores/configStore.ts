import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface RatingConfiguration {
  timeRange: {
    startDate: string
    endDate: string
    name: string
  }
  rating: {
    initialMu: number
    initialSigma: number
    confidenceFactor: number
    decayRate: number
  }
  scoring: {
    oka: number
    uma: [number, number, number, number]
  }
  weights: {
    divisor: number
    min: number
    max: number
  }
  qualification: {
    minGames: number
    dropWorst: number
  }
}

interface ConfigState {
  selectedConfig: string
  previewMode: boolean
  customConfigs: Record<string, RatingConfiguration>
  setSelectedConfig: (configHash: string) => void
  setPreviewMode: (enabled: boolean) => void
  saveCustomConfig: (name: string, config: RatingConfiguration) => void
  deleteCustomConfig: (name: string) => void
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      selectedConfig: 'official-season-3',
      previewMode: false,
      customConfigs: {},
      
      setSelectedConfig: (configHash) =>
        set({ selectedConfig: configHash }),
      
      setPreviewMode: (enabled) =>
        set({ previewMode: enabled }),
      
      saveCustomConfig: (name, config) =>
        set((state) => ({
          customConfigs: {
            ...state.customConfigs,
            [name]: config,
          },
        })),
      
      deleteCustomConfig: (name) =>
        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [name]: _deleted, ...rest } = state.customConfigs
          return { customConfigs: rest }
        }),
    }),
    {
      name: 'mahjong-config-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)