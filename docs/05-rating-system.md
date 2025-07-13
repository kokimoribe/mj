# Rating System Specification

_Configuration-driven OpenSkill-based ranking algorithm for Riichi Mahjong League_

## Overview

Our rating system uses **OpenSkill** (a modern Bayesian ranking algorithm) with **margin-of-victory weights** and a **configuration-driven architecture** that allows users to experiment with different rule sets in real-time while maintaining official season rankings.

### Core Principles

1. **Hype-driven**: Big wins matter more than narrow victories
2. **Upset-sensitive**: Lower-rated players beating higher-rated players create larger rating swings
3. **Accessible**: Occasional players can still compete meaningfully
4. **Anti-camping**: Idle players face gentle rating decay
5. **No rating pits**: Frequent fourth-placers won't get trapped in low ratings
6. **⭐ Experimental**: Users can test different rule sets without affecting official ratings

### Configuration-Driven Innovation (Phase 0.5)

Unlike traditional rating systems with fixed parameters, our system allows:

- **Real-time experimentation** with rating parameters
- **"What-if" scenarios** to see how rule changes affect rankings
- **User engagement** through interactive configuration playground
- **Smart caching** for instant configuration switching
- **Official season protection** - experiments don't affect competitive rankings

---

## Configuration System Architecture

### Configuration Structure

```typescript
interface RatingConfiguration {
  // Time bounds (replaces traditional "season" concept)
  timeRange: {
    startDate: string; // "2024-01-01"
    endDate: string; // "2024-03-31"
    name: string; // "Winter 2024"
  };

  // Rating system parameters
  rating: {
    initialMu: number; // 25.0 - Starting skill estimate
    initialSigma: number; // 8.33 - Starting uncertainty
    confidenceFactor: number; // 2.0 - Display rating conservatism (μ - k*σ)
    decayRate: number; // 0.02 - Weekly sigma inflation for inactive players
  };

  // Scoring system (oka/uma)
  scoring: {
    oka: number; // 20000 - Return bonus
    uma: [number, number, number, number]; // [10000, 5000, -5000, -10000]
  };

  // Margin-of-victory weights
  weights: {
    divisor: number; // 40 - Plus-minus scaling factor
    min: number; // 0.5 - Minimum weight multiplier
    max: number; // 1.5 - Maximum weight multiplier
  };

  // Qualification rules
  qualification: {
    minGames: number; // 8 - Games needed for prizes
    dropWorst: number; // 2 - Safety net for bad games
  };
}
```

### Smart Caching System

```python
def get_ratings_for_config(config: RatingConfiguration) -> Dict[str, PlayerRating]:
    """
    Main entry point for configuration-driven rating calculation.
    Uses smart caching to provide instant results for known configurations.
    """

    # 1. Generate deterministic hash for configuration
    config_hash = generate_config_hash(config)

    # 2. Get source games for time range
    games = get_games_in_range(config.timeRange.startDate, config.timeRange.endDate)
    source_data_hash = generate_source_data_hash(games)

    # 3. Check for cache hit
    cached_ratings = get_cached_ratings(config_hash, source_data_hash)
    if cached_ratings:
        update_last_used(config_hash)
        return cached_ratings  # Instant response!

    # 4. Cache miss - compute new ratings
    new_ratings = compute_ratings_with_config(games, config)

    # 5. Store in cache for future requests
    store_cached_ratings(config_hash, new_ratings, source_data_hash, config.timeRange)

    return new_ratings

def generate_config_hash(config: RatingConfiguration) -> str:
    """Generate SHA-256 hash of configuration for cache key."""
    config_str = json.dumps(config, sort_keys=True)
    return hashlib.sha256(config_str.encode()).hexdigest()

def generate_source_data_hash(games: List[Game]) -> str:
    """Generate hash of source game data for cache invalidation."""
    game_data = [(g.id, g.finished_at, g.final_scores) for g in games]
    data_str = json.dumps(game_data, sort_keys=True, default=str)
    return hashlib.sha256(data_str.encode()).hexdigest()
```

---

## Game Data Processing

### Input: Raw Game Results

For each completed hanchan, we record season-agnostic data:

```
Date & Time: 2025-11-08 19:46
East:  Erin  — 48,100 points
South: Alice — 32,400 points
West:  Frank — 30,100 points
North: Bob   — 20,700 points
```

### Output: Plus-Minus Scores

We convert raw points to **plus-minus (±)** using oka/uma:

