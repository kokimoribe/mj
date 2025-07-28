# UI Design Specification - Phase 0 & 0.5

_Comprehensive UI/UX design document for the Riichi Mahjong League PWA_

## 📱 Design Overview

### Core Design Philosophy

- **Mobile-First**: iOS Safari optimized, PWA installable
- **Progressive Disclosure**: Clean surface, rich depths for exploration
- **Context-Rich**: Every data point has meaning and explanation when needed
- **Discovery-Oriented**: Hide complexity, reward curiosity
- **Modern UI**: Shadcn/ui components with dark mode support
- **Extensible**: Foundation for Phase 1 & 2 features

### Target Users

- **Primary**: 20-person friend group viewing on mobile
- **Secondary**: Desktop users for detailed analysis
- **Access**: Anonymous visitors (no auth required for Phase 0)

---

## 🎯 Phase 0: Core UI Components

### 1. Main Navigation Layout

```
┌─────────────────────────────────────────┐
│ 🀄 Riichi League  [Season 3] [Menu ≡]   │
├─────────────────────────────────────────┤
│ Main Content Area                       │
│                                         │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│ [Leaderboard] [Players] [Games] [Stats] │
└─────────────────────────────────────────┘
```

**Components:**

- **Header**: Logo, current season indicator, hamburger menu
- **Main Content**: Dynamic content area
- **Bottom Navigation**: Tab-based navigation for mobile

### 2. Leaderboard View (Primary Screen)

```
┌─────────────────────────────────────────┐
│ 🏆 Season 3 Leaderboard                 │
│ 24 games • 7 players • Updated 2h ago   │
├─────────────────────────────────────────┤
│ Joseph     46.3  ↑2.1    20 games      │
│ Josh       39.2  ↓0.8    16 games      │
│ Mikey      36.0  ↑0.4    23 games      │
│ Hyun       32.2  ↓1.2    14 games      │
│ Koki       31.9  ↑0.6    20 games      │
│ Rayshone   20.5  ↑4.2     2 games      │
│ Jackie     15.4  ↑9.1     1 game       │
└─────────────────────────────────────────┘
```

**Surface Level Features:**

- **Clean layout**: Name, rating, trend, games played
- **Trend indicators**: ↑↓ with rating change since last game
- **Natural ranking**: Position implies rank (no badges needed)
- **Tap to expand**: Each row expands to show quick stats
- **Pull to refresh**: Update data with pull gesture

**Expanded Card Features (on tap):**

```
┌─────────────────────────────────────────┐
│ Joseph     46.3  ↑2.1    20 games       │
├─────────────────────────────────────────┤
│ Avg Placement: 2.1                      │
│ Rating history:                         |
| <rating history graph goes here>        |
│                                         │
│ Recent games:                           │
│ [View Full Profile →]                   │
└─────────────────────────────────────────┘
```

### 3. Player Profile View

```
┌─────────────────────────────────────────┐
│ ← Joseph                                │
│ Rank #1 (placement in leaderboard) • Rating: 46.3 • 20 games      │
├─────────────────────────────────────────┤
│ 📈 Rating Trend                         │
│     /\  /\                              │
│    /  \/  \      Current: 46.3         │
│   /        \__   30-day: ↑4.2          │
│  /            \  Season: ↑8.1          │
├─────────────────────────────────────────┤
│ 🎯 Quick Stats                          │
│ Average Placement: 2.1                  │
│ Last Played: 3 days ago                 │
├─────────────────────────────────────────┤
│ 🎮 Recent Games                         │
│ Jul 6  • 1st • +32,700 pts • ↑0.8 (link to game details)      │
│ Jul 3  • 2nd • +15,200 pts • ↑0.3      │
│ Jul 1  • 3rd • -5,100 pts  • ↓0.2      │
│                                         │
│ [📊 Advanced Stats] [🎲 All Games] (link to all game logs)     │
└─────────────────────────────────────────┘
```

**Progressive Disclosure Layers:**

