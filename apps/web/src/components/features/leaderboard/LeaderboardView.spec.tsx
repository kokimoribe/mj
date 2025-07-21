import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LeaderboardView } from './LeaderboardView'
import * as queries from '@/lib/queries'
import { TEST_IDS } from '@/lib/test-ids'

// Mock the queries
vi.mock('@/lib/queries', () => ({
  useLeaderboard: vi.fn()
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mock data matching the specification
const mockLeaderboardData = {
  players: [
    {
      id: '1',
      name: 'Joseph',
      rating: 46.3,
      mu: 50.5,
      sigma: 2.1,
      games: 20,
      lastGameDate: '2024-01-15',
      totalPlusMinus: 15000,
      averagePlusMinus: 750,
      bestGame: 32700,
      worstGame: -25000,
      ratingChange: 2.1,
      ratingHistory: [44.2, 44.5, 44.8, 45.1, 45.3, 45.5, 45.8, 46.0, 46.1, 46.3]
    },
    {
      id: '2',
      name: 'Josh',
      rating: 39.2,
      mu: 42.5,
      sigma: 1.65,
      games: 16,
      lastGameDate: '2024-01-14',
      totalPlusMinus: -5000,
      averagePlusMinus: -312,
      bestGame: 35200,
      worstGame: -30000,
      ratingChange: -0.8,
      ratingHistory: [40.0, 39.8, 39.6, 39.4, 39.2]
    },
    {
      id: '3',
      name: 'Mikey',
      rating: 36.0,
      mu: 38.0,
      sigma: 1.0,
      games: 23,
      lastGameDate: '2024-01-14',
      totalPlusMinus: 1000,
      averagePlusMinus: 43,
      bestGame: 25000,
      worstGame: -31500,
      ratingChange: 0.4,
    },
    {
      id: '4',
      name: 'Hyun',
      rating: 32.2,
      mu: 34.5,
      sigma: 1.15,
      games: 14,
      lastGameDate: '2024-01-13',
      totalPlusMinus: -2000,
      averagePlusMinus: -143,
      bestGame: 20000,
      worstGame: -21500,
      ratingChange: -1.2,
    },
    {
      id: '5',
      name: 'Koki',
      rating: 31.9,
      mu: 34.0,
      sigma: 1.05,
      games: 20,
      lastGameDate: '2024-01-15',
      totalPlusMinus: 500,
      averagePlusMinus: 25,
      bestGame: 18000,
      worstGame: -20000,
      ratingChange: 0.6,
    },
    {
      id: '6',
      name: 'Rayshone',
      rating: 20.5,
      mu: 25.0,
      sigma: 2.25,
      games: 2,
      lastGameDate: '2024-01-10',
      totalPlusMinus: -5000,
      averagePlusMinus: -2500,
      bestGame: 5000,
      worstGame: -10000,
      ratingChange: 4.2,
    },
    {
      id: '7',
      name: 'Jackie',
      rating: 15.4,
      mu: 20.0,
      sigma: 2.3,
      games: 1,
      lastGameDate: '2024-01-08',
      totalPlusMinus: -8000,
      averagePlusMinus: -8000,
      bestGame: -8000,
      worstGame: -8000,
      ratingChange: 9.1,
    }
  ],
  totalGames: 24,
  lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  seasonName: 'Season 3'
}

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const renderWithQuery = (component: React.ReactElement) => {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  )
}

describe('PWA Leaderboard Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Data Model Requirements', () => {
    it('displays all required player fields', () => {
      vi.mocked(queries.useLeaderboard).mockReturnValue({
        data: mockLeaderboardData,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      } as any)

      renderWithQuery(<LeaderboardView />)

      // Check first player has all required fields displayed
      const josephCard = screen.getByText('Joseph').closest('[data-testid^="player-card-"]') as HTMLElement
      
      expect(within(josephCard).getByText('Joseph')).toBeInTheDocument() // name
      expect(within(josephCard).getByText('46.3')).toBeInTheDocument() // rating
      expect(within(josephCard).getByText('20 games')).toBeInTheDocument() // games played
      expect(within(josephCard).getByText(/↑\s*2\.1/)).toBeInTheDocument() // rating change
    })

    it('calculates rank client-side based on rating order', () => {
      vi.mocked(queries.useLeaderboard).mockReturnValue({
        data: mockLeaderboardData,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      } as any)

      renderWithQuery(<LeaderboardView />)

      // Players should be in rating order
      const playerNames = screen.getAllByRole('heading', { level: 3 }).map(el => el.textContent)
      expect(playerNames).toEqual(['Joseph', 'Josh', 'Mikey', 'Hyun', 'Koki', 'Rayshone', 'Jackie'])
    })
  })

  describe('Season Summary', () => {
    it('displays season metadata correctly', () => {
      vi.mocked(queries.useLeaderboard).mockReturnValue({
        data: mockLeaderboardData,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      } as any)

      renderWithQuery(<LeaderboardView />)

      expect(screen.getByText(/Season 3.*Leaderboard/)).toBeInTheDocument()
      expect(screen.getByText(/24\s+games/)).toBeInTheDocument()
      expect(screen.getByText(/7\s+players/)).toBeInTheDocument()
      expect(screen.getByText(/Updated.*ago/)).toBeInTheDocument()
    })

    it('shows correct "Updated X ago" based on materialized_at timestamp', () => {
      vi.mocked(queries.useLeaderboard).mockReturnValue({
        data: mockLeaderboardData,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      } as any)

      renderWithQuery(<LeaderboardView />)

      // Should show "Updated 2h ago" or similar
      expect(screen.getByText(/Updated.*[0-9]+[hm]?\s*ago/)).toBeInTheDocument()
    })
  })

  describe('Pull to Refresh', () => {
    it('invalidates all React Query caches on refresh', async () => {
      const mockRefetch = vi.fn().mockResolvedValue({})
      vi.mocked(queries.useLeaderboard).mockReturnValue({
        data: mockLeaderboardData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      } as any)

      const { toast } = await import('sonner')
      
      renderWithQuery(<LeaderboardView />)
      
      const refreshButton = screen.getByTestId(TEST_IDS.REFRESH_BUTTON)
      fireEvent.click(refreshButton)
      
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled()
        expect(toast.success).toHaveBeenCalledWith('Leaderboard updated!')
      })
    })

    it('shows dismissible error toast on refresh failure', async () => {
      const mockRefetch = vi.fn().mockRejectedValue(new Error('Network error'))
      vi.mocked(queries.useLeaderboard).mockReturnValue({
        data: mockLeaderboardData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      } as any)

      const { toast } = await import('sonner')
      
      renderWithQuery(<LeaderboardView />)
      
      const refreshButton = screen.getByTestId(TEST_IDS.REFRESH_BUTTON)
      fireEvent.click(refreshButton)
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to refresh leaderboard')
      })
    })
  })

  describe('Expandable Cards', () => {
    it('shows additional stats when expanded', async () => {
      vi.mocked(queries.useLeaderboard).mockReturnValue({
        data: mockLeaderboardData,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      } as any)

      renderWithQuery(<LeaderboardView />)
      
      const josephCard = screen.getByText('Joseph').closest('[data-testid^="player-card-"]')!
      
      // Initially collapsed
      expect(josephCard).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByText('Avg Placement:')).not.toBeInTheDocument()
      
      // Click to expand
      fireEvent.click(josephCard)
      
      // Should show expanded content
      await waitFor(() => {
        expect(josephCard).toHaveAttribute('aria-expanded', 'true')
        expect(screen.getByText('Avg Placement:')).toBeInTheDocument()
        expect(screen.getByText('Win Rate:')).toBeInTheDocument()
        expect(screen.getByText('Last Played:')).toBeInTheDocument()
        expect(screen.getByText('View Full Profile')).toBeInTheDocument()
      })
    })

    it('shows rating trend sparkline when player has rating history', async () => {
      vi.mocked(queries.useLeaderboard).mockReturnValue({
        data: mockLeaderboardData,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      } as any)

      renderWithQuery(<LeaderboardView />)
      
      const josephCard = screen.getByTestId('player-card-1')
      fireEvent.click(josephCard)
      
      await waitFor(() => {
        // Check that card is expanded
        expect(josephCard).toHaveAttribute('aria-expanded', 'true')
        // Check for rating trend text
        expect(screen.getByText('Rating Trend (Last 10 Games)')).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('shows "0 games played" message when no games', () => {
      vi.mocked(queries.useLeaderboard).mockReturnValue({
        data: {
          players: [],
          totalGames: 0,
          lastUpdated: new Date().toISOString(),
          seasonName: 'Season 3'
        },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      } as any)

      renderWithQuery(<LeaderboardView />)
      
      expect(screen.getByText(/0\s+games/)).toBeInTheDocument()
      expect(screen.getByText(/0\s+players/)).toBeInTheDocument()
    })

    it('sorts tied ratings by games played, then alphabetically', () => {
      const tiedData = {
        ...mockLeaderboardData,
        players: [
          { ...mockLeaderboardData.players[0], rating: 40.0, games: 20, name: 'Charlie' },
          { ...mockLeaderboardData.players[1], rating: 40.0, games: 20, name: 'Alice' },
          { ...mockLeaderboardData.players[2], rating: 40.0, games: 15, name: 'Bob' },
        ]
      }

      vi.mocked(queries.useLeaderboard).mockReturnValue({
        data: tiedData,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      } as any)

      renderWithQuery(<LeaderboardView />)
      
      const playerNames = screen.getAllByRole('heading', { level: 3 }).map(el => el.textContent)
      // Should be sorted by games (20, 20, 15), then alphabetically for ties
      expect(playerNames).toEqual(['Alice', 'Charlie', 'Bob'])
    })

    it('shows stale data with error message on query failure', () => {
      vi.mocked(queries.useLeaderboard).mockReturnValue({
        data: mockLeaderboardData, // Stale data
        isLoading: false,
        error: new Error('Network error'),
        refetch: vi.fn(),
        isRefetching: false,
      } as any)

      renderWithQuery(<LeaderboardView />)
      
      // Should show error but also display stale data
      expect(screen.getByText(/Failed to load leaderboard/)).toBeInTheDocument()
      expect(screen.getByText('Joseph')).toBeInTheDocument() // Stale data still visible
    })
  })

  describe('Performance Requirements', () => {
    it('renders without layout shift', () => {
      vi.mocked(queries.useLeaderboard).mockReturnValue({
        data: mockLeaderboardData,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      } as any)

      const { container } = renderWithQuery(<LeaderboardView />)
      
      // Check that key elements have defined heights to prevent shift
      const cards = container.querySelectorAll('[data-testid^="player-card-"]')
      cards.forEach(card => {
        expect(card).toHaveStyle({ minHeight: expect.any(String) })
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels for screen readers', () => {
      vi.mocked(queries.useLeaderboard).mockReturnValue({
        data: mockLeaderboardData,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      } as any)

      renderWithQuery(<LeaderboardView />)
      
      const cards = screen.getAllByRole('button', { name: /player card/i })
      expect(cards.length).toBeGreaterThan(0)
      
      cards.forEach(card => {
        expect(card).toHaveAttribute('aria-expanded')
        expect(card).toHaveAttribute('aria-label')
      })
    })

    it('supports keyboard navigation', () => {
      vi.mocked(queries.useLeaderboard).mockReturnValue({
        data: mockLeaderboardData,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      } as any)

      renderWithQuery(<LeaderboardView />)
      
      const firstCard = screen.getByTestId('player-card-1')
      firstCard.focus()
      
      expect(document.activeElement).toBe(firstCard)
      
      // Simulate Enter key to expand
      fireEvent.keyDown(firstCard, { key: 'Enter' })
      expect(firstCard).toHaveAttribute('aria-expanded', 'true')
    })
  })
});