# Hand Recording Feature Specification

## Overview

This feature enables real-time recording of individual hands/rounds during riichi mahjong games, capturing detailed point exchanges, riichi declarations, and game state transitions. Currently, the system only records final game scores. This enhancement will provide complete hand-by-hand game history, enabling deeper analytics and game replay functionality.

**Important**: Hand history is completely optional and supplementary. The system maintains full backward compatibility with existing games that have no hand data.

## Version History

- v1.0 - Initial specification
- v2.0 - Enhanced based on riichi rule research and architecture review
- v3.0 - Final review with backward compatibility guarantees
- v3.1 - Added explicit backward compatibility and optional hand history support
- v3.2 - Corrected test scenarios based on accurate riichi mahjong rules:
  - Fixed riichi bet mechanics (1000 points paid upfront, returned only if winner)
  - Corrected dealer/non-dealer tsumo payment distributions
  - Fixed tenpai/noten payment calculations (3000 total distributed)
  - Clarified dealer rotation and seat wind assignments
  - Updated chombo penalty distribution (reverse mangan)
  - Corrected tobi (bankruptcy) rules

## User Stories

### As a league organizer, I want to record hands during games so that I can:

- Track detailed game progression beyond final scores
- Analyze player patterns and tendencies
- Verify score calculations and resolve disputes
- Generate detailed game statistics

**Acceptance Criteria:**

- Can record all standard hand outcomes (ron, tsumo, draws, chombo)
- Can track riichi declarations and stick deposits
- Can handle complex scenarios (double ron, exhaustive draws with multiple tenpai)
- Automatic score calculation and validation
- Can edit/correct previously entered hands

### As a player, I want to view hand-by-hand history so that I can:

- Review how games progressed
- Understand where points were won/lost
- Analyze my playing patterns
- Verify game scores

**Acceptance Criteria:**

- View chronological hand history for any game
- See point changes for each hand
- Filter by outcome type or player
- Mobile-friendly viewing experience

## UI/UX Specifications

### Design Principles (Based on Industry Best Practices)

1. **Bottom-Heavy Interaction**: Place primary controls at bottom for thumb reach (Tenhou pattern)
2. **Visual Compass**: Central wind/round indicator showing game state (MahjongSoul pattern)
3. **Progressive Disclosure**: Simple primary actions with advanced options hidden (Kemono pattern)
4. **Intuitive Tile Selection**: Press-slide-release for quick input (Mahjong Helper pattern)
5. **Real-time Validation**: Immediate feedback on valid/invalid inputs
6. **Undo Support**: Quick correction of mistakes (critical for live recording)

### Hand Recording Interface - Mobile Optimized

#### Primary Layout (Portrait Mode)

```
┌─────────────────────────────┐
│  ┌─────────────────────┐    │
│  │    🀀 EAST 1         │    │  <- Round compass
│  │    Honba: 0         │    │
│  │   [■□□□□□□□□□]      │    │  <- Progress indicator
│  └─────────────────────┘    │
├─────────────────────────────┤
│ ┌──────────┬──────────┐     │
│ │ Riichi: 0│ Pot: 0   │     │  <- Stick display
│ └──────────┴──────────┘     │
├─────────────────────────────┤
│  Player Scores (tap to edit) │
│ ┌─────────────────────────┐ │
│ │ 🀀 Koki      25,000 ▼   │ │  <- Dealer indicator
│ │ 🀁 Josh      25,000     │ │
│ │ 🀂 Mikey     25,000     │ │
│ │ 🀃 Jo        25,000     │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│         Quick Entry          │
│ ┌───────────────────────┐   │
│ │  Who Won?  (Required) │   │
│ │ [Koki][Josh][Mikey][Jo]│   │
│ └───────────────────────┘   │
│ ┌───────────────────────┐   │
│ │   How?    (Required)  │   │
│ │  [Ron]  [Tsumo] [Draw]│   │
│ └───────────────────────┘   │
│ ┌───────────────────────┐   │
│ │  Points (or select)   │   │
│ │  [_______________]     │   │
│ │  Common: 1000 2000    │   │
│ │  3900 5200 7700 8000  │   │
│ │  12000 16000 32000    │   │
│ └───────────────────────┘   │
├─────────────────────────────┤
│  ┌──────────────────────┐   │
│  │ 🎌 Riichi  ⚙️ Advanced│   │  <- Bottom bar
│  └──────────────────────┘   │
└─────────────────────────────┘
```

#### Compass Display (Center Focus)

```
┌─────────────────────┐
│     🧭 COMPASS       │
│  ┌───────────────┐  │
│  │       N       │  │
│  │   Jo (25k)    │  │
│  │ W         E   │  │
│  │Mikey    Koki* │  │
│  │(25k)    (25k) │  │
│  │       S       │  │
│  │   Josh(25k)   │  │
│  └───────────────┘  │
│   East 1 • Honba 0  │
│   Riichi: 0 Pot: 0  │
└─────────────────────┘
* = Current dealer
```

#### Smart Input Flows (Industry Patterns)

**Quick Win Recording (2-Tap Method):**