```python
def calculate_plus_minus(raw_scores: List[int], oka: int = 20000, uma: List[int] = [10000, 5000, -5000, -10000]) -> List[int]:
    """
    Convert raw mahjong scores to plus-minus format.

    Args:
        raw_scores: List of 4 raw scores (should sum to ~100,000)
        oka: Return bonus (default 20,000)
        uma: Placement bonuses [1st, 2nd, 3rd, 4th]

    Returns:
        List of plus-minus scores (guaranteed to sum to 0)
    """
    # Sort players by raw score (descending)
    sorted_players = sorted(enumerate(raw_scores), key=lambda x: x[1], reverse=True)

    plus_minus = [0] * 4
    for rank, (player_idx, raw_score) in enumerate(sorted_players):
        plus_minus[player_idx] = (raw_score - 25000) + uma[rank]

    return plus_minus
```

### Why Plus-Minus?

- **Zero-sum**: Scores always sum to 0, making season totals intuitive
- **Placement embedded**: Ranking bonuses already included in the score
- **Community standard**: Matches pro league and online platform formats
- **Clean math**: Eliminates quirks from dealer repeats and riichi sticks

---

## Rating Algorithm Components

### Core Parameters

| Symbol        | Meaning           | Default      | Notes                                |
| ------------- | ----------------- | ------------ | ------------------------------------ |
| **μ** (mu)    | Skill estimate    | 25.0         | Player's true rating                 |
| **σ** (sigma) | Uncertainty       | 8.33         | How confident we are                 |
| **R**         | Display rating    | μ - 2σ       | Conservative estimate shown to users |
| **±**         | Plus-minus score  | —            | Zero-sum game result                 |
| **W**         | Weight multiplier | 1 + (± ÷ 40) | Margin-of-victory scaling            |

### Weight Calculation

```python
def calculate_weight(plus_minus: int, divisor: int = 40, min_weight: float = 0.5, max_weight: float = 1.5) -> float:
    """
    Calculate margin-of-victory weight for OpenSkill.

    Big wins/losses get higher weights, creating larger rating swings.
    """
    weight = 1.0 + (plus_minus / divisor)
    return max(min_weight, min(max_weight, weight))

# Examples:
# +60 points → weight = 1 + (60/40) = 2.5 → clamped to 1.5
# +20 points → weight = 1 + (20/40) = 1.5
#   0 points → weight = 1 + (0/40)  = 1.0
# -40 points → weight = 1 + (-40/40) = 0.0 → clamped to 0.5
```

---

## OpenSkill Integration

### Game Update Process

```python
def update_ratings_after_game_with_config(
    game_id: str,
    plus_minus_scores: List[int],
    config: RatingConfiguration
) -> List[Player]:
    """
    Update player ratings after a completed game using specific configuration.
    This invalidates cache entries that include this game.
    """

    # Get players for this game
    players = get_game_players(game_id)

    # Sort by performance (best to worst)
    game_results = sorted(
        zip(players, plus_minus_scores),
        key=lambda x: x[1],
        reverse=True
    )

    # Calculate weights using configuration
    weights = [
        calculate_weight_with_config(score, config.weights)
        for _, score in game_results
    ]

    # Convert to OpenSkill format
    teams = [
        [openskill.Rating(mu=player.mu, sigma=player.sigma)]
        for player, _ in game_results
    ]

    # Update ratings using OpenSkill
    new_ratings = openskill.rate(teams, weights=weights)

    # Apply results using configuration
    updated_players = []
    for i, (player, _) in enumerate(game_results):
        new_rating = new_ratings[i][0]
        player.mu = new_rating.mu
        player.sigma = new_rating.sigma
        player.display_rating = new_rating.mu - (config.rating.confidenceFactor * new_rating.sigma)
        updated_players.append(player)

    # Invalidate cache entries that include this game
    invalidate_cache_for_game(game_id)

    return updated_players

def calculate_weight_with_config(plus_minus: int, weight_config: dict) -> float:
    """Calculate margin-of-victory weight using configuration parameters."""
    weight = 1.0 + (plus_minus / weight_config['divisor'])
    return max(weight_config['min'], min(weight_config['max'], weight]))
```

### Rating Display

```python
def calculate_display_rating(mu: float, sigma: float, confidence_factor: float = 2.0) -> float:
    """
    Calculate conservative rating for leaderboard display.

    R = μ - k*σ where k is confidence factor
    - k=2: Moderately conservative (default)
    - k=3: Very conservative (traditional)
    - k=1: Less conservative
    """
    return mu - (confidence_factor * sigma)
```

---

## Season Management & User Experience

### Official Season Management

```python
@dataclass
class OfficialSeasonConfig:
    """Configuration for official competitive seasons."""
    config: RatingConfiguration
    is_locked: bool = False      # Prevent mid-season parameter changes
    created_by: str             # Admin who created the season
    announcement: str           # Season announcement text

def create_official_season(config: RatingConfiguration, admin_id: str) -> str:
    """Create new official season configuration."""
    config_hash = generate_config_hash(config)

    # Store as official configuration
    store_rating_configuration(
        config_hash=config_hash,
        config_data=config,
        name=config.timeRange.name,
        is_official=True,
        created_by=admin_id
    )

    return config_hash

def get_current_official_season() -> RatingConfiguration:
    """Get the current official season configuration."""
    return load_configuration_by_query(is_official=True, is_active=True)
```

### User Experimentation Flow

```typescript
// Frontend: Configuration Playground Component
interface ConfigPlaygroundProps {
  officialConfig: RatingConfiguration;
}

function ConfigurationPlayground({ officialConfig }: ConfigPlaygroundProps) {
  const [experimentalConfig, setExperimentalConfig] = useState(officialConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [experimentalRatings, setExperimentalRatings] = useState(null);

  const handleConfigChange = async (newConfig: RatingConfiguration) => {
    setExperimentalConfig(newConfig);
    setIsLoading(true);

    try {
      // Check cache first - might be instant!
      const ratings = await fetchRatingsForConfig(newConfig);
      setExperimentalRatings(ratings);
    } catch (error) {
      console.error('Failed to load experimental ratings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="config-playground">
      <ConfigSliders
        config={experimentalConfig}
        onChange={handleConfigChange}
      />
      <ComparisonView
        official={officialRatings}
        experimental={experimentalRatings}
        loading={isLoading}
      />
    </div>
  );
}
```

### Cache Performance & Monitoring

```python
@dataclass
class CacheMetrics:
    """Metrics for monitoring cache performance."""
    total_requests: int
    cache_hits: int
    cache_misses: int
    avg_computation_time_ms: float
    popular_configs: List[str]  # Most frequently used config hashes

def get_cache_performance() -> CacheMetrics:
    """Get current cache performance metrics."""
    return query_cache_metrics_from_db()

def warm_popular_configurations():
    """Pre-compute ratings for frequently used configurations."""
    popular_configs = get_popular_configurations(limit=10)
    for config in popular_configs:
        if not is_cache_valid(config):
            # Background computation
            compute_ratings_async(config)
```

### Configuration Validation

```python
def validate_configuration(config: RatingConfiguration) -> List[str]:
    """Validate configuration parameters and return any errors."""
    errors = []

    # Time range validation
    if config.timeRange.startDate >= config.timeRange.endDate:
        errors.append("Start date must be before end date")

    # Rating parameter validation
    if config.rating.initialMu <= 0:
        errors.append("Initial mu must be positive")
    if config.rating.initialSigma <= 0:
        errors.append("Initial sigma must be positive")
    if config.rating.confidenceFactor <= 0:
        errors.append("Confidence factor must be positive")

    # Weight validation
    if config.weights.min >= config.weights.max:
        errors.append("Min weight must be less than max weight")
    if config.weights.divisor <= 0:
        errors.append("Weight divisor must be positive")

    # Scoring validation
    if config.scoring.oka <= 0:
        errors.append("Oka must be positive")
    if len(config.scoring.uma) != 4:
        errors.append("Uma must have exactly 4 values")
    if sum(config.scoring.uma) != 0:
        errors.append("Uma values must sum to zero")

    return errors
```

---

## Statistics & Achievements

### Performance Metrics

The Python rating engine calculates comprehensive statistics:

```python
@dataclass
class PlayerStats:
    # Basic metrics
    games_played: int
    total_plus_minus: int
    average_plus_minus: float

    # Win rates
    tsumo_rate: float           # % of hands won by self-draw
    ron_rate: float             # % of hands won on discard
    riichi_rate: float          # % of hands with riichi declared
    deal_in_rate: float         # % of hands where dealt in

    # Streaks
    longest_first_streak: int
    longest_fourth_free_streak: int
    current_streak: str         # e.g., "3 games without 4th"

    # Records
    best_game_plus: int         # Highest single-game plus-minus
    worst_game_minus: int       # Lowest single-game plus-minus

    # Activity
    last_game_date: datetime
    activity_status: str        # 'active', 'idle', 'inactive'
```

### Side Trophies

