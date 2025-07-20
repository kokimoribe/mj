import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GameHistoryView } from './GameHistoryView'
import * as queries from '@/lib/queries'

// Mock the hooks
vi.mock('@/lib/queries', () => ({
  useGameHistory: vi.fn(),
}))

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
        { name: 'Alice', placement: 1, score: 45000, plusMinus: 20000, ratingDelta: 20 },
        { name: 'Bob', placement: 2, score: 30000, plusMinus: 5000, ratingDelta: 5 },
        { name: 'Charlie', placement: 3, score: 15000, plusMinus: -10000, ratingDelta: -10 },
        { name: 'Diana', placement: 4, score: 10000, plusMinus: -15000, ratingDelta: -15 },
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

describe('GameHistoryView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays loading state while fetching data', () => {
    vi.mocked(queries.useGameHistory).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)

    renderWithQuery(<GameHistoryView />)
    
    // Should show skeleton loaders
    const skeletons = document.querySelectorAll('[data-testid="skeleton"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('displays error state when data fails to load', () => {
    vi.mocked(queries.useGameHistory).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load games'),
    } as any)

    renderWithQuery(<GameHistoryView />)
    
    expect(screen.getByText(/Failed to load game history/)).toBeInTheDocument()
  })

  it('displays game history when loaded', () => {
    vi.mocked(queries.useGameHistory).mockReturnValue({
      data: mockGameHistory,
      isLoading: false,
      error: null,
    } as any)

    renderWithQuery(<GameHistoryView />)
    
    // Check heading
    expect(screen.getByText('Recent Games')).toBeInTheDocument()
    
    // Check first game players
    expect(screen.getByText('Joseph')).toBeInTheDocument()
    expect(screen.getByText('Josh')).toBeInTheDocument()
    expect(screen.getByText('Mikey')).toBeInTheDocument()
    expect(screen.getByText('Hyun')).toBeInTheDocument()
    
    // Check placements
    expect(screen.getAllByText('1st')).toHaveLength(2) // Two games with 1st place
    expect(screen.getAllByText('2nd')).toHaveLength(2)
    expect(screen.getAllByText('3rd')).toHaveLength(2)
    expect(screen.getAllByText('4th')).toHaveLength(2)
  })

  it('formats scores correctly', () => {
    vi.mocked(queries.useGameHistory).mockReturnValue({
      data: mockGameHistory,
      isLoading: false,
      error: null,
    } as any)

    renderWithQuery(<GameHistoryView />)
    
    // Check formatted scores
    expect(screen.getByText('48,000')).toBeInTheDocument()
    expect(screen.getByText('35,000')).toBeInTheDocument()
    expect(screen.getByText('-3,000')).toBeInTheDocument()
  })

  it('displays plus/minus values', () => {
    vi.mocked(queries.useGameHistory).mockReturnValue({
      data: mockGameHistory,
      isLoading: false,
      error: null,
    } as any)

    renderWithQuery(<GameHistoryView />)
    
    // Check plus/minus values
    expect(screen.getByText('+23,000')).toBeInTheDocument()
    expect(screen.getByText('+10,000')).toBeInTheDocument()
    expect(screen.getByText('-5,000')).toBeInTheDocument()
    expect(screen.getByText('-28,000')).toBeInTheDocument()
  })

  it('handles empty game history', () => {
    vi.mocked(queries.useGameHistory).mockReturnValue({
      data: { games: [] },
      isLoading: false,
      error: null,
    } as any)

    renderWithQuery(<GameHistoryView />)
    
    expect(screen.getByText(/No games recorded yet/i)).toBeInTheDocument()
  })

  it('displays game dates with calendar icon', () => {
    vi.mocked(queries.useGameHistory).mockReturnValue({
      data: mockGameHistory,
      isLoading: false,
      error: null,
    } as any)

    renderWithQuery(<GameHistoryView />)
    
    // Check that calendar icons exist (one for each game)
    const calendarIcons = document.querySelectorAll('[class*="calendar"]')
    expect(calendarIcons.length).toBeGreaterThan(0)
    
    // Check that year 2024 is shown (at least once)
    const yearElements = screen.getAllByText(/2024/)
    expect(yearElements.length).toBeGreaterThan(0)
  })
})