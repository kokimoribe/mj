# UI Design Specification - Phase 0 & 0.5

_Comprehensive UI/UX design document for the Riichi Mahjong League PWA_

## 📱 Design Overview

### Core Design Philosophy

- **Mobile-First**: iOS Safari optimized, PWA installable
- **Data Dashboard**: Clean, analytical interface like Streamlit
- **Configuration-Driven**: Real-time "what-if" experimentation
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
│ 📊 24 games • 7 players • Updated 2h ago│
├─────────────────────────────────────────┤
│ 🥇 1. Joseph  🟢  46.26    20 games +2.1│
│ 🥈 2. Josh    🟡  39.18    16 games -0.8│
│ 🥉 3. Mikey   🟢  35.95    23 games +0.4│
│    4. Hyun    🟡  32.22    14 games -1.2│
│    5. Koki    🟢  31.89    20 games +0.6│
│    6. Alice   🔴  15.77     2 games +4.2│
│    7. Frank   🔴   9.11     1 game  +9.1│
├─────────────────────────────────────────┤
│ 💡 Tap players for detailed rating info │
│ 📊 Ratings: Conservative estimate (μ-2σ) │
└─────────────────────────────────────────┘
```

**Features:**

- **Ranking badges**: 🥇🥈🥉 for top 3, numbers for others
- **Activity indicators**: 
  - 🟢 Active (last game <10 days)
  - 🟡 Idle (10-28 days since last game)  
  - 🔴 Inactive (>28 days since last game)
- **Display rating**: Conservative estimate (μ - 2σ) for leaderboard sorting
- **Rating deltas**: Change from previous calculation
- **Tap for detailed rating**: Shows μ, σ, confidence intervals for curious users
- **Rating system tooltip**: Explains OpenSkill algorithm and display calculation
- **Pull to refresh**: Update data with pull gesture

### 3. Player Profile View

```
┌─────────────────────────────────────────┐
│ ← Joseph                            •••  │
│ 🏆 #1 • 46.26 display • 20 games  🟢    │
│ 💡 μ: 50.59 • σ: 2.17 • Confidence: 95% │
├─────────────────────────────────────────┤
│ 📈 Rating History                       │
│     /\  /\                              │
│    /  \/  \      Current: 46.26        │
│   /        \__   Peak: 48.50           │
│  /            \  Low: 42.13            │
├─────────────────────────────────────────┤
│ 📊 Performance Stats                    │
│ • Total Plus/Minus: +179,300           │
│ • Average per game: +8,965             │
│ • Best game: +45,200 (Jul 6)          │
│ • Worst game: -15,800 (Jun 22)        │
├─────────────────────────────────────────┤
│ 🎮 Recent Games (Last 3)               │
│ Jul 6  • 1st place • +32,700 • 🆙 0.8  │
│ Jul 3  • 2nd place • +15,200 • 🆙 0.3  │
│ Jun 29 • 3rd place • -5,100  • 🔻 0.2  │
│ [View All Games →]                      │
└─────────────────────────────────────────┘
```

**Features:**

- **Detailed rating info**: Display rating, μ (skill), σ (uncertainty), confidence
- **Activity status indicator**: Color-coded based on last game (10/28 day thresholds)
- **Interactive rating chart**: Zoomable timeline with markers
- **Performance highlights**: Best/worst games, streaks
- **Recent games (3 default)**: Chronological list with rating deltas
- **Full game history**: "View All Games" link for complete history
- **Statistics carousel**: Swipe through different stat categories

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
│ 🎯 Overview                             │
│ • Total games: 24                       │
│ • Total players: 7                      │
│ • Most active: Mikey (23 games)        │
│ • Biggest win: +45,200 (Josh)          │
├─────────────────────────────────────────┤
│ 🪑 Seat Performance                     │
│ East:  1.8 avg placement 🟢             │
│ South: 2.2 avg placement 🟡             │
│ West:  2.6 avg placement 🟠             │
│ North: 3.4 avg placement 🔴             │
├─────────────────────────────────────────┤
│ 🏆 Mini Leaderboards                    │
│ Most 1st places: Joseph (8)             │
│ Most consistent: Alice (σ: 6.2)         │
│ Biggest comeback: Koki (+67k recovery)  │
└─────────────────────────────────────────┘
```

