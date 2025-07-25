# Riichi Mahjong League - Product Requirements

## Product Vision

The Riichi Mahjong League is a mobile-first web application that tracks competitive mahjong games and player ratings. Like following your favorite sports league, players can see real-time standings, track their performance over time, and review game results - all optimized for quick access on mobile devices.

## Core User Experience

### 1. League Standings (Home)

**What users see**: A live leaderboard showing who's winning the current season.

**Key features**:

- **Current Rankings**: Players listed by rating (highest first) with their current score
- **Rating Movement**: Green/red indicators showing if someone is climbing or falling (↑2.4 or ↓1.2)
- **Quick Stats**: Tap any player to see their recent performance in an expandable card
- **Mini Performance Chart**: A small sparkline showing their rating trend
- **Fresh Data**: Pull down to refresh, with a timestamp showing when data was last updated
- **Season Summary**: Total games played and active players at the top

**Mobile-first design**:

- Install as an app on your phone's home screen
- Works offline showing cached data
- Large touch targets for easy tapping
- Smooth animations when expanding player cards

### 2. Player Profiles

**What users see**: A detailed view of any player's performance, like checking a stock's historical price.

**Key features**:

- **Player Header**: Name, current rank (#1, #2, etc.), rating score, and total games
- **Rating Chart**: A line graph showing rating over time - exactly like viewing stock prices
  - Each point shows their rating after that game
  - Tap/hover to see exact values
  - Time filters: Last 7 days, 14 days, 30 days, or all time
- **Performance Metrics**:
  - Average placement (1.5 means averaging between 1st and 2nd)
  - Rating change over last 30 days (↑5.2 or ↓3.1)
  - Last time they played
- **Game History**: Recent games showing:
  - Date and placement (1st, 2nd, 3rd, 4th)
  - Rating change from that game (↑2.4)
  - Who they played against (tap names to visit their profiles)
  - Load more to see additional games

**User flows**:

- Navigate from leaderboard by tapping "View Profile"
- Direct URL access for sharing (`/player/[id]`)
- Swipe or tap back to return

### 3. Game History

**What users see**: A chronological feed of all games played in the league.

**Key features**:

- **Game Cards**: Each game shows:
  - Date and time
  - All 4 players with placement medals (🥇🥈🥉4️⃣)
  - Final scores in points
  - How much each player's rating changed (↑1.2 or ↓0.8)
- **Filtering**:
  - Dropdown to show only games with a specific player
  - Shows game count per player
  - "All Games" option to clear filter
- **Smart Loading**:
  - Shows 10 most recent games initially
  - "Load More" reveals all their games
  - "Show Less" collapses back to 10

**What we DON'T show**:

- Complex scoring adjustments (uma/oka) - these are internal calculations
- Just show the final table scores that players understand

### 4. Progressive Web App Features

**Installation prompt**:

- Suggest installing the app for quick access
- Dismissible notification that remembers user preference
- Automatically hidden if already installed
- Clear benefits: "Install for offline access and quick launch"

**Offline capabilities**:

- View cached standings and profiles without internet
- Clear indicator when viewing offline data
- Automatic sync when connection returns

## Design Principles

### Mobile-First, But Universal

- Designed for one-handed phone use
- Works great on tablets and desktop too
- Single responsive design (not separate mobile/desktop versions)
- Bottom navigation for easy thumb access

### Performance Matters

- Pages load in under 2 seconds
- Instant response to taps and swipes
- Smooth 60fps animations
- Minimal data usage

### Clear Information Hierarchy

1. **Most Important**: Current ratings and rankings
2. **Important**: Recent changes and trends
3. **Supportive**: Historical data and details

### Intuitive Data Visualization

- Rating charts work like stock price charts - accumulated values over time
- Color coding: Green for gains, red for losses
- Clear number formatting (1,234 not 1234)
- Relative time stamps ("2 hours ago" vs exact times)

## User Scenarios

### "How am I doing?"

Sarah opens the app to check her current ranking. She sees she's #3 with a rating of 76.4, up 2.1 points from last week. She taps her card to see the mini chart and notices an upward trend.

### "How did last night's games go?"

Mark checks the Games tab in the morning. He sees three games were played last night. In the first game, Joseph won with an impressive 42,700 points. Mark filters by his name to see just his games.

### "Is Alex getting better?"

Lisa visits Alex's profile to see his progression. The rating chart shows steady improvement from 45.2 to 67.8 over the past month. His average placement has improved from 3.2 to 2.4.

### "Quick check on the go"

Tom has the app installed on his phone. He taps the icon while commuting and instantly sees the current standings, even without internet (showing cached data from this morning).

## Success Metrics

### User Engagement

- Daily active users checking standings
- Profile views per user session
- App installation rate on mobile devices
- Return visitor rate

### Performance

- Page load time < 2 seconds
- Time to interactive < 1 second
- Offline usage percentage
- Zero layout shift during loading

### Usability

- Time to find specific information
- Successful task completion rates
- User error rates
- Accessibility compliance

## Information Architecture

```
Home (Leaderboard)
├── Player Card (Expandable)
│   └── View Full Profile → Player Profile
│
Player Profile
├── Rating Chart
├── Performance Stats
└── Game History
    └── Opponent Name → Player Profile
│
Games Tab
├── Filter by Player
└── Game Cards
    └── Player Names → Player Profile
```

## What Success Looks Like

Players check the app regularly like checking social media or sports scores. They can quickly see how they're doing, understand rating changes at a glance, and dive deeper into performance trends when desired. The app becomes the definitive source for league standings that players reference during games and share with others.

## Future Considerations

While not in initial scope, the product architecture should support:

- Season comparisons and historical data
- Head-to-head statistics
- Tournament brackets and special events
- Push notifications for personal milestones
- Social features like comments or reactions

---

This requirements document focuses on the user experience and product value. Technical implementation details (like database schemas, API endpoints, or specific calculations) are left to the engineering team to determine the best approach for delivering this experience.