1. **Default View**: Shows essential performance metrics
2. **Advanced Stats Tab**:
   - More advanced stats will be developed later
3. **Rating Details** (collapsed by default):
   - "How ratings work" explanation
   - Current μ: 50.59, σ: 2.17
   - Confidence intervals visualization
   - Historical σ progression

### 4. Game History View

```
┌─────────────────────────────────────────┐
│ 🎮 Recent Games                         │
│ Showing 24 games from Season 3          │
├─────────────────────────────────────────┤
│ 📅 Jul 6, 2025 • 7:46 PM               │
│ 🥇 Joseph   42,700 → +32,700           │
│ 🥈 Alice    40,100 → +25,100           │
│ 🥉 Mikey    14,400 → -10,600           │
│ 4️⃣ Frank     2,800 → -27,200           │
│ [View Details →]                        │
├─────────────────────────────────────────┤
│ 📅 Jul 3, 2025 • 8:15 PM               │
│ 🥇 Josh     45,200 → +35,200           │
│ 🥈 Joseph   32,800 → +17,800           │
│ 🥉 Hyun     18,500 → -8,500            │
│ 4️⃣ Mikey     3,500 → -24,500           │
│ [View Details →]                        │
└─────────────────────────────────────────┘
```

**Features:**

- **Chronological feed**: Most recent games first
- **Quick results**: Placement icons, scores, plus/minus
- **Expandable details**: Tap for full game breakdown
- **Filter options**: By date range, player, placement

### 5. Statistics Dashboard

```
┌─────────────────────────────────────────┐
│ 📊 Season 3 Statistics                  │
├─────────────────────────────────────────┤
│ Overview                                │
│ 24 games played • 7 active players      │
│                                         │
│ 🏆 Records & Achievements               │
│ Biggest Win: Josh (+45,200)             │
│ Best Streak: Joseph (3 wins)            │
│ Most Games: Mikey (23)                  │
│                                         │
│ [Explore More Stats →]                  │
└─────────────────────────────────────────┘
```

**Exploration Sections (tap to reveal):**

1. **🎯 Placement Analysis**
   - Average placements by player
   - Distribution charts
   - Improvement trends

2. **🪑 Hidden Gem: Seat Performance**
   - East: 1.8 avg placement ⭐
   - South: 2.2 avg placement
   - West: 2.6 avg placement
   - North: 3.4 avg placement ⚠️
   - "Did you know? East seat wins 35% more!"

3. **📈 Rating Mathematics** (for the curious)
   - Interactive OpenSkill explanation
   - Why ratings change differently
   - Margin of victory impacts

4. **🎲 Fun Facts**
   - Biggest comeback stories
   - Unluckiest player metrics
   - Head-to-head rivalries
   - "Curse of the North Seat"

**Design Principles:**

- Start with highlights, let users dig deeper
- Each section rewards exploration
- Mix serious stats with fun discoveries
- Visual charts over raw numbers

---

## ⚙️ Phase 0.5: Configuration Playground

### 6. Configuration Control Panel

```
┌─────────────────────────────────────────┐
│ 🛠️ Configuration Playground             │
│ Experiment with rating parameters       │
├─────────────────────────────────────────┤
│ 📊 Rating Parameters                    │
│ Initial μ     [====●====] 25.0  (15-35)│
│ Initial σ     [===●=====] 8.33  (5-15) │
│ Confidence    [====●====] 2.0   (1-4)  │
│ Decay Rate    [=●=======] 0.02  (0-0.1)│
├─────────────────────────────────────────┤
│ 💰 Scoring System                       │
│ Oka          [====●====] 20k  (10-40k) │
│ Uma 1st      [====●====] 10k  (5-20k)  │
│ Uma 2nd      [===●=====] 5k   (0-15k)  │
│ Uma 3rd      [=●=======] -5k  (-15-0k) │
│ Uma 4th      [●========] -10k (-30-5k) │
├─────────────────────────────────────────┤
│ ⚖️ Margin of Victory                    │
│ Weight Divisor [===●====] 40   (20-80) │
│ Min Weight     [==●=====] 0.5  (0.1-1) │
│ Max Weight     [====●===] 1.5  (1-3)   │
├─────────────────────────────────────────┤
│ [Reset]                      [Submit]   │
└─────────────────────────────────────────┘
```

