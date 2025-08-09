# Configuration Playground - Product Requirements

## Overview

The Configuration Playground is an interactive feature that replaces the LeaderboardHeader component, allowing users to explore different rating configurations and see how they affect player standings. Users can switch between preset configurations (Season 3, Season 4), create custom configurations, and see the leaderboard recalculated under their chosen parameters.

## Core Design Decisions

### UI/UX Approach

- **Inline Expansion** (Recommended): The configuration UI expands inline below the header, maintaining context while exploring configurations
- **Loading Strategy**: Non-blocking with persistent indicator (recommended based on expected <10s materialization time)
- **Configuration Context**: Display current configuration name on all pages with expandable details
- **Mobile-First**: Simplified form inputs with grouped sections for mobile usability

### Technical Approach

- **Simple Serverless**: Direct API calls to rating engine, no job queues or complex orchestration
- **URL Parameters**: `?config=[hash]` for configuration context (currently no URL handling exists)
- **Immutable Configs**: Configuration hash uses SHA256 of sorted JSON, edits create new configs
- **Public Access**: No authentication/RLS on Supabase tables, using public anon key

## User Stories

### 1. As a league player, I want to view the default Season 3 leaderboard so that I can see current official standings

**Acceptance Criteria:**

- Season 3 configuration is loaded by default on page load
- Shows total games and player count (no refresh button or "updated" text)
- Configuration UI is hidden by default to maintain clean interface
- Expandable interface clearly indicates additional options available
- Page loads with same performance as current implementation (<2 seconds)

### 2. As a curious player, I want to compare different season configurations so that I can understand how rating systems evolved

**Acceptance Criteria:**

- Can expand configuration UI via clear affordance (button/accordion)
- Can select from available presets (Season 3, Season 4)
- Selected preset shows all configuration parameters:
  - Time range (start/end dates, or "All games" if unlimited)
  - Rating parameters (initial μ/σ, confidence factor, decay rate)
  - Scoring system (oka/uma values)
  - Weight parameters (divisor, min/max)
  - Qualification criteria (min games, drop worst)
- Leaderboard updates immediately when switching between cached presets
- Current configuration name is clearly displayed

### 3. As an advanced user, I want to create custom configurations so that I can explore "what-if" scenarios

**Acceptance Criteria:**

- "Create New Config Based on Current" loads current config values as defaults
- Form validation prevents invalid inputs:
  - Dates must be valid (end > start if both provided)
  - Uma values must sum to zero
  - Other numeric values accept any reasonable input
- Creates new configuration (new hash) when saving edits
- Can optionally name configurations for easier identification
- Clear indication when viewing custom vs official configuration

### 4. As a user creating a new configuration, I want the system to calculate ratings so that I can see results under my parameters

**Acceptance Criteria:**

- Apply button triggers rating calculation for new configurations
- Non-blocking loading with persistent indicator:
  - Small progress indicator in header/corner
  - Message: "Calculating ratings..."
  - User can continue browsing with indicator visible
  - Toast notification when complete
- Error handling for calculation failures:
  - Toast notification with error message
  - Retry button in error state
- Automatic data refresh when calculation completes
- If data doesn't exist, show same loading state as new config

### 5. As a user viewing custom configuration results, I want player profiles to match so that all data is consistent

**Acceptance Criteria:**

- Clicking player from custom config leaderboard opens profile with same config
- Player profile optionally includes configuration in URL: `/player/[id]?config=[hash]`
- Player stats (rating chart, metrics) calculated under active configuration
- Configuration name displayed at top of player profile
- Navigation maintains configuration context within session

### 6. As a mobile user, I want the configuration UI to work seamlessly on my device

**Acceptance Criteria:**

- Configuration panel uses collapsible sections for parameter groups
- Form inputs are touch-friendly with appropriate sizing
- Numeric inputs use steppers instead of keyboards where appropriate
- Configuration state persists in browser storage
- Responsive design adapts to screen size

## UI/UX Specifications

### Visual Design

#### Default State (Configuration Hidden)

```
┌─────────────────────────────────────┐
│  Season 3                      [▼]  │  <- Expandable indicator
│  150 games • 24 players             │
└─────────────────────────────────────┘
```

#### Expanded State (Configuration Visible)

```
┌─────────────────────────────────────┐
│  Season 3                      [▲]  │  <- Collapse indicator
│  150 games • 24 players             │
├─────────────────────────────────────┤
│  Configuration                      │
│                                     │
│  Active: [Season 3        ▼]        │
│          Season 3 (Official)        │
│          Season 4 (Official)        │
│          My Custom Config           │
│          ─────────────              │
│          Create New Based on Current│
│                                     │
│  ▶ Time Range                       │
│  ▶ Rating Parameters                │
│  ▶ Scoring System                   │
│  ▶ Qualification Rules              │
│                                     │
│  [Cancel]          [Apply Config]   │
└─────────────────────────────────────┘
```