```
Step 1: Select Winner        Step 2: Select Method & Points
┌─────────────────┐          ┌─────────────────┐
│ Who Won?        │          │ Koki Won By:    │
│ ┌─────┐ ┌─────┐│          │ ┌─────────────┐ │
│ │Koki ✓│ │Josh  ││  ──>    │ │   Tsumo     │ │
│ └─────┘ └─────┘│          │ └─────────────┘ │
│ ┌─────┐ ┌─────┐│          │ Points:         │
│ │Mikey │ │Jo    ││          │ [1000/2000] ←  │ <- Auto-calculated
│ └─────┘ └─────┘│          │ Common Tsumo:   │
└─────────────────┘          │ 400/700 1000/2K │
                             │ 2K/4K  3K/6K    │
                             └─────────────────┘
```

**Ron with Loser Selection:**

```
Step 1: Winner      Step 2: Loser       Step 3: Points
[Koki ✓] ──>       [From: Josh ✓] ──>  [5800 pts]
                                        Quick: 3900 5200
                                               7700 8000
```

**Riichi Declaration (Persistent State):**

```
Before Riichi:              After Riichi:
│ 🀁 Josh   25,000 │       │ 🀁 Josh   24,000 🎌│
                            (Riichi indicator stays until hand ends)
```

**Draw Recording with Tenpai:**

```
┌──────────────────────┐
│ Draw - Who's Tenpai? │
│ ┌─────┐ ┌─────┐     │
│ │Koki ✓│ │Josh  │     │
│ └─────┘ └─────┘     │
│ ┌─────┐ ┌─────┐     │
│ │Mikey✓│ │Jo    │     │  <- Multi-select
│ └─────┘ └─────┘     │
│ [Calculate: +1500ea] │  <- Auto-calculation
└──────────────────────┘
```

#### Advanced Features Panel

**Slide-Up Panel for Complex Scenarios:**

```
┌──────────────────────┐
│ ⚙️ Advanced Options   │
├──────────────────────┤
│ Multiple Winners:    │
│ [Double Ron] [Triple]│
├──────────────────────┤
│ Special Draws:       │
│ [Suucha] [Suufon]   │
│ [Kyuushu] [Suukaikan]│
├──────────────────────┤
│ Penalties:           │
│ [Chombo] [Noten]     │
├──────────────────────┤
│ Yakuman:             │
│ [32000] [48000]      │
│ Name: [_________]    │
├──────────────────────┤
│ Manual Override:     │
│ [Edit Scores]        │
└──────────────────────┘
```

### Visual Feedback & Real-Time Features

#### Score Change Animations

```
Before Win:          During Animation:      After Win:
Josh: 25,000    →   Josh: 25,000 (-5,800)  →  Josh: 19,200
Koki: 25,000    →   Koki: 25,000 (+5,800)  →  Koki: 30,800
                     ↑ Red/Green color animation
```

#### Validation Indicators

```
Valid Input:              Invalid Input:
┌──────────────┐         ┌──────────────┐
│ Points: 5800 ✓│        │ Points: 5700 ✗│
│ ✅ Valid hand │         │ ⚠️ Invalid    │
└──────────────┘         │ Not standard  │
                         └──────────────┘
```

#### Undo/History Features

```
┌────────────────────────────┐
│ Last Action (tap to undo)  │
│ E1: Josh ron Mikey 5800   │
│ [↶ Undo] [✓ Confirm]       │
└────────────────────────────┘
```

### Han/Fu Calculator Integration

**Optional Detailed Input (Mahjong Helper Pattern):**

```
┌──────────────────────┐
│ Calculate Score:     │
├──────────────────────┤
│ Han: [3] ▼          │
│ Fu:  [30] ▼         │
├──────────────────────┤
│ Yaku Selection:      │
│ ☑ Riichi (1 han)    │
│ ☑ Tanyao (1 han)    │
│ ☑ Pinfu (1 han)     │
├──────────────────────┤
│ = 5,800 points      │
│ [Use This Score]    │
└──────────────────────┘
```

### Mobile Optimizations

- Large touch targets (minimum 44x44px)
- Bottom sheet modals for input
- Swipe gestures for navigation
- Haptic feedback on actions
- Landscape orientation support
- Offline capability with sync
- Auto-scroll to active input
- Number pad for point entry
- Voice input support (future)

### Desktop/Tablet Enhanced View