**Features:**

- **Parameter grouping**: Logical sections for related settings
- **Visual feedback**: Color-coded sliders for different ranges
- **Quick actions**: Reset, save, preview buttons

---

## 🎨 Visual Design System

### Color Palette (Dark Mode First)

```
Primary:   #0ea5e9 (Blue 500)
Secondary: #64748b (Slate 500)
Success:   #10b981 (Emerald 500)
Warning:   #f59e0b (Amber 500)
Error:     #ef4444 (Red 500)
Background: #020617 (Slate 950)
Surface:   #0f172a (Slate 900)
Border:    #1e293b (Slate 800)
Text:      #f1f5f9 (Slate 100)
Muted:     #64748b (Slate 500)
```

### Typography

- **Headers**: Inter 24px/32px Bold
- **Subheaders**: Inter 18px/24px Semibold
- **Body**: Inter 14px/20px Regular
- **Captions**: Inter 12px/16px Regular
- **Monospace**: JetBrains Mono (for ratings, scores)

### Spacing System

- **Base unit**: 4px
- **Small**: 8px (2 units)
- **Medium**: 16px (4 units)
- **Large**: 24px (6 units)
- **XL**: 32px (8 units)

### Border Radius

- **Small**: 4px (buttons, chips)
- **Medium**: 8px (cards, inputs)
- **Large**: 12px (panels, modals)

---

## 📱 Mobile-First Considerations

### Touch Targets

- **Minimum size**: 44px x 44px (iOS recommendation)
- **Slider handles**: 48px x 48px for easy manipulation
- **Tab bar items**: 56px height with labels
- **Card tap areas**: Full card width/height

### Responsive Breakpoints

- **Mobile**: 320px - 767px (primary target)
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+ (secondary)

### Gestures

- **Pull to refresh**: Leaderboard and game history
- **Swipe to navigate**: Between player profiles
- **Tap to expand**: Cards and statistics sections
- **Pinch to zoom**: Rating history charts

### Performance Optimizations

- **Lazy loading**: Images and charts load on demand
- **Debounced updates**: Configuration sliders (300ms delay)
- **Cache-first**: PWA service worker strategy
- **Optimistic updates**: Instant UI feedback during data fetching
- **Image optimization**: Next.js automatic image compression

---

## 🏗️ Information Architecture

### Navigation Hierarchy

```
App Root
├── Home (Leaderboard)
│   ├── Season selector
│   ├── Player cards (expandable)
│   └── Quick stats summary
├── Players
│   ├── Player list
│   ├── Player profiles
│   │   ├── Overview tab
│   │   ├── Games tab
│   │   └── Advanced tab (hidden stats)
│   └── Comparison view
├── Games
│   ├── Recent games feed
│   ├── Game details (expandable)
│   ├── Filters (player, date)
│   └── Season archive
├── Stats
│   ├── Season overview
│   ├── Records & achievements
│   ├── Hidden discoveries
│   │   ├── Seat performance
│   │   ├── Time-based analysis
│   │   └── Weather correlations(?)
│   └── Rating explorer
└── Config (Phase 0.5)
    ├── Parameter playground
```

### Progressive Disclosure Strategy

1. **Level 0 (Glance)**: Core info visible immediately
   - Leaderboard rankings
   - Current ratings
   - Recent changes

2. **Level 1 (Tap)**: Quick expansions
   - Player card expansions
   - Game summaries
   - Stat highlights

3. **Level 2 (Navigate)**: Dedicated views
   - Full player profiles
   - Detailed game history
   - Statistics dashboard

4. **Level 3 (Explore)**: Hidden treasures
   - Advanced rating math
   - Seat performance analysis
   - Historical trends
   - Fun correlations

---

## 🧩 Shadcn/ui Component Mapping