#### Expanded Section Example (Mobile-Friendly)

```
│  ▼ Time Range                       │
│    Start: [2024-01-01] 📅           │
│    End:   [2024-12-31] 📅           │
│    □ Include all games              │
```

### Configuration Indicator (All Pages)

```
┌─────────────────────────────────────┐
│  Viewing: Season 3           [i]    │  <- Info icon for details
└─────────────────────────────────────┘
```

### Materialization Loading State (Persistent Indicator)

```
┌─────────────────────────────────────┐
│  ⟳ Calculating ratings...     [X]  │  <- Small persistent indicator
└─────────────────────────────────────┘

(User can continue browsing the app with this indicator visible)
```

### User Flow

1. **Initial Load**
   - User sees clean header with Season 3 stats
   - Expand button indicates more options available

2. **Configuration Switch (Cached)**
   - User expands panel → selects different preset
   - Leaderboard updates immediately with cached data
   - URL optionally updates with config parameter

3. **Custom Configuration Creation**
   - User selects "Create New Based on Current"
   - Form populates with current config values
   - User modifies values and optionally names config
   - Clicking "Apply" creates new config with new hash

4. **Materialization Process**
   - Persistent loading indicator appears (non-blocking)
   - User can continue browsing while calculation runs
   - Success → toast notification, data auto-refreshes
   - Error → toast notification with retry option

5. **Cross-Page Navigation**
   - Configuration context maintained via URL parameter or session
   - Each page shows current configuration name
   - Player profiles load with same configuration context

### Component Hierarchy

```
App Layout
├── ConfigurationIndicator (global, all pages)
│   └── ConfigurationTooltip (on hover/click)
│
LeaderboardPage
├── ConfigurableLeaderboardHeader
│   ├── HeaderSummary (games/players count)
│   ├── ExpandToggle
│   └── ConfigurationPanel
│       ├── ConfigurationSelector
│       ├── CollapsibleConfigForm
│       │   ├── TimeRangeSection
│       │   ├── RatingParametersSection
│       │   ├── ScoringSection
│       │   └── QualificationSection
│       └── ActionButtons
├── MaterializationOverlay (when calculating)
└── LeaderboardTable (existing)

PlayerProfilePage
├── ConfigurationIndicator
└── PlayerProfile (configuration-aware)
```

## Technical Requirements

### Data Model

```typescript
// Simplified configuration interfaces
interface ActiveConfiguration {
  hash: string;
  name: string;
  isOfficial: boolean;
  data: RatingConfiguration;
}

interface RatingConfiguration {
  timeRange: {
    startDate: string | null; // null = no limit
    endDate: string | null; // null = no limit
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

// Browser storage for custom configs
interface StoredConfiguration {
  hash: string;
  name: string;
  data: RatingConfiguration;
  createdAt: string;
}
```

### Data Access Architecture

#### Browser/Next.js Direct Database Access

- **Configuration List**: Query `rating_configurations` table via Supabase client
- **Check Data Availability**: Query `cached_player_ratings` table for config_hash
- **Leaderboard Data**: Query cached tables directly from browser/Next.js

#### Python Rating Engine (Single Endpoint)

```
POST /api/materialize
Body: {
  config_hash: string
  configuration: RatingConfiguration  // Full config for new materializations
}
Response: {
  success: boolean
  message?: string
  error?: string
}
```

The Python serverless function is only responsible for:

1. Receiving a rating configuration
2. Running OpenSkill calculations
3. Writing results to Supabase
4. Returning success/failure status

### State Management

```typescript
// Extend existing configStore.ts
interface ConfigStore {
  // Current state
  activeConfig: ActiveConfiguration | null;
  isLoading: boolean;
  error: string | null;

  // Stored configurations (localStorage)
  customConfigs: Record<string, StoredConfiguration>;

  // Actions (using Supabase client directly)
  loadOfficialConfigs: () => Promise<void>; // Query rating_configurations table
  setActiveConfig: (hash: string, config?: RatingConfiguration) => void;
  saveCustomConfig: (name: string, config: RatingConfiguration) => string; // returns hash
  checkDataAvailability: (hash: string) => Promise<boolean>; // Query cached tables
  triggerMaterialization: (
    hash: string,
    config: RatingConfiguration
  ) => Promise<void>; // Call Python API
  updateConfigName: (hash: string, name: string) => void; // LocalStorage only
}
```

### URL Parameter Handling

```typescript
// Optional configuration parameter
interface PageParams {
  config?: string; // Configuration hash (short form acceptable)
}

// Helper functions
function getConfigFromURL(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("config");
}

function updateURLConfig(hash: string | null) {
  const url = new URL(window.location.href);
  if (hash) {
    url.searchParams.set("config", hash);
  } else {
    url.searchParams.delete("config");
  }
  window.history.replaceState({}, "", url);
}
```

### Performance Requirements

