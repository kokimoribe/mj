# Game End Detection System Review

## Summary

Reviewed and tested the game end detection system for riichi mahjong. The system correctly handles all standard game ending scenarios with one logic fix applied.

## Test Scenarios Verified

### ✅ 1. Hanchan Natural End

**Scenario**: Play through South 4 with dealer rotation, verify game prompts to end
**Status**: **PASSING**

- After completing S4 with non-dealer win and leader has 30k+, game ends with `natural_end` reason
- Correctly distinguishes between natural end (no enchousen entered) vs enchousen end

### ✅ 2. Hanchan Dealer Repeat on South 4

**Scenario**: Dealer wins on S4, verify game continues (S4-1 honba)
**Status**: **PASSING**

- Dealer wins but is not leader → game continues with dealer repeat
- Dealer wins, is leader but < 30k → game continues with dealer repeat
- Dealer wins, is leader with 30k+ → game ends immediately with `natural_end`

### ✅ 3. Enchousen Trigger

**Scenario**: End South 4 with leader at 28,000 points, verify West round starts
**Status**: **PASSING**

- After completing S4 with leader < 30k, game correctly enters enchousen (West round)
- `inEnchousen` flag is set correctly
- Game continues with appropriate message

### ✅ 4. Enchousen End

**Scenario**: End West round with leader at 32,000, verify game ends
**Status**: **PASSING** (after fix)

- When leader reaches 30k+ during enchousen (after playing hands), game ends with `enchousen_end` reason
- Correctly distinguishes between natural end and enchousen end

### ✅ 5. Bust Detection

**Scenario**: Player score goes to -100, verify immediate end prompt
**Status**: **PASSING**

- Bust detection has highest priority (checked first)
- Game ends immediately with `bust` reason when any player score < 0
- Works at any round/kyoku

### ✅ 6. Tonpuusen

**Scenario**: Create tonpuusen game, verify it ends after East 4
**Status**: **PASSING**

- After completing E4 with leader 30k+, game ends with `natural_end`
- Enchousen trigger works correctly (enters South round if leader < 30k)
- Enchousen end works correctly (ends with `enchousen_end` when leader reaches 30k+)

## Logic Fix Applied

### Issue

When completing the final round (S4 for hanchan, E4 for tonpuusen) with a non-dealer win and leader having 30k+, the system was incorrectly marking it as `enchousen_end` instead of `natural_end`.

### Root Cause

The system was checking `isInEnchousen` based on round alone (e.g., `round === "W"`), which is true even when we've just completed S4 and are about to enter West. This caused the system to think we were "in enchousen" when we hadn't actually played any hands in enchousen yet.

### Fix

Introduced `actuallyInEnchousen` flag that distinguishes between:

- **About to enter enchousen**: Just completed final round, haven't played hands yet (`justCompletedFinalRound === true`)
- **Actually in enchousen**: Have played at least one hand in enchousen (`justCompletedFinalRound === false`)

This ensures:

- Natural end when completing final round with 30k+ (no enchousen entered)
- Enchousen end when leader reaches 30k+ after playing hands in enchousen

## Implementation Details

### Key Constants

- `ENCHOUSEN_THRESHOLD = 30000`: Standard riichi mahjong threshold for ending without enchousen

### Detection Order (Priority)

1. **Bust check** (highest priority) - immediate game end
2. **Sudden death in enchousen** - if actually in enchousen and leader reaches 30k+
3. **Dealer repeat check** - handles dealer wins on final round
4. **Enchousen continuation** - if past final round but leader < 30k
5. **Natural end** - if completed/passed final round and leader has 30k+

### Game Formats

- **Hanchan**: Final round is South (S), enchousen is West/North
- **Tonpuusen**: Final round is East (E), enchousen is South/West/North

## Test Coverage

Comprehensive unit tests created in `apps/web/src/hooks/__tests__/useGameEndDetection.test.ts` covering:

- All 6 main scenarios
- Edge cases (exactly 30k, multiple busts, dealer scenarios)
- Both game formats (hanchan and tonpuusen)

## Conclusion

The game end detection system is now correctly aligned with standard riichi mahjong rules. All scenarios pass, and the logic properly distinguishes between natural ends and enchousen ends.
