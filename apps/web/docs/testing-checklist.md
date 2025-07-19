# Phase 0-2 Manual Testing Checklist

## Phase 0: UI Redesign & Progressive Disclosure

### Leaderboard View
- [ ] Leaderboard loads with player data
- [ ] Player cards show basic info (name, rating, games)
- [ ] Expandable cards work on click/tap
- [ ] Expanded view shows additional stats (win rate, avg placement, recent games)
- [ ] Mobile responsive - works on iPhone/Android
- [ ] Dark mode styling is consistent
- [ ] Rating trends show correctly
- [ ] Navigation to player profiles works

### Player Profile View
- [ ] Profile page loads for each player
- [ ] Basic stats display correctly
- [ ] Advanced stats are collapsible
- [ ] Rating history chart renders
- [ ] Recent games list is populated
- [ ] Head-to-head stats work
- [ ] Mobile layout is optimized

### Configuration Playground (Phase 0.5)
- [ ] Playground loads with default settings
- [ ] Sliders and inputs work correctly
- [ ] Live preview updates when changing settings
- [ ] Configuration templates can be selected
- [ ] Comparison mode shows side-by-side rankings
- [ ] Save configuration works
- [ ] Performance is acceptable (<500ms updates)

## Phase 1: Live Game Tracking

### Game Creation Flow
- [ ] "New Game" button is accessible
- [ ] Player selection works (can select 4 players)
- [ ] Seat assignment functions correctly
- [ ] Game creation completes successfully
- [ ] Redirects to live game tracker

### Live Game Tracker
- [ ] Initial scores display (25,000 each)
- [ ] Ron entry works correctly
- [ ] Tsumo entry calculates payments properly
- [ ] Draw handling works
- [ ] Riichi declarations update scores (-1000)
- [ ] Dealer rotation is correct
- [ ] Honba counter increments properly
- [ ] Score calculations are accurate
- [ ] Recent hands display updates
- [ ] Game timer runs
- [ ] Save button (should persist data)

### Data Persistence Issues
- [ ] Games are saved to database (FAILING)
- [ ] Game history is preserved after refresh (FAILING)
- [ ] Player statistics update after games (FAILING)

## Phase 2: Scheduling & Tournaments

### Schedule View
- [ ] Calendar displays current month
- [ ] Navigation between months works
- [ ] Today is highlighted
- [ ] Events show on calendar
- [ ] Click on date shows events
- [ ] Upcoming events list is populated
- [ ] "New Event" button is present
- [ ] Week view tab exists (shows coming soon)

### Tournament Creation
- [ ] Wizard steps progress correctly
- [ ] Form validation works
- [ ] Player selection limits work (based on format)
- [ ] All tournament formats are selectable
- [ ] Review step shows correct summary
- [ ] Create tournament completes (data not saved)

### Tournament List
- [ ] List shows all tournaments
- [ ] Filtering by status works (upcoming/live/completed)
- [ ] Tournament cards display correct info
- [ ] Navigation to tournament details works

### Tournament Bracket
- [ ] Bracket visualization renders
- [ ] Match results display correctly
- [ ] Live matches are highlighted
- [ ] Click on match shows details
- [ ] Standings tab shows player status
- [ ] All matches tab lists rounds

## Critical Issues Found

### 🔴 High Priority
1. **No Database Integration** - All features use mock data
2. **No Data Persistence** - Nothing is saved between sessions
3. **No Tests** - Zero frontend test coverage
4. **API Endpoints Missing** - Frontend has no way to save data
5. **Offline Support Missing** - Despite being in requirements

### 🟡 Medium Priority
1. **Form Validation** - Some inputs accept invalid data
2. **Error Handling** - No user feedback on failures
3. **Loading States** - No loading indicators
4. **Empty States** - Poor UX when no data exists

### 🟢 Low Priority
1. **Animations** - Transitions could be smoother
2. **Accessibility** - Missing ARIA labels
3. **PWA Features** - Offline mode, push notifications
4. **Performance** - Some components re-render unnecessarily

## Recommendation

**DO NOT PROCEED TO PHASE 3** until critical issues are resolved:

1. Set up frontend testing framework (Jest/Vitest + React Testing Library)
2. Create API integration layer with Supabase
3. Implement data persistence for all features
4. Write tests for critical user flows
5. Add error handling and loading states
6. Perform another bug bash after fixes

## Test Environment Setup

To properly test:
```bash
# Start development server
npm run dev

# In another terminal, run the rating engine
cd ../../apps/rating-engine
npm run dev

# Check that Supabase is configured
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Browser Testing Matrix
- [ ] Chrome (latest)
- [ ] Safari (iOS)
- [ ] Firefox
- [ ] Edge
- [ ] Mobile Safari (iPhone)
- [ ] Chrome (Android)

## Performance Benchmarks
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] No layout shifts