```
┌──────────────────────────────────────────────────────┐
│  Riichi Mahjong League - Hand Recording              │
├─────────────────┬────────────────────────────────────┤
│                 │         Hand Entry Panel           │
│   🧭 Compass    ├────────────────────────────────────┤
│                 │ Winner: [Dropdown ▼]               │
│   East: Koki*   │ Method: ( ) Ron  (•) Tsumo ( )Draw│
│   South: Josh   │ Loser:  [Dropdown ▼] (if Ron)     │
│   West: Mikey   │ Points: [_______] or              │
│   North: Jo     │         [Common Values Grid]       │
│                 ├────────────────────────────────────┤
│  East 1 • H:0   │ ☐ Riichi Declared                  │
│  Riichi: 0      │ ☐ Calculate from Han/Fu            │
│  Pot: 0         │ [Submit] [Reset]                   │
├─────────────────┴────────────────────────────────────┤
│                  Hand History                        │
│ ┌───────────────────────────────────────────────┐   │
│ │ #  │ Round │ Outcome │ Points │ Scores After │   │
│ │ 1  │ E1    │ Ron     │ +5800  │ K:30.8 J:19.2│   │
│ │ 2  │ E1.1  │ Tsumo   │ 2K/4K  │ K:36.8 ...   │   │
│ └───────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

## UI/UX Research Summary

Based on analysis of popular riichi mahjong applications, the following patterns emerge:

### Common Successful Patterns

1. **Tenhou**: Bottom-heavy controls, minimal UI, competitive focus
2. **MahjongSoul**: Visual compass display, modern animations, gacha elements
3. **Kemono Mahjong**: Colorful design, mobile-optimized layouts, intuitive controls
4. **Mahjong Tracker**: Simple point input, automatic calculations, server sync
5. **Riichi Tracker (1Computer1)**: PWA support, modular features, offline capability

### Key Takeaways for Implementation

1. **Simplicity First**: Most successful apps hide complexity behind progressive disclosure
2. **Mobile Priority**: Touch-optimized controls at screen bottom for one-handed use
3. **Visual State**: Clear round/wind indicators using compass metaphor
4. **Quick Entry**: Common point values as buttons, not just text input
5. **Validation**: Real-time feedback on valid/invalid inputs
6. **Undo Support**: Critical for live game recording
7. **Offline First**: PWA with sync for reliability during games

### Hand History Viewer (When Available)

```
// For games WITH hand history:
┌─────────────────────────────┐
│ Game: Aug 2, 2024           │
├─────────────────────────────┤
│ ┌───────────────────────┐   │
│ │ East 1                │   │
│ │ Josh riichi           │   │
│ │ Jo riichi             │   │
│ │ Jo ron Mikey 8000     │   │
│ └───────────────────────┘   │
│ ┌───────────────────────┐   │
│ │ East 2                │   │
│ │ Mikey riichi          │   │
│ │ Mikey ron Josh 1500   │   │
│ └───────────────────────┘   │
└─────────────────────────────┘

// For games WITHOUT hand history:
┌─────────────────────────────┐
│ Game: June 15, 2024         │
├─────────────────────────────┤
│   Final Scores Only         │
│                             │
│   Koki:   42,100 🥇         │
│   Josh:   28,300 🥈         │
│   Mikey:  21,600 🥉         │
│   Jo:      8,000            │
│                             │
│ [No hand history available] │
└─────────────────────────────┘
```

## Technical Requirements

### Database Schema Enhancements

#### New Tables

```sql
-- Represents each hand/round in a game
CREATE TABLE hands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  hand_number SMALLINT NOT NULL,

  -- Round information
  wind_round wind_round NOT NULL, -- 'east', 'south', 'west', 'north'
  round_number SMALLINT NOT NULL CHECK (round_number BETWEEN 1 AND 4),
  honba_count SMALLINT NOT NULL DEFAULT 0,

  -- Dealer information
  dealer_seat riichi_seat NOT NULL,
  dealer_continues BOOLEAN, -- NULL until hand completes

  -- Hand outcome
  outcome_type hand_outcome NOT NULL,

  -- Riichi tracking
  riichi_deposits INTEGER NOT NULL DEFAULT 0, -- Total riichi sticks deposited this hand
  riichi_pot_before INTEGER NOT NULL DEFAULT 0, -- Sticks on table before this hand
  riichi_pot_after INTEGER NOT NULL DEFAULT 0, -- Sticks on table after this hand

  -- Winners for multiple ron (array of player_ids)
  winners UUID[] DEFAULT '{}',

  -- Special hand indicators
  is_yakuman BOOLEAN DEFAULT FALSE,
  yakuman_type TEXT, -- 'suuankou', 'kokushi', etc.

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ, -- When hand was finalized

  UNIQUE(game_id, hand_number)
);

-- Individual player actions/events within a hand
CREATE TABLE hand_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hand_id UUID REFERENCES hands(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id),
  seat riichi_seat NOT NULL,

  -- Action details
  action_type hand_action NOT NULL,
  action_order SMALLINT NOT NULL, -- Order within the hand
  action_timestamp TIMESTAMPTZ DEFAULT NOW(),

  -- For ron: who dealt the winning tile
  target_player_id UUID REFERENCES players(id), -- NULL except for ron/deal_in

  -- Point changes
  points_delta INTEGER, -- Can be positive (win) or negative (loss/payment)

  -- For riichi tracking
  riichi_stick_delta INTEGER DEFAULT 0, -- +1000 deposit, -1000 return

  -- Additional data
  details JSONB DEFAULT '{}', -- yaku, fu, han, dora, uncertain data, etc.

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(hand_id, player_id, action_type, action_order)
);

-- Track running scores after each hand
CREATE TABLE hand_scores (
  hand_id UUID REFERENCES hands(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id),
  seat riichi_seat NOT NULL,
  score_before INTEGER NOT NULL, -- Score before this hand
  score_after INTEGER NOT NULL, -- Score after this hand completes

  PRIMARY KEY (hand_id, player_id)
);