**Features:**

- **Overview cards**: Key metrics at a glance
- **Visual indicators**: Color coding for performance
- **Mini leaderboards**: Fun trivia stats
- **Expandable sections**: Tap for detailed breakdowns

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
│ [Reset to Season 3] [Save Custom]       │
│ [Preview Changes →]                     │
└─────────────────────────────────────────┘
```

**Features:**

- **Real-time sliders**: Immediate value updates
- **Parameter grouping**: Logical sections for related settings
- **Visual feedback**: Color-coded sliders for different ranges
- **Quick actions**: Reset, save, preview buttons

### 7. Live Preview Comparison

```
┌─────────────────────────────────────────┐
│ 📊 Live Preview                         │
│ Official Season 3 ↔ Your Configuration  │
├─────────────────────────────────────────┤
│      Official  │  Custom    │  Δ       │
│ 🥇 1. Joseph    46.26  │  48.12  │ +1.86  │
│ 🥈 2. Josh      39.18  │  37.95  │ -1.23  │
│ 🥉 3. Mikey     35.95  │  36.44  │ +0.49  │
│    4. Hyun      32.22  │  31.88  │ -0.34  │
│    5. Koki      31.89  │  32.15  │ +0.26  │
├─────────────────────────────────────────┤
│ 💡 Biggest change: Josh drops 1.23 pts  │
│ 🔄 Cache hit: 0.2s (instant)           │
│ [Export Config] [Share Results]         │
└─────────────────────────────────────────┘
```

**Features:**

- **Side-by-side comparison**: Official vs. experimental
- **Delta highlighting**: Color-coded changes (green up, red down)
- **Performance metrics**: Cache hit times, computation speed
- **Export options**: Share configurations and results

### 8. Configuration Templates

```
┌─────────────────────────────────────────┐
│ 📋 Configuration Templates               │
├─────────────────────────────────────────┤
│ 🏆 Official Season 3 (Current)          │
│ Conservative settings, moderate volatility│
│ [Apply] [View Details]                   │
├─────────────────────────────────────────┤
│ 🎲 High Stakes                          │
│ Increased volatility, bigger swings      │
│ [Apply] [View Details]                   │
├─────────────────────────────────────────┤
│ 🎯 Beginner Friendly                    │
│ Lower barriers, more forgiving           │
│ [Apply] [View Details]                   │
├─────────────────────────────────────────┤
│ 🧪 Your Saved Configs                   │
│ My Conservative (saved 2 days ago)      │
│ Ultra Volatile (saved 1 week ago)       │
│ [Load] [Delete]                         │
└─────────────────────────────────────────┘
```

**Features:**

- **Template library**: Pre-built configurations for common scenarios
- **User saved configs**: Personal experimentation history
- **Configuration descriptions**: Clear explanations of each template
- **One-click apply**: Instant configuration switching

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

## 🧩 Shadcn/ui Component Mapping

### Core Components

- **Navigation**: `NavigationMenu`, `Tabs`
- **Layout**: `Card`, `Sheet`, `Separator`
- **Data Display**: `Table`, `Badge`, `Progress`
- **Forms**: `Slider`, `Button`, `Input`
- **Feedback**: `Alert`, `Skeleton`, `Toast`
- **Charts**: `Chart` (with Recharts integration)

### Custom Components (Built on Shadcn/ui)

- **RatingCard**: Player rating display with activity indicator
- **GameHistoryItem**: Game result with expandable details
- **ConfigurationSlider**: Real-time parameter adjustment
- **ComparisonTable**: Side-by-side rating comparison
- **StatisticsGrid**: Dashboard metrics layout

### Component Architecture

```typescript
// Example: RatingCard component
interface RatingCardProps {
  player: Player;
  rank: number;
  rating: number;
  games: number;
  plusMinus: number;
  isQualified: boolean;
  activityStatus: "active" | "idle" | "inactive";
  onTap: () => void;
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
