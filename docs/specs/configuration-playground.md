# Configuration Playground (Phase 0.5)

## Overview

The Configuration Playground is an innovative feature that allows users to experiment with different rating system parameters and scoring rules in real-time. It provides an interactive interface where users can adjust OpenSkill parameters, scoring systems, and other configuration options to see how these changes would affect player rankings. This feature leverages a sophisticated hash-based caching system to provide instant feedback while maintaining the integrity of official season ratings.

## User Stories

### As a player, I want to experiment with rating parameters so that I can understand the system

- Adjust initial ratings, confidence levels, and decay rates
- See how different parameters affect my ranking
- Understand why certain games had big rating impacts
- Learn about the OpenSkill algorithm interactively

### As a league commissioner, I want to test rule changes so that I can make informed decisions

- Preview how rule changes would affect current standings
- Compare official rankings with experimental configurations
- Save promising configurations for future consideration
- Share configuration proposals with players for feedback

### As a curious user, I want to discover interesting "what-if" scenarios

- See rankings if we used ELO instead of OpenSkill
- Experiment with extreme parameters for fun
- Find configurations that benefit different play styles
- Share interesting discoveries with other players

## UI/UX Specifications

### Visual Design - Control Panel

```
┌─────────────────────────────────────────┐
│ 🛠️ Configuration Playground             │
│ Experiment with rating parameters       │
├─────────────────────────────────────────┤
│ 📊 Rating Parameters                    │
│                                         │
│ Initial μ     [====●====] 25.0         │
│               15 ────────── 35          │
│                                         │
│ Initial σ     [===●=====] 8.33         │
│               5 ─────────── 15          │
│                                         │
│ Confidence    [====●====] 2.0          │
│               1 ─────────── 4           │
│                                         │
│ Decay Rate    [=●=======] 0.02         │
│               0 ─────────── 0.1         │
├─────────────────────────────────────────┤
│ 💰 Scoring System                       │
│                                         │
│ Oka Bonus     [====●====] 20,000       │
│               10k ──────── 40k          │
│                                         │
│ Uma (1st→4th) [Detailed View ▼]        │
│ 1st Place     [====●====] +10,000      │
│ 2nd Place     [===●=====] +5,000       │
│ 3rd Place     [==●======] -5,000       │
│ 4th Place     [=●=======] -10,000      │
├─────────────────────────────────────────┤
│ ⚖️ Advanced Options                     │
│ [Show Advanced ▼]                       │
├─────────────────────────────────────────┤
│ [Reset to Official] [Save Configuration]│
│ [Preview Changes →]                     │
└─────────────────────────────────────────┘
```

### Visual Design - Live Preview

```
┌─────────────────────────────────────────┐
│ 📊 Live Preview Comparison              │
│ Official vs. Your Configuration         │
├─────────────────────────────────────────┤
│        Official │ Custom  │ Change      │
├─────────────────────────────────────────┤
│ 1. Joseph  46.3 │  48.1  │ ↑1.8 🟢     │
│ 2. Josh    39.2 │  37.9  │ ↓1.3 🔴     │
│ 3. Mikey   36.0 │  36.4  │ ↑0.4 🟢     │
│ 4. Hyun    32.2 │  31.9  │ ↓0.3 🔴     │
│ 5. Koki    31.9 │  32.2  │ ↑0.3 🟢     │
├─────────────────────────────────────────┤
│ 💡 Biggest Impact: Joseph gains 1.8 pts │
│ ⚡ Cache Status: HIT (0.1s)            │
│                                         │
│ [View Detailed Comparison →]            │
└─────────────────────────────────────────┘
```

### Component Hierarchy

- `ConfigPlaygroundView` - Main container
  - `ConfigPanel` - Parameter controls
    - `ParameterSection` - Grouped parameters
      - `SliderControl` - Individual parameter slider
    - `ActionButtons` - Reset, save, preview
  - `PreviewPanel` - Live comparison view
    - `ComparisonTable` - Side-by-side rankings
    - `ImpactSummary` - Key changes highlight
    - `PerformanceMetrics` - Cache status
  - `ConfigTemplates` - Pre-built configurations
  - `SavedConfigs` - User's saved experiments

### Interaction Patterns

1. **Slider Controls**
   - Real-time value updates as sliding
   - Debounced preview updates (300ms)
   - Tap on track to jump to value
   - Number input for precise values