### Core Components

- **Navigation**: `NavigationMenu`, `Tabs`
- **Layout**: `Card`, `Sheet`, `Separator`
- **Data Display**: `Table`, `Badge`, `Progress`
- **Forms**: `Slider`, `Button`, `Input`
- **Feedback**: `Alert`, `Skeleton`, `Toast`
- **Charts**: `Chart` (with Recharts integration)

### Custom Components (Built on Shadcn/ui)

- **ExpandablePlayerCard**: Leaderboard row that expands with animation
- **RatingTrendChart**: Simplified line chart with touch interactions
- **StatExplorerCard**: Reveals deeper stats on tap
- **ConfigurationSlider**: Real-time parameter adjustment
- **ProgressiveDisclosurePanel**: Container for hidden content
- **ContextualTooltip**: Explains numbers on long-press

### Component Architecture

```typescript
// Example: ExpandablePlayerCard component
interface ExpandablePlayerCardProps {
  player: Player;
  rating: number;
  ratingChange: number;
  games: number;
  isExpanded: boolean;
  onToggle: () => void;
}

// Expanded state shows:
interface PlayerCardExpansion {
  winRate: number;
  avgPlacement: number;
  recentPlacements: number[];
  seasonPerformance: number;
  lastPlayed: string;
}
```

---

## 🔄 Phase 1 & 2 Extension Points

### Phase 1 Additions (Live Game Tracking)

- **Game Creation Flow**: New game setup wizard
- **Live Scoring Interface**: Hand-by-hand entry
- **Real-time Updates**: WebSocket integration
- **Score Validation**: Input validation and error handling

### Phase 2 Additions (Scheduling)

- **Calendar View**: Game scheduling interface
- **Availability Grid**: Player availability input
- **Notification Center**: Game reminders and updates
- **RSVP System**: Attendance confirmation

### Future UI Considerations

- **Write Operations**: Form validation, optimistic updates
- **Real-time Collaboration**: Multiple users entering data
- **Advanced Analytics**: More sophisticated charts and insights
- **User Accounts**: Authentication, personalization

---

## 🚀 Implementation Strategy

### Phase 0 Development Order

1. **Core layout** with navigation and routing
2. **Leaderboard view** with real data integration
3. **Player profile** with rating history charts
4. **Game history** with expandable details
5. **Statistics dashboard** with overview metrics
6. **PWA features** and mobile optimizations

### Phase 0.5 Development Order

1. **Configuration UI** with parameter sliders
2. **Live preview** with real-time updates
3. **Comparison view** with delta highlighting
4. **Template system** with saved configurations
5. **Export/sharing** features
6. **Performance optimizations** for instant updates

### Technical Implementation

- **Framework**: Next.js 15 with App Router
- **UI Library**: Shadcn/ui + Tailwind CSS
- **State Management**: React Query + Zustand
- **Charts**: Recharts (integrated with Shadcn/ui)
- **Database**: Supabase with real-time subscriptions
- **PWA**: Service worker, offline support, install prompt

### Testing Strategy

- **Unit Tests**: Component behavior and logic
- **Integration Tests**: API integration and data flow
- **E2E Tests**: User journeys and PWA features
- **Device Testing**: iOS Safari, Android Chrome
- **Performance Testing**: Load times, chart rendering

---

## 📊 Success Metrics

### Phase 0 Goals

- **PWA Installation**: >50% of users install the app
- **Mobile Usage**: >80% of traffic from mobile devices
- **Page Load Time**: <2 seconds on mobile
- **User Engagement**: Average session >5 minutes

### Phase 0.5 Goals

- **Configuration Usage**: >50% of users try configuration playground
- **Cache Performance**: >90% cache hit rate
- **Real-time Updates**: <500ms configuration preview
- **User Experimentation**: >10 custom configurations created

This design specification provides a comprehensive foundation for building a modern, mobile-first PWA that serves both casual users and rating system enthusiasts while maintaining the flexibility to grow into a full-featured mahjong league management system.
