import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PlayerProfileView } from './PlayerProfileView'
import * as queries from '@/lib/queries'

// Mock the hooks
vi.mock('@/lib/queries', () => ({
  usePlayerProfile: vi.fn(),
  useGameHistory: vi.fn(),
}))

const mockPlayerData = {
  id: 'joseph',
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
}

const mockGameHistory = {
  games: [
    {
      id: '1',
      date: '2024-01-15',
      players: [
        { name: 'Joseph', placement: 1, score: 48000, plusMinus: 23000, ratingDelta: 25 },
        { name: 'Josh', placement: 2, score: 35000, plusMinus: 10000, ratingDelta: 10 },
        { name: 'Mikey', placement: 3, score: 20000, plusMinus: -5000, ratingDelta: -5 },
        { name: 'Hyun', placement: 4, score: -3000, plusMinus: -28000, ratingDelta: -30 },
      ],
    },
    {
      id: '2',
      date: '2024-01-14',
      players: [
        { name: 'Joseph', placement: 2, score: 30000, plusMinus: 5000, ratingDelta: 5 },
        { name: 'Josh', placement: 1, score: 45000, plusMinus: 20000, ratingDelta: 20 },
        { name: 'Mikey', placement: 3, score: 15000, plusMinus: -10000, ratingDelta: -10 },
        { name: 'Hyun', placement: 4, score: 10000, plusMinus: -15000, ratingDelta: -15 },
      ],
    },
  ],
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

describe('PlayerProfileView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays loading state while fetching data', () => {
    vi.mocked(queries.usePlayerProfile).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)
    
    vi.mocked(queries.useGameHistory).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)

    renderWithQuery(<PlayerProfileView playerId="joseph" />)
    
    // Should show skeleton loaders - 4 skeleton elements total
    const skeletons = document.querySelectorAll('[data-testid="skeleton"]')
    expect(skeletons).toHaveLength(4)
  })

  it('displays error state when player data fails to load', () => {
    vi.mocked(queries.usePlayerProfile).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Player not found'),
    } as any)
    
    vi.mocked(queries.useGameHistory).mockReturnValue({
      data: mockGameHistory,
      isLoading: false,
      error: null,
    } as any)

    renderWithQuery(<PlayerProfileView playerId="joseph" />)
    
    expect(screen.getByText('Failed to load player profile')).toBeInTheDocument()
  })

  it('displays player profile data when loaded', () => {
    vi.mocked(queries.usePlayerProfile).mockReturnValue({
      data: mockPlayerData,
      isLoading: false,
      error: null,
    } as any)
    
    vi.mocked(queries.useGameHistory).mockReturnValue({
      data: mockGameHistory,
      isLoading: false,
      error: null,
    } as any)

    renderWithQuery(<PlayerProfileView playerId="joseph" />)
    
    // Check player name and stats
    expect(screen.getByText('Joseph')).toBeInTheDocument()
    expect(screen.getByText(/Rank #1524.0/)).toBeInTheDocument() // Rating in header with decimal
    expect(screen.getByText(/42 games/)).toBeInTheDocument() // Games played
  })

  it('displays recent games section', () => {
    vi.mocked(queries.usePlayerProfile).mockReturnValue({
      data: mockPlayerData,
      isLoading: false,
      error: null,
    } as any)
    
    vi.mocked(queries.useGameHistory).mockReturnValue({
      data: mockGameHistory,
      isLoading: false,
      error: null,
    } as any)

    renderWithQuery(<PlayerProfileView playerId="joseph" />)
    
    // Check recent games section exists
    expect(screen.getByText('Recent Games')).toBeInTheDocument()
    // Component shows placeholder text instead of actual games
    expect(screen.getByText('Recent games will be displayed here')).toBeInTheDocument()
    expect(screen.getByText('View All Games →')).toBeInTheDocument()
  })

  it('displays rating trend section', () => {
    vi.mocked(queries.usePlayerProfile).mockReturnValue({
      data: mockPlayerData,
      isLoading: false,
      error: null,
    } as any)
    
    vi.mocked(queries.useGameHistory).mockReturnValue({
      data: mockGameHistory,
      isLoading: false,
      error: null,
    } as any)

    renderWithQuery(<PlayerProfileView playerId="joseph" />)
    
    // Check rating trend section exists
    expect(screen.getByText('Rating Trend')).toBeInTheDocument()
    expect(screen.getByText('Rating chart will go here')).toBeInTheDocument()
  })

  it('displays quick stats section', () => {
    vi.mocked(queries.usePlayerProfile).mockReturnValue({
      data: mockPlayerData,
      isLoading: false,
      error: null,
    } as any)
    
    vi.mocked(queries.useGameHistory).mockReturnValue({
      data: mockGameHistory,
      isLoading: false,
      error: null,
    } as any)

    renderWithQuery(<PlayerProfileView playerId="joseph" />)
    
    // Check quick stats section
    expect(screen.getByText('Quick Stats')).toBeInTheDocument()
    expect(screen.getByText('Win Rate')).toBeInTheDocument()
    expect(screen.getByText('35%')).toBeInTheDocument() // Win rate
    expect(screen.getByText('Avg Placement')).toBeInTheDocument()
    expect(screen.getByText('2.4')).toBeInTheDocument() // Avg placement
    expect(screen.getByText('Best Game')).toBeInTheDocument()
    expect(screen.getByText('+48000')).toBeInTheDocument() // Best game without comma
  })

  it('handles empty game history gracefully', () => {
    vi.mocked(queries.usePlayerProfile).mockReturnValue({
      data: mockPlayerData,
      isLoading: false,
      error: null,
    } as any)
    
    vi.mocked(queries.useGameHistory).mockReturnValue({
      data: { games: [] },
      isLoading: false,
      error: null,
    } as any)

    renderWithQuery(<PlayerProfileView playerId="joseph" />)
    
    // Should still show player info
    expect(screen.getByText('Joseph')).toBeInTheDocument()
    // Shows placeholder text for games
    expect(screen.getByText('Recent games will be displayed here')).toBeInTheDocument()
  })
})