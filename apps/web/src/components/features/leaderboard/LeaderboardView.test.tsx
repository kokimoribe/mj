import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LeaderboardView } from './LeaderboardView'
import * as queries from '@/lib/queries'

// Mock the useLeaderboard hook
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

const mockLeaderboardData = {
  players: [
    {
      id: '1',
      name: 'Joseph',
      rating: 1524,
      mu: 30.5,
      sigma: 5.2,
      games: 42,
      lastGameDate: '2024-01-15',
      totalPlusMinus: 15000,
      averagePlusMinus: 357,
      bestGame: 48000,
      worstGame: -25000,
      ratingChange: 25,
    },
    {
      id: '2',
      name: 'Josh',
      rating: 1488,
      mu: 29.8,
      sigma: 5.5,
      games: 38,
      lastGameDate: '2024-01-14',
      totalPlusMinus: -5000,
      averagePlusMinus: -132,
      bestGame: 35000,
      worstGame: -30000,
      ratingChange: -15,
    },
  ],
  totalGames: 50,
  lastUpdated: '2024-01-15T10:00:00Z',
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

describe('LeaderboardView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays loading skeleton while data is loading', () => {
    vi.mocked(queries.useLeaderboard).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
      isRefetching: false,
    } as any)

    renderWithQuery(<LeaderboardView />)
    
    // Should show skeleton elements
    // Should show skeleton elements - the exact number may vary
    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('displays error state when loading fails', () => {
    const mockRefetch = vi.fn()
    vi.mocked(queries.useLeaderboard).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Network error'),
      refetch: mockRefetch,
      isRefetching: false,
    } as any)

    renderWithQuery(<LeaderboardView />)
    
    expect(screen.getByText(/Failed to load leaderboard: Network error/i)).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('displays leaderboard data when loaded successfully', () => {
    vi.mocked(queries.useLeaderboard).mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      isRefetching: false,
    } as any)

    renderWithQuery(<LeaderboardView />)
    
    // Check header
    expect(screen.getByText(/Season 3.*Leaderboard/)).toBeInTheDocument()
    expect(screen.getByText(/50\s+games/)).toBeInTheDocument()
    expect(screen.getByText(/2\s+players/)).toBeInTheDocument()
    
    // Check players
    expect(screen.getByText('Joseph')).toBeInTheDocument()
    expect(screen.getByText('Josh')).toBeInTheDocument()
    expect(screen.getByText('1524.0')).toBeInTheDocument()
    expect(screen.getByText('1488.0')).toBeInTheDocument()
  })

  it('expands and collapses player cards when clicked', async () => {
    vi.mocked(queries.useLeaderboard).mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      isRefetching: false,
    } as any)

    renderWithQuery(<LeaderboardView />)
    
    const josephCard = screen.getByText('Joseph').closest('[data-slot="card"]')!
    
    // Initially collapsed
    expect(screen.queryByText('Win Rate')).not.toBeInTheDocument()
    
    // Click to expand
    fireEvent.click(josephCard)
    
    // Should show expanded content
    await waitFor(() => {
      expect(screen.getByText('Win Rate')).toBeInTheDocument()
    })
    
    // Click again to collapse
    fireEvent.click(josephCard)
    
    // Should hide expanded content
    await waitFor(() => {
      expect(screen.queryByText('Win Rate')).not.toBeInTheDocument()
    })
  })

  it('only allows one card to be expanded at a time', async () => {
    vi.mocked(queries.useLeaderboard).mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      isRefetching: false,
    } as any)

    renderWithQuery(<LeaderboardView />)
    
    const josephCard = screen.getByText('Joseph').closest('[data-slot="card"]')!
    const joshCard = screen.getByText('Josh').closest('[data-slot="card"]')!
    
    // Expand Joseph's card
    fireEvent.click(josephCard)
    await waitFor(() => {
      expect(screen.getAllByText('Win Rate')).toHaveLength(1)
    })
    
    // Click Josh's card - should collapse Joseph's and expand Josh's
    fireEvent.click(joshCard)
    await waitFor(() => {
      expect(screen.getAllByText('Win Rate')).toHaveLength(1) // Still only one expanded
    })
  })

  it('handles refresh button click', async () => {
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
    
    // Find the refresh button by its data-slot attribute since it has no text
    const refreshButton = screen.getByRole('button')
    fireEvent.click(refreshButton)
    
    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Leaderboard updated!')
    })
  })

  it('handles empty leaderboard data', () => {
    vi.mocked(queries.useLeaderboard).mockReturnValue({
      data: {
        players: [],
        totalGames: 0,
        lastUpdated: '2024-01-15T10:00:00Z',
        seasonName: 'Season 3'
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      isRefetching: false,
    } as any)

    renderWithQuery(<LeaderboardView />)
    
    // Check header shows zero games and players
    expect(screen.getByText(/0\s+games/)).toBeInTheDocument()
    expect(screen.getByText(/0\s+players/)).toBeInTheDocument()
  })

  it('shows refreshing state', () => {
    vi.mocked(queries.useLeaderboard).mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      isRefetching: true,
    } as any)

    renderWithQuery(<LeaderboardView />)
    
    // Find the refresh button by its data-slot attribute since it has no text
    const refreshButton = screen.getByRole('button')
    expect(refreshButton).toBeDisabled()
  })
})