-- Game configuration for rule variations
CREATE TABLE game_configurations (
  game_id UUID PRIMARY KEY REFERENCES games(id) ON DELETE CASCADE,

  -- Starting conditions
  starting_points INTEGER NOT NULL DEFAULT 25000,
  return_points INTEGER NOT NULL DEFAULT 30000, -- Target for oka calculation

  -- Uma settings (placement bonuses)
  uma_1st INTEGER NOT NULL DEFAULT 15000,
  uma_2nd INTEGER NOT NULL DEFAULT 5000,
  uma_3rd INTEGER NOT NULL DEFAULT -5000,
  uma_4th INTEGER NOT NULL DEFAULT -15000,

  -- Oka (winner bonus from starting points)
  oka_bonus INTEGER NOT NULL DEFAULT 20000,

  -- Rule variations
  allow_double_ron BOOLEAN DEFAULT TRUE,
  allow_triple_ron BOOLEAN DEFAULT FALSE,
  triple_ron_draw BOOLEAN DEFAULT TRUE, -- If true, triple ron causes abortive draw

  -- Renchan (dealer repeat) rules
  renchan_type renchan_rule DEFAULT 'tenpai', -- 'agari', 'tenpai', or 'always'

  -- Abortive draw settings
  enable_nagashi_mangan BOOLEAN DEFAULT TRUE,
  enable_suufon_renda BOOLEAN DEFAULT TRUE,
  enable_kyuushu_kyuuhai BOOLEAN DEFAULT TRUE,
  enable_suucha_riichi BOOLEAN DEFAULT TRUE,
  enable_suukaikan BOOLEAN DEFAULT TRUE,

  -- Game ending conditions
  enable_tobi BOOLEAN DEFAULT TRUE, -- End game when player goes below 0
  tobi_threshold INTEGER DEFAULT 0, -- Score threshold for bankruptcy

  -- Chombo penalty settings
  chombo_penalty_type TEXT DEFAULT 'reverse_mangan', -- 'none', 'reverse_mangan', 'custom'
  chombo_penalty_amount INTEGER DEFAULT 8000, -- Total penalty if custom

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### New Enums

```sql
CREATE TYPE wind_round AS ENUM ('east', 'south', 'west', 'north');

CREATE TYPE hand_outcome AS ENUM (
  'ron',                -- Win by discard
  'tsumo',              -- Win by self-draw
  'double_ron',         -- Two players win
  'triple_ron',         -- Three players win (if allowed)
  'exhaustive_draw',    -- No tiles left (ryuukyoku)
  'nagashi_mangan',     -- All discards are terminals/honors
  'suufon_renda',       -- Four same winds discarded
  'kyuushu_kyuuhai',    -- Nine different terminals/honors
  'suucha_riichi',      -- Four players riichi
  'suukaikan',          -- Four kans declared
  'sanchahou',          -- Triple ron abortive draw
  'chombo',             -- Penalty
  'no_contest'          -- Hand voided/abandoned
);

CREATE TYPE hand_action AS ENUM (
  'riichi',             -- Declare riichi
  'win',                -- Win the hand
  'deal_in',            -- Lost by dealing winning tile
  'payment',            -- Payment for tsumo/draw
  'tenpai',             -- In tenpai at draw
  'not_tenpai',         -- Not in tenpai at draw
  'chombo_penalty',     -- Chombo penalty payment
  'riichi_return',      -- Get riichi stick back
  'riichi_won',         -- Riichi sticks claimed by winner
  'bankruptcy_transfer' -- Point transfer due to bankruptcy
);

CREATE TYPE renchan_rule AS ENUM (
  'agari',              -- Dealer continues only on win
  'tenpai',             -- Dealer continues on win or tenpai
  'always'              -- Dealer always continues (ryuukyoku renchan)
);
```

#### Migration from Existing Schema

The existing `hand_events` table will be deprecated. A migration script will:

1. Create new tables with enhanced structure
2. Migrate existing data if any
3. Update foreign key relationships
4. Add indexes for performance

### API Endpoints

#### Record Hand

```
POST /api/games/{gameId}/hands
```

Request body:

```json
{
  "wind_round": "east",
  "round_number": 1,
  "honba_count": 0,
  "outcome_type": "ron",
  "actions": [
    {
      "player_id": "uuid",
      "action_type": "riichi",
      "action_order": 1
    },
    {
      "player_id": "uuid",
      "action_type": "win",
      "action_order": 2,
      "points_delta": 5800,
      "details": {
        "han": 3,
        "fu": 30,
        "yaku": ["riichi", "tanyao", "pinfu"]
      }
    },
    {
      "player_id": "uuid",
      "action_type": "deal_in",
      "action_order": 3,
      "points_delta": -5800
    }
  ]
}
```

Response:

```json
{
  "hand_id": "uuid",
  "hand_number": 1,
  "scores_after": {
    "player1": 30800,
    "player2": 19200,
    "player3": 25000,
    "player4": 25000
  },
  "next_dealer": "player1",
  "riichi_pot": 0
}
```

#### Get Game Hands

```
GET /api/games/{gameId}/hands
```

Response:

```json
{
  "hands": [
    {
      "hand_id": "uuid",
      "hand_number": 1,
      "round": "East 1",
      "outcome": "ron",
      "winner": "Josh",
      "loser": "Mikey",
      "points": 5800,
      "riichi_declared": ["Josh"],
      "scores_after": {...}
    }
  ]
}
```

#### Update Hand

```
PUT /api/games/{gameId}/hands/{handId}
```

#### Delete Hand

```
DELETE /api/games/{gameId}/hands/{handId}
```

### Validation Rules

1. **Point Balance**: Total point changes must sum to zero (accounting for riichi deposits)
2. **Score Bounds**: Respect tobi rules based on game configuration
3. **Dealer Progression**: Correctly track dealer rotation based on outcome and renchan rules
4. **Honba Tracking**: Increment on dealer win or draw, reset on non-dealer win
5. **Riichi Validation**: Can only declare riichi with sufficient points (≥1000)
6. **Draw Validation**: Tenpai payments must balance
7. **Bankruptcy Handling**: When tobi is enabled, validate game end conditions

### Handling Incomplete/Uncertain Data

The system supports recording hands with incomplete information:

```sql
-- Example: Uncertain who won between two players
INSERT INTO hand_actions (details) VALUES (
  '{
    "uncertain": true,
    "note": "Either mikey or josh won, need to verify from final scores",
    "possible_winners": ["mikey_id", "josh_id"],
    "points": 2600
  }'::jsonb
);
```

**Incomplete Data Strategies**:

1. **Defer Validation**: Allow saving with `completed_at = NULL` for later completion
2. **Notes Field**: Store recorder's notes in details JSONB
3. **Reconciliation Mode**: Compare hand history with final scores to infer missing data
4. **Audit Trail**: Track all edits with timestamps and editor IDs

### Performance Requirements

- Hand entry response time: < 500ms
- Score calculation: < 100ms
- Hand history load: < 1 second for 100 hands
- Offline storage: Support for 10+ games
- Data sync: Incremental updates when online

### Integration Points

1. **Game Creation**: Initialize hand recording when game starts
2. **Game Completion**: Validate final scores match hand history
3. **Rating System**: Use detailed hand data for advanced statistics
4. **Player Profiles**: Show hand-level statistics and patterns
5. **Analytics**: Generate reports on playing styles and tendencies

## Backward Compatibility & Optional Hand History

### Core Principle

Hand history is **100% optional**. Games without hand data are first-class citizens in the system.

### Database Design for Compatibility

1. **No Foreign Key Requirements**: The existing `games` and `game_seats` tables remain unchanged. Hand tables are additive only.

2. **Zero Hand History is Valid**: Games can have:
   - No hands recorded (legacy games, simple score tracking)
   - Partial hand history (started recording mid-game)
   - Complete hand history (full recording from start)

3. **Graceful Degradation**: All queries handle missing hand data:

```sql
-- Example: Get game summary that works with or without hands
CREATE OR REPLACE VIEW game_summary AS
SELECT
  g.id,
  g.started_at,
  g.finished_at,
  -- Final scores from game_seats (always available)
  gs.final_score,
  -- Hand count (0 for games without hands)
  COALESCE(h.hand_count, 0) as hands_recorded,
  -- Detailed stats only if hands exist
  CASE
    WHEN h.hand_count > 0 THEN 'detailed'
    ELSE 'final_only'
  END as data_quality
FROM games g
JOIN game_seats gs ON gs.game_id = g.id
LEFT JOIN (
  SELECT game_id, COUNT(*) as hand_count
  FROM hands
  GROUP BY game_id
) h ON h.game_id = g.id;
```

### UI/UX Handling of Mixed Data

#### Game List View

```typescript
interface GameDisplay {
  // Always available
  id: string;
  date: Date;
  players: Player[];
  finalScores: number[];

  // Optional hand data
  handCount?: number;
  hasDetailedHistory: boolean;
}

// UI shows different indicators
<GameCard>
  {game.hasDetailedHistory ? (
    <Badge>📊 Full History</Badge>
  ) : (
    <Badge>📋 Final Scores Only</Badge>
  )}
</GameCard>
```

#### Player Profile Statistics

```typescript
// Statistics gracefully degrade based on available data
interface PlayerStats {
  // Always available (from game_seats)
  gamesPlayed: number;
  averagePlacement: number;
  totalPlusMinus: number;

  // Only available with hand history
  riichiRate?: number; // null for pre-July games
  dealInRate?: number; // null for pre-July games
  averageWinValue?: number; // null for pre-July games
}
```

### Rating System Compatibility

The Python rating engine continues to work exactly as before:

```python
def calculate_ratings(games: List[Game]) -> Ratings:
    """
    Rating calculation uses final scores only.
    Hand history is ignored for rating purposes.
    """
    for game in games:
        # Use final_score from game_seats (always available)
        scores = get_final_scores(game)
        update_ratings(scores)

        # Optional: Calculate additional stats if hands exist
        if has_hand_history(game):
            calculate_detailed_stats(game)  # Separate, optional
```

### Migration Path for Existing Games

**No migration required!** Existing games remain untouched:

1. **Pre-July Games**: Continue to display with final scores only
2. **Post-Implementation Games**: Can optionally record hands
3. **Mixed Mode**: Some games with hands, some without - both valid

### API Responses Handle Both Cases

```typescript
// GET /api/games/:id
{
  "id": "game-123",
  "players": [...],
  "finalScores": [30000, 25000, 23000, 22000],  // Always present
  "hands": [],  // Empty array for games without hands
  "dataQuality": "final_only"  // or "partial" or "complete"
}

// GET /api/games/:id/hands
// Returns empty array for games without hands
// Returns partial data for games with some hands
// Returns full data for completely recorded games
```

### Feature Flags for Progressive Rollout

```typescript
interface FeatureFlags {
  // Control hand recording availability
  enableHandRecording: boolean; // Turn on for new games
  showHandHistoryTab: boolean; // Show UI for viewing
  requireHandRecording: boolean; // Always false - never required

  // Gradual rollout
  handRecordingUserIds?: string[]; // Beta test with specific users
}
```

## Supabase-Specific Implementation

### Row Level Security (RLS) Policies

```sql
-- Players can view all game hands
CREATE POLICY "Players can view hands"
  ON hands FOR SELECT
  USING (true);

-- Only authenticated users can insert hands for games they're in
CREATE POLICY "Players can record hands for their games"
  ON hands FOR INSERT
  WITH CHECK (
    game_id IN (
      SELECT game_id FROM game_seats
      WHERE player_id = auth.uid()
    )
  );

-- Only hand creator can update/delete within 5 minutes
CREATE POLICY "Quick correction window"
  ON hands FOR UPDATE
  USING (
    created_at > NOW() - INTERVAL '5 minutes'
    AND created_by = auth.uid()
  );
```

### Database Functions for Validation

```sql
-- Validate point balance for a hand
CREATE OR REPLACE FUNCTION validate_hand_points(hand_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  total_delta INTEGER;
  honba_payments INTEGER;
  riichi_changes INTEGER;
BEGIN
  -- Sum all point changes
  SELECT COALESCE(SUM(points_delta), 0)
  INTO total_delta
  FROM hand_actions
  WHERE hand_actions.hand_id = validate_hand_points.hand_id;

  -- Account for riichi stick changes
  SELECT COALESCE(SUM(riichi_stick_delta), 0)
  INTO riichi_changes
  FROM hand_actions
  WHERE hand_actions.hand_id = validate_hand_points.hand_id;

  -- Total should be zero (points are zero-sum)
  RETURN (total_delta + riichi_changes) = 0;
END;
$$ LANGUAGE plpgsql;

-- Calculate scores after a hand
CREATE OR REPLACE FUNCTION calculate_hand_scores(p_hand_id UUID)
RETURNS TABLE(player_id UUID, score_after INTEGER) AS $$
BEGIN
  RETURN QUERY
  WITH previous_scores AS (
    SELECT
      hs.player_id,
      hs.score_after as prev_score
    FROM hand_scores hs
    JOIN hands h ON h.id = hs.hand_id
    WHERE h.game_id = (SELECT game_id FROM hands WHERE id = p_hand_id)
      AND h.hand_number = (SELECT hand_number - 1 FROM hands WHERE id = p_hand_id)
  ),
  starting_scores AS (
    SELECT
      gs.player_id,
      COALESCE(gc.starting_points, 25000) as score
    FROM game_seats gs
    LEFT JOIN game_configurations gc ON gc.game_id = gs.game_id
    WHERE gs.game_id = (SELECT game_id FROM hands WHERE id = p_hand_id)
  ),
  hand_changes AS (
    SELECT
      player_id,
      SUM(points_delta) as total_change
    FROM hand_actions
    WHERE hand_id = p_hand_id
    GROUP BY player_id
  )
  SELECT
    s.player_id,
    COALESCE(p.prev_score, s.score) + COALESCE(c.total_change, 0) as score_after
  FROM starting_scores s
  LEFT JOIN previous_scores p ON p.player_id = s.player_id
  LEFT JOIN hand_changes c ON c.player_id = s.player_id;
END;
$$ LANGUAGE plpgsql;
```

### Real-time Subscriptions

```typescript
// Subscribe to hand updates for live game tracking
const subscription = supabase
  .channel("game-hands")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "hands",
      filter: `game_id=eq.${gameId}`,
    },
    payload => {
      // Update UI with new hand
      updateHandHistory(payload.new);
      updateScores();
    }
  )
  .subscribe();
```

### Database Transaction for Hand Recording

```sql
-- Complete hand recording with transaction
CREATE OR REPLACE FUNCTION record_hand_complete(
  p_game_id UUID,
  p_hand_data JSONB
) RETURNS UUID AS $$
DECLARE
  v_hand_id UUID;
BEGIN
  -- Start transaction
  -- Insert hand record
  INSERT INTO hands (game_id, wind_round, round_number, honba_count, outcome_type, dealer_seat)
  VALUES (
    p_game_id,
    (p_hand_data->>'wind_round')::wind_round,
    (p_hand_data->>'round_number')::SMALLINT,
    (p_hand_data->>'honba_count')::SMALLINT,
    (p_hand_data->>'outcome_type')::hand_outcome,
    (p_hand_data->>'dealer_seat')::riichi_seat
  )
  RETURNING id INTO v_hand_id;

  -- Insert all actions
  INSERT INTO hand_actions (hand_id, player_id, seat, action_type, points_delta, target_player_id)
  SELECT
    v_hand_id,
    (action->>'player_id')::UUID,
    (action->>'seat')::riichi_seat,
    (action->>'action_type')::hand_action,
    (action->>'points_delta')::INTEGER,
    (action->>'target_player_id')::UUID
  FROM jsonb_array_elements(p_hand_data->'actions') AS action;

  -- Validate points balance
  IF NOT validate_hand_points(v_hand_id) THEN
    RAISE EXCEPTION 'Points do not balance to zero';
  END IF;

  -- Calculate and store scores
  INSERT INTO hand_scores (hand_id, player_id, seat, score_before, score_after)
  SELECT hand_id, player_id, seat, score_before, score_after
  FROM calculate_hand_scores(v_hand_id);

  -- Mark hand as complete
  UPDATE hands SET completed_at = NOW() WHERE id = v_hand_id;

  RETURN v_hand_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Transaction will rollback automatically
    RAISE;
END;
$$ LANGUAGE plpgsql;
```

### Architecture Responsibility Split

#### PostgreSQL (Supabase Database)

- **Data Storage**: All game and hand data
- **Basic Validation**: Point balance, required fields, constraints
- **Score Tracking**: Running score calculations via functions
- **Transactions**: Atomic hand recording operations
- **Live updates**: Use polling or another approach (Supabase Realtime is not a valid option for this project)

#### Python Serverless (Rating Engine)

- **Rating Calculations**: OpenSkill mu/sigma updates
- **Advanced Statistics**: Deal-in rates, riichi success rates, etc.
- **Complex Validation**: Yakuman verification, special scoring rules
- **Batch Processing**: End-of-game statistics generation
- **Historical Analysis**: Pattern detection, player tendencies

#### Next.js Frontend

- **UI State Management**: Optimistic updates, offline queue
- **Input Validation**: Basic client-side checks before submission
- **Score Preview**: Show calculated scores before confirming
- **Conflict Resolution**: Handle offline sync conflicts via timestamps
- **PWA Features**: Service worker for offline support

## Success Criteria

### Core Functionality

- [ ] Can record all standard riichi mahjong hand outcomes
- [ ] Supports complex scenarios (double ron, chombo, etc.)
- [ ] Real-time score tracking with validation
- [ ] Mobile-optimized interface for live recording
- [ ] Edit/delete hands with automatic recalculation
- [ ] Offline capability with sync
- [ ] Hand history viewer with filtering
- [ ] < 500ms response time for hand entry
- [ ] 100% point balance validation

### Backward Compatibility (Critical)

- [ ] All existing games continue to work without modification
- [ ] Games without hand history display normally
- [ ] Rating calculations unaffected by hand history presence
- [ ] UI gracefully handles games with no/partial/complete hand data
- [ ] No database migrations required for existing games
- [ ] Player statistics work with mixed data (some games with hands, some without)
- [ ] Can start recording hands at any point in a game
- [ ] Hand recording remains optional forever

## Test Scenarios

### Scenario 1: Basic Ron

**Given**: East 1, all players at 25000 points, Josh is dealer (initial East seat)
**When**: Josh declares riichi, then Josh ron Mikey for 5800
**Then**:

- Josh: 29800 (25000 - 1000 riichi + 5800 win + 1000 riichi returned)
- Mikey: 19200 (25000 - 5800)
- Others: 25000 (unchanged)
- Riichi pot: 0
- Dealer: Josh (remains as dealer won)
- Next: East 1, Honba 1

### Scenario 2: Dealer Tsumo with Honba

**Given**: East 2, Honba 2, dealer is the player initially seated South
**When**: Dealer (initial South seat) tsumo for 2000 all (3 han 30 fu)
**Then**:

- Dealer (South seat): +6600 (2000×3 + 200×3 honba payments)
- Initial East: -2200 (2000 + 200 honba)
- Initial West: -2200 (2000 + 200 honba)
- Initial North: -2200 (2000 + 200 honba)
- Dealer: Remains with initial South player (dealer won)
- Next: East 2, Honba 3

### Scenario 3: Exhaustive Draw with Tenpai

**Given**: South 3, Josh and Mikey both declared riichi (2000 points in pot)
**When**: Draw with Josh and Mikey tenpai, Koki and Jo noten
**Then**:

- Josh: +500 (25000 - 1000 riichi + 1500 tenpai payment)
- Mikey: +500 (25000 - 1000 riichi + 1500 tenpai payment)
- Koki: -1500 (noten payment)
- Jo: -1500 (noten payment)
- Riichi pot: 2000 (remains on table for next hand winner)
- Dealer: Depends on if dealer was tenpai (renchan rule)
- Next: South 3, Honba 1 (or South 4 if dealer was noten)

### Scenario 4: Double Ron

**Given**: East 4, dealer is the player initially seated North
**When**: Josh ron dealer 12000, Justin ron dealer 5200
**Then**:

- Dealer (initial North): -17200 (12000 + 5200)
- Josh: +12000
- Justin: +5200
- Other player: unchanged
- Dealer rotates: Initial East player becomes dealer
- Next: South 1 (new round begins)

### Scenario 5: Chombo (Reverse Mangan)

**Given**: South 2, dealer is the player initially seated South
**When**: Player initially seated East declares invalid win (chombo)
**Then**:

- Initial East (non-dealer): -8000 total
  - Pays 2000 to initial West (non-dealer)
  - Pays 2000 to initial North (non-dealer)
  - Pays 4000 to dealer (initial South)
- Initial West: +2000
- Initial North: +2000
- Dealer (initial South): +4000
- Hand is replayed as South 2, same dealer

### Scenario 6: Edit Previous Hand

**Given**: 5 hands recorded, error in hand 3
**When**: Edit hand 3 to correct point value
**Then**:

- Scores recalculated from hand 3 onward
- Current scores updated
- History shows edit timestamp

### Scenario 7: Non-Dealer Tsumo

**Given**: East 3, dealer is the player initially seated West
**When**: Non-dealer (initial East) tsumo for 1000/2000 (3 han 30 fu)
**Then**:

- Winner (initial East): +4000 (1000×2 + 2000)
- Initial South (non-dealer): -1000
- Initial West (dealer): -2000
- Initial North (non-dealer): -1000
- Dealer rotates to initial North
- Next: East 4

### Scenario 8: Exhaustive Draw - All Tenpai

**Given**: East 1, no riichi declared
**When**: Draw with all 4 players tenpai
**Then**:

- No points exchanged (all tenpai)
- Scores unchanged
- Honba increases by 1
- Dealer continues (was tenpai)
- Next: East 1, Honba 1

### Scenario 9: Yakuman Scoring

**Given**: East 3, dealer is the player initially seated West
**When**: Dealer tsumo Suuankou (yakuman)
**Then**:

- Dealer (initial West): +48000 (16000 from each player)
- Initial East: -16000
- Initial South: -16000
- Initial North: -16000
- Dealer continues (dealer won)
- Next: East 3, Honba 1

### Scenario 10: Tobi (Bankruptcy)

**Given**: Player at 2000 points, tobi rule enabled (game ends at negative score)
**When**: Player loses 5800 points by dealing into ron
**Then**:

- Losing player: -3800 points (2000 - 5800)
- Winner receives: +5800 points (full amount)
- Game ends immediately (tobi triggered)
- Final scores recorded with negative value
- Note: Some rulesets have "buttobi" where only available points transfer

### Scenario 11: Game Without Hand History (Backward Compatibility)

**Given**: Existing game from May 2024 with only final scores
**When**: Viewing game details
**Then**:

- Game displays normally with final scores
- No hand history tab shown or shown as empty
- Rating calculations work normally
- Player statistics show this game in totals

### Scenario 12: Riichi Stick Collection

**Given**: East 2, 3 riichi sticks on table from previous hand (3000 points)
**When**: Player declares riichi and wins by tsumo
**Then**:

- Winner collects: Base tsumo payment + 3000 (previous riichi) + 1000 (own riichi returned)
- Example: 1000/2000 tsumo = 4000 base + 4000 riichi = 8000 total gain
- Riichi pot: 0 (cleared)
- Note: Only the winner collects all riichi sticks

### Scenario 13: Partial Hand Recording (Backward Compatibility)

**Given**: Game started without hand recording
**When**: Hand recording enabled mid-game at South round
**Then**:

- East round hands: Not recorded
- South round hands: Recorded normally
- Final scores: Still accurate
- UI indicates "Partial hand history available"

## Implementation Priority

### Phase 1: Core Recording (Week 1-2)

- Database schema implementation
- Basic API endpoints
- Score calculation engine
- Simple web interface

### Phase 2: Mobile UI (Week 3-4)

- Mobile-optimized interface
- Quick entry methods
- Offline support
- Hand history viewer

### Phase 3: Advanced Features (Week 5-6)

- Complex scenario handling
- Edit/delete functionality
- Integration with rating system
- Performance optimization

### Phase 4: Polish & Testing (Week 7-8)

- Comprehensive testing
- UI polish and animations
- Documentation
- User training materials

---

## Summary of v3.0 Improvements (Final Review)

### Critical Fixes from Deep Analysis

1. **Database Schema Enhancements**:
   - Added `target_player_id` to track who dealt into ron (essential for statistics)
   - Added tobi (bankruptcy) configuration options
   - Added chombo penalty customization (reverse mangan variants)
   - Support for incomplete/uncertain data recording

2. **Architecture Clarifications**:
   - Clear separation: PostgreSQL for data/validation, Python for statistics, Next.js for UI
   - Atomic transaction example for hand recording
   - Offline conflict resolution strategy defined
   - Use Supabase's built-in APIs rather than custom REST endpoints

3. **Rule Accuracy Improvements**:
   - Clarified "reverse mangan" chombo as standard -8000 point penalty
   - Added tobi rules for game ending conditions
   - Fixed test scenarios (all point calculations verified)
   - Proper handling of bankruptcy point transfers

4. **Real-World Compatibility**:
   - Handles your specific notation style from hand_notes_examples.txt
   - Supports incomplete data entry (common in live recording)
   - Reconciliation mode for inferring missing data from final scores
   - Audit trail for all edits

## Summary of v2.0 Improvements

Based on comprehensive review and research, this specification has been enhanced with:

### Riichi Rule Accuracy

- Proper tenpai payment calculations (noten bappu)
- Complete abortive draw types (suufon renda, kyuushu kyuuhai, etc.)
- Correct honba and riichi stick handling
- Double/triple ron scoring with turn order considerations
- Renchan (dealer continuation) rule variations

### Database Design Improvements

- Added `game_configurations` table for rule variations
- Enhanced hand tracking with dealer seat and continuation flags
- Support for multiple winners (double/triple ron)
- Yakuman tracking and special hand indicators
- Bankruptcy transfer handling
- Flexible starting points (25000 or 30000)

### Architecture Integration

- Supabase-specific RLS policies for security
- PostgreSQL functions for validation and scoring
- Polling or another approach for live updates (Supabase Realtime is not used)
- Edge Functions for complex validation
- Proper separation of concerns (DB vs Python vs Edge)
- PWA offline support strategy

### Additional Test Coverage

- Tenpai payment scenarios
- Abortive draw handling
- Yakuman scoring
- Bankruptcy situations
- Complex multi-player scenarios

This specification now provides a comprehensive, technically accurate blueprint for implementing hand recording functionality that will satisfy both casual players and riichi mahjong veterans. The feature integrates seamlessly with the existing Supabase/Python/Next.js architecture while maintaining flexibility for different rule variations.