- **Big Money**: Highest single-game plus-minus
- **Consistency King**: Lowest standard deviation in placement
- **Endurance**: Most games played in season
- **Hot Streak**: Longest streak without 4th place
- **Comeback Kid**: Biggest rating recovery from season low

---

## Mathematical Properties & Benefits

### Key Guarantees

1. **Zero-sum**: All plus-minus scores sum to exactly 0
2. **Monotonic**: Higher raw scores always yield higher plus-minus scores
3. **Bounded weights**: Weights are clamped to prevent extreme swings
4. **Conservative display**: Display ratings are always ≤ skill estimates
5. **Uncertainty growth**: Inactive players become more volatile over time
6. **⭐ Configuration independence**: Official ratings unaffected by user experiments
7. **⭐ Cache consistency**: Same configuration always produces identical results

### Configuration System Benefits

#### For Players

- **"What-if" exploration**: See how different rules would affect their ranking
- **Educational value**: Understand how rating systems work
- **Engagement**: Interactive features beyond passive leaderboard viewing
- **Fair play assurance**: Experiments don't affect competitive standings

#### For Administrators

- **Rule testing**: Safely experiment with parameter changes before implementation
- **Community input**: Players can propose and test alternative rule sets
- **Easy transitions**: Smooth migration between different rule sets
- **Performance**: Instant switching between configurations via caching

#### For Development

- **No migrations**: Rule changes don't require database schema updates
- **A/B testing**: Easy comparison of different approaches
- **Rollback capability**: Instantly revert to previous configurations
- **Scalability**: System handles unlimited configuration variations

### Tuning Parameters

| Parameter           | Effect                 | Increase →               | Decrease →                |
| ------------------- | ---------------------- | ------------------------ | ------------------------- |
| `weight_divisor`    | MOV sensitivity        | Less weight variation    | More weight variation     |
| `confidence_factor` | Display conservatism   | Lower display ratings    | Higher display ratings    |
| `decay_rate`        | Inactivity penalty     | Faster rating decay      | Slower rating decay       |
| `min_games_qualify` | Competition barrier    | Fewer qualified players  | More qualified players    |
| `oka`               | Return bonus impact    | Larger placement effects | Smaller placement effects |
| `uma` spread        | Placement differential | More rank-sensitive      | Less rank-sensitive       |

---

## Implementation Notes

### Python Function Responsibilities

The rating engine handles:

1. **Configuration Processing**: Parse and validate rating configurations
2. **Smart Caching**: Hash-based cache management with automatic invalidation
3. **Plus-minus conversion** from raw scores using config parameters
4. **Weight calculation** based on margin of victory per configuration
5. **OpenSkill rating updates** after each game
6. **Statistics computation** for all performance metrics
7. **Decay processing** for inactive players per configuration
8. **Data validation** and consistency checks

### Database Integration

- **Source tables**: Store raw game data (season-agnostic)
- **Configuration table**: Hash-based configuration storage with metadata
- **Derived tables**: Cache computed ratings and statistics per configuration
- **Smart invalidation**: Automatic cache cleanup when source data changes
- **Real-time updates**: Instant configuration switching via cached results

### Configuration Management Best Practices

```python
# Configuration versioning
def create_configuration_version(
    base_config: RatingConfiguration,
    changes: Dict[str, Any],
    description: str
) -> str:
    """Create new configuration version with tracked changes."""

# Configuration templates
COMMON_CONFIGURATIONS = {
    "conservative": {"rating": {"confidenceFactor": 3.0}},
    "aggressive": {"weights": {"min": 0.3, "max": 2.0}},
    "high_stakes": {"scoring": {"oka": 30000, "uma": [15000, 5000, -5000, -15000]}},
    "beginner_friendly": {"qualification": {"minGames": 4, "dropWorst": 3}}
}

# Performance monitoring
def log_configuration_usage(config_hash: str, computation_time_ms: float):
    """Track configuration usage for optimization."""
```

### Testing Strategy

```python
# Unit tests for configuration system
def test_configuration_hashing():
    """Verify identical configs produce identical hashes."""
    pass

def test_cache_invalidation():
    """Verify cache invalidates when source data changes."""
    pass

def test_configuration_validation():
    """Test all validation rules for configurations."""
    pass

# Integration tests
def test_rating_consistency():
    """Verify same configuration always produces same ratings."""
    pass

def test_performance_targets():
    """Ensure cache hit rate >90% for common configurations."""
    pass
```

This configuration-driven rating system creates an engaging, mathematically sound, and highly flexible competition platform that goes far beyond traditional static leaderboards. The caching system ensures excellent performance while the configuration playground provides unprecedented user engagement and administrative flexibility.