2. **Live Preview**
   - Updates automatically on parameter change
   - Shows loading state during calculation
   - Highlights significant changes
   - Maintains scroll position

3. **Configuration Management**
   - Save custom configurations with names
   - Load saved configs instantly
   - Share configurations via URL
   - Compare multiple configurations

### Advanced Options (Expanded)

```
┌─────────────────────────────────────────┐
│ ⚖️ Advanced Options                     │
│                                         │
│ Margin of Victory Scaling               │
│ Weight Divisor [===●====] 40           │
│ Min Weight     [==●=====] 0.5          │
│ Max Weight     [====●===] 1.5          │
│                                         │
│ Placement Bonuses                       │
│ 1st Bonus     [====●====] 1.2x         │
│ 4th Penalty   [===●=====] 0.8x         │
│                                         │
│ Activity Requirements                   │
│ Min Games     [=●=======] 1            │
│ Decay After   [====●====] 2 weeks      │
└─────────────────────────────────────────┘
```

## Technical Requirements

### Configuration Model

```typescript
interface RatingConfig {
  // OpenSkill parameters
  initialMu: number; // Starting skill estimate
  initialSigma: number; // Starting uncertainty
  beta: number; // Competition factor
  tau: number; // Dynamics factor
  confidenceFactor: number; // Display rating = μ - factor * σ

  // Scoring system
  oka: number; // Return bonus
  uma: [number, number, number, number]; // Placement bonuses

  // Advanced options
  marginDivisor: number; // Score diff weight scaling
  minWeight: number; // Minimum weight factor
  maxWeight: number; // Maximum weight factor

  // Activity settings
  minGames: number; // Minimum games for ranking
  decayRate: number; // Sigma inflation per week
  decayAfterDays: number; // Start decay after X days
}

interface ConfigComparison {
  official: PlayerRanking[];
  experimental: PlayerRanking[];
  differences: Array<{
    playerId: string;
    ratingDiff: number;
    rankDiff: number;
  }>;
  cacheHit: boolean;
  computeTimeMs: number;
}

interface PlayerRanking {
  playerId: string;
  playerName: string;
  rating: number;
  rank: number;
  games: number;
}

interface SavedConfig {
  id: string;
  name: string;
  description?: string;
  config: RatingConfig;
  createdAt: string;
  isTemplate?: boolean;
}
```

### Data Sources

#### For Configuration Preview (Keep Python API)

```typescript
// This remains as an API call to Python for dynamic calculations
const response = await fetch(`${PYTHON_API_URL}/ratings/configuration`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    config_hash: configHash,
    configuration: config,
  }),
});
const comparison = await response.json();
```

**Note:** The Configuration Playground is the only feature that requires the Python API, as it needs to calculate ratings on-demand with user-provided parameters.

#### For Templates and Saved Configs (Supabase)

```typescript
// Get pre-built configuration templates
const { data: templates } = await supabase
  .from("configuration_templates")
  .select(
    `
    id,
    name,
    description,
    config,
    is_official,
    created_at
  `
  )
  .eq("is_active", true)
  .order("sort_order");

// Save user configuration (localStorage for Phase 0)
localStorage.setItem(
  `saved_config_${configId}`,
  JSON.stringify({
    id: configId,
    name: configName,
    description: configDescription,
    config: ratingConfig,
    createdAt: new Date().toISOString(),
  })
);

// Get saved configurations (localStorage for Phase 0)
const savedConfigs = Object.keys(localStorage)
  .filter(key => key.startsWith("saved_config_"))
  .map(key => JSON.parse(localStorage.getItem(key)))
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
```

**Performance Requirements:**

- Python API response: < 500ms (< 100ms if cached)
- Template loading: < 100ms
- Local storage operations: < 10ms

### Caching Strategy

```typescript
interface CacheSystem {
  // Generate deterministic hash from config
  generateConfigHash(config: RatingConfig): string;

  // Check if results exist for hash
  checkCache(hash: string): CachedResults | null;

  // Store computed results
  cacheResults(hash: string, results: PlayerRanking[]): void;

  // Invalidate when source data changes
  invalidateAll(): void;

  // Cache expiry: 24 hours or on source data change
  // Max cache size: 1000 configurations
  // LRU eviction policy
}
```