- **Page Load**: < 2 seconds (maintain current performance)
- **Configuration Switch** (cached): < 500ms
- **Configuration Panel Animation**: < 200ms
- **Form Validation**: Instant (< 50ms)
- **Materialization**: 5-10 seconds expected (persistent indicator)
- **Error Recovery**: < 1 second to show retry option

### Browser Support

- **Mobile**: iOS Safari 14+, Chrome Android 90+
- **Desktop**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Storage**: LocalStorage for custom configs (up to 10 configs)
- **Animations**: CSS transitions with reduced-motion support

## Success Criteria

- [ ] Default Season 3 configuration loads without user action
- [ ] Configuration UI is hidden by default but easily discoverable
- [ ] Users can switch between official configurations seamlessly
- [ ] Custom configurations can be created by editing existing ones
- [ ] Configuration names can be updated without changing the hash
- [ ] Materialization shows persistent non-blocking indicator
- [ ] Configuration context is maintained across pages
- [ ] Mobile experience uses collapsible sections effectively
- [ ] Error states show toast notifications with retry options
- [ ] Up to 10 custom configurations can be stored locally
- [ ] Optional URL parameters enable configuration sharing

## Test Scenarios

### 1. Default Configuration Loading

**Given**: User navigates to leaderboard page  
**When**: Page loads without config parameter  
**Then**: Season 3 configuration is active, stats show, config UI is hidden

### 2. Official Configuration Switch

**Given**: User has expanded configuration panel  
**When**: User selects Season 4 from dropdown  
**Then**: Leaderboard updates immediately with cached Season 4 data

### 3. Custom Configuration Creation

**Given**: User selects "Create New Based on Current"  
**When**: User modifies uma values and names it "High Stakes"  
**Then**: New configuration is created with new hash, original unchanged

### 4. Materialization Flow

**Given**: User applies a new custom configuration  
**When**: No data exists for this configuration  
**Then**: Persistent indicator shows, user can browse, data appears after ~10 seconds

### 5. Error Recovery

**Given**: Materialization fails due to server error  
**When**: Error toast appears  
**Then**: User can retry materialization or select different config

### 6. Cross-Page Navigation

**Given**: User viewing custom config leaderboard  
**When**: User clicks player profile  
**Then**: Profile page shows same configuration context

### 7. Configuration Storage

**Given**: User creates custom configuration  
**When**: User returns to app later  
**Then**: Custom configuration appears in dropdown list

### 8. Mobile Collapsible Sections

**Given**: User on mobile expands configuration panel  
**When**: User taps "Rating Parameters" section  
**Then**: Section expands smoothly, others remain collapsed

## Security Considerations

- Validate configuration parameters server-side (basic range checks)
- Configuration hashes are deterministic based on content
- No authentication required - all configurations are public
- Limit localStorage to 10 configurations per browser
- Simple rate limiting on materialization endpoint

## Accessibility Requirements

- Keyboard navigation for all interactive elements
- Screen reader announcements for configuration changes
- Loading states announced to screen readers
- Focus management when expanding/collapsing sections
- Sufficient color contrast (WCAG 2.1 AA)
- Reduced motion support for animations

## Implementation Notes

### Current State

- **Config Hardcoded**: Season 3 config hash is hardcoded in `/src/config/index.ts`
- **No URL Handling**: App doesn't currently use URL parameters for configuration
- **configStore Unused**: Zustand store exists but not integrated yet
- **Direct Queries**: All queries use hardcoded config hash from config file

### Configuration Hash Generation

- Uses SHA256 hash of JSON with sorted keys (already implemented in Python)
- Short hash acceptable for URLs (first 8-12 characters)
- Full hash used for database operations

### Materialization Approach

1. Query Supabase directly to check if data exists for configuration hash
2. If not, call Python rating engine API with full configuration
3. Show persistent loading indicator (non-blocking)
4. Poll Supabase for data availability (exponential backoff: 2s, 4s, 8s...)
5. Refresh UI when data appears in cached tables

### Error Handling Philosophy

- Simple toast notifications for errors
- No complex error recovery flows
- Users can always fall back to official configs
- Deleted configs show basic error message

## Future Enhancements (Out of Scope)

- Real-time progress tracking during materialization
- Configuration sharing via shareable URLs (nice-to-have)
- Configuration templates or presets by game type
- Bulk comparison of multiple configurations
- Configuration version history
- Authentication and private configurations
- Export configuration results

---

This specification provides a streamlined approach to implementing the Configuration Playground feature, focusing on simplicity and user value while avoiding unnecessary complexity for a small-scale application.

### Key Implementation Considerations

- The app currently hardcodes Season 3 config and doesn't use URL parameters
- Supabase tables are publicly accessible with anon key
- Expected materialization time is <10 seconds, supporting non-blocking UI
- LeaderboardHeader replacement is straightforward with minimal dependencies
- Player profile queries will need modification to accept config parameter