### Performance Requirements

- **Slider Response**: < 16ms (60fps) for UI updates
- **Preview Calculation**: < 500ms for uncached configs
- **Cache Hit Response**: < 100ms for cached configs
- **Cache Hit Rate**: > 90% for common adjustments
- **Memory Usage**: < 50MB for cache storage

## Success Criteria

- [x] All rating parameters adjustable via sliders
- [x] Sliders show current value and valid range
- [x] Live preview updates within 500ms of change
- [x] Comparison shows official vs experimental rankings
- [x] Rating differences highlighted with colors
- [x] Cache hit indicated with response time
- [x] Configuration can be reset to official
- [x] Configurations can be saved with custom names
- [x] Pre-built templates available for selection
- [x] Advanced options hidden by default
- [x] Share configuration via URL parameters
- [x] Mobile-friendly slider controls
- [x] No impact on official season calculations
- [x] Help tooltips explain each parameter
- [x] Smooth animations for all transitions

## Test Scenarios

1. **Adjust Single Parameter**
   - Given: Default configuration loaded
   - When: User moves initial μ slider
   - Then: Preview updates showing new rankings

2. **Cache Hit Performance**
   - Given: User adjusts parameters
   - When: Returning to previous configuration
   - Then: Results load instantly with cache hit

3. **Save Configuration**
   - Given: User has modified parameters
   - When: User clicks "Save Configuration"
   - Then: Config saved with name prompt

4. **Load Template**
   - Given: Templates section visible
   - When: User selects "High Stakes"
   - Then: Parameters update to template values

5. **Reset to Official**
   - Given: Parameters have been modified
   - When: User clicks "Reset to Official"
   - Then: All parameters return to season defaults

6. **Share Configuration**
   - Given: Custom configuration active
   - When: User clicks share button
   - Then: URL generated with config parameters

7. **Compare Rankings**
   - Given: Preview showing comparisons
   - When: Rankings differ significantly
   - Then: Changes highlighted with arrows/colors

8. **Advanced Options**
   - Given: Advanced section collapsed
   - When: User expands advanced options
   - Then: Additional parameters become available

## Configuration Templates

### Pre-built Templates

1. **Official Season Configuration**
   - Current season's exact parameters
   - Marked as default/official

2. **High Stakes**
   - Lower initial σ (more confidence)
   - Larger uma spread (+15/-15)
   - Higher margin weight impact

3. **Beginner Friendly**
   - Higher initial σ (less confidence)
   - Smaller uma spread (+5/-5)
   - Faster rating recovery

4. **Traditional ELO Style**
   - Very low σ decay
   - No margin of victory
   - Classic zero-sum approach

5. **Experimental Chaos**
   - Extreme parameters for fun
   - Very high volatility
   - Dramatic swings possible

## Mobile Considerations

1. **Touch-Optimized Sliders**
   - Large touch targets (48px height)
   - Visual feedback on touch
   - Prevent accidental adjustments

2. **Responsive Layout**
   - Stack panels vertically on mobile
   - Full-width sliders
   - Collapsible sections

3. **Performance**
   - Debounce slider updates
   - Optimize re-renders
   - Lazy load advanced options

## Educational Elements

### Parameter Explanations

Each parameter includes:

- Short description on hover/tap
- "Learn more" link to detailed docs
- Visual examples of impact
- Suggested ranges for different styles

### Interactive Tutorials

1. **"What is μ and σ?"**
   - Interactive visualization
   - Shows confidence intervals
   - Explains rating calculation

2. **"How Uma Works"**
   - Visual breakdown of scoring
   - Before/after examples
   - Impact on different placements

3. **"Finding Your Ideal Config"**
   - Guided parameter exploration
   - Suggests adjustments based on goals
   - Shows real game examples

## Accessibility Requirements

- **Keyboard Controls**:
  - Arrow keys adjust sliders
  - Tab navigation through controls
  - Enter to apply changes

- **Screen Reader Support**:
  - Announce slider values
  - Describe parameter purposes
  - Read comparison changes

- **Visual Accessibility**:
  - High contrast mode
  - Color-blind friendly indicators
  - Text alternatives for changes

- **Motor Accessibility**:
  - Large touch targets
  - Keyboard alternatives
  - No time-based interactions
