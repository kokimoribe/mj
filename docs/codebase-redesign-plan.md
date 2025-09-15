# Codebase Redesign Plan

## Executive Summary

After analyzing the current codebase structure (~11,500 lines of TypeScript/React code), I've identified several opportunities for improvement while maintaining the application's functionality. The codebase is generally well-organized but can benefit from consolidation, clearer naming conventions, and removal of duplicate/unused code.

## Current State Analysis

### Strengths

1. **Clear separation of concerns** with `/core` directory containing domain types, services, and repositories
2. **Component organization** by feature in `/components/features`
3. **Service layer pattern** already implemented (though not fully adopted)
4. **Comprehensive type system** in `/core/domain/types`
5. **Good test coverage** for critical components

### Areas for Improvement

#### 1. **Duplicate and Unused Code**

- `route.improved.ts` exists alongside `route.ts` (improved version not in use)
- Multiple type definitions scattered across files (Player, Game, etc.)
- Inconsistent import paths (`@/lib` vs `@/core`)

#### 2. **Directory Structure Confusion**

- Both `/lib` and `/core/lib` directories exist with overlapping purposes
- Utils scattered between `/lib/utils` and inline in components
- Supabase code split between `/lib/supabase` and inline queries

#### 3. **API Route Organization**

- Hand recording routes deeply nested but feature not implemented
- Inconsistent error handling between routes
- Service layer implemented but not consistently used

#### 4. **Component Organization**

- 47 component files with some having unclear responsibilities
- UI components mixed with feature components in some cases
- Missing clear boundary between presentational and container components

## Proposed Redesign

### Phase 1: Code Consolidation (Low Risk)

#### 1.1 Merge Duplicate Code

```
Actions:
- Replace route.ts with route.improved.ts (already tested)
- Consolidate type definitions to /core/domain/types
- Remove duplicate utility functions
```

#### 1.2 Directory Restructure

```
apps/web/src/
├── core/                    # Business logic & domain
│   ├── domain/
│   │   ├── types/          # All TypeScript types
│   │   └── constants/      # App constants
│   ├── services/           # Business logic
│   ├── repositories/       # Data access
│   └── utils/              # Core utilities
├── infrastructure/         # External integrations
│   ├── supabase/          # Database client & queries
│   ├── api/               # External API clients
│   └── config/            # App configuration
├── features/              # Feature modules
│   ├── leaderboard/
│   ├── games/
│   ├── players/
│   └── configuration/
├── shared/                # Shared across features
│   ├── components/        # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   └── utils/            # UI utilities
└── app/                  # Next.js app directory
```

#### 1.3 Import Path Standardization

```typescript
// Before (mixed):
import { Player } from "@/lib/supabase/types";
import { GameService } from "@/core/services/game.service";

// After (consistent):
import { Player } from "@/core/domain/types";
import { GameService } from "@/core/services";
```

### Phase 2: Feature Module Pattern (Medium Risk)

#### 2.1 Implement Feature Modules

Each feature becomes self-contained:

```
features/leaderboard/
├── components/           # Feature-specific components
├── hooks/               # Feature-specific hooks
├── services/            # Feature business logic
├── types/               # Feature-specific types
└── index.ts            # Public API
```

#### 2.2 Clear Public APIs

```typescript
// features/leaderboard/index.ts
export { LeaderboardView } from "./components/LeaderboardView";
export { useLeaderboard } from "./hooks/useLeaderboard";
export type { LeaderboardConfig } from "./types";
```

### Phase 3: Service Layer Adoption (Medium Risk)

#### 3.1 Complete Service Layer Migration

- Migrate all API routes to use service layer
- Implement consistent error handling
- Add request/response validation

#### 3.2 Repository Pattern Completion

- Move all Supabase queries to repositories
- Implement caching layer
- Add query optimization

### Phase 4: Performance Optimization (Low Risk)

#### 4.1 Code Splitting

```typescript
// Lazy load heavy features
const ConfigurationPanel = lazy(() => import("@/features/configuration"));
const HandRecording = lazy(() => import("@/features/hand-recording"));
```

#### 4.2 Bundle Optimization

- Extract common chunks
- Optimize imports
- Remove unused dependencies

## Implementation Plan

### Week 1: Preparation & Safety

1. **Day 1-2**: Create comprehensive test suite
   - Add E2E tests for all critical paths
   - Create visual regression tests
   - Set up CI/CD test automation

2. **Day 3-4**: Set up migration infrastructure
   - Create migration scripts
   - Set up rollback procedures
   - Document current architecture

3. **Day 5**: Create feature flags
   - Implement gradual rollout system
   - Set up A/B testing capability

### Week 2: Phase 1 Implementation

1. **Day 1-2**: Code consolidation
   - Merge duplicate files
   - Consolidate types
   - Remove unused code

2. **Day 3-4**: Directory restructure
   - Move files to new structure
   - Update all imports
   - Verify build

3. **Day 5**: Testing & validation
   - Run full test suite
   - Manual testing
   - Performance benchmarking

### Week 3: Phase 2 Implementation

1. **Day 1-3**: Feature module migration
   - Migrate one feature at a time
   - Maintain backward compatibility
   - Test each migration

2. **Day 4-5**: Integration testing
   - Test feature interactions
   - Verify no regressions
   - Update documentation

### Week 4: Phase 3 & 4 Implementation

1. **Day 1-2**: Service layer completion
   - Migrate remaining routes
   - Implement consistent patterns

2. **Day 3-4**: Performance optimization
   - Implement code splitting
   - Optimize bundles
   - Add monitoring

3. **Day 5**: Final validation
   - Full regression testing
   - Performance testing
   - User acceptance testing

## Risk Assessment

### Low Risk Items ✅

- Type consolidation
- Removing unused code
- Import path standardization
- Code splitting
- Documentation updates

### Medium Risk Items ⚠️

- Directory restructuring
- Feature module pattern
- Service layer migration
- Repository pattern adoption

### High Risk Items ❌

- None identified (all changes are incremental and reversible)

## Mitigation Strategies

1. **Feature Flags**: Deploy changes behind flags for gradual rollout
2. **Comprehensive Testing**: Automated tests before each change
3. **Incremental Migration**: One module at a time
4. **Rollback Plan**: Git branches for each phase
5. **Monitoring**: Track errors and performance metrics

## Success Metrics

### Code Quality

- **Before**: 11,525 lines, scattered organization
- **Target**: ~9,000 lines, clear module boundaries
- **Measurement**: Lines of code, cyclomatic complexity

### Performance

- **Before**: ~2s page load
- **Target**: <1.5s page load
- **Measurement**: Lighthouse scores, Web Vitals

### Developer Experience

- **Before**: Mixed patterns, unclear boundaries
- **Target**: Consistent patterns, clear APIs
- **Measurement**: Time to implement features, bug rate

### Maintainability

- **Before**: Duplicate code, scattered utilities
- **Target**: DRY principle, centralized utilities
- **Measurement**: Code duplication %, test coverage

## Immediate Quick Wins (Can do now)

1. **Remove unused files** (~500 lines)
   - `/app/api/games/route.improved.ts` (use it or remove it)
   - Unused hand recording API routes
   - Empty test files

2. **Consolidate types** (~200 lines saved)
   - Merge duplicate Player/Game interfaces
   - Create single source of truth

3. **Fix import paths** (0 lines, better DX)
   - Standardize on `@/core`, `@/features`, `@/shared`
   - Update tsconfig paths

4. **Extract constants** (~100 lines)
   - Move magic numbers to constants
   - Create enum for game states

## Recommended Approach

### Option A: Incremental Refactoring (Recommended)

- **Timeline**: 4 weeks
- **Risk**: Low
- **Approach**: Phase by phase with validation
- **Rollback**: Easy at any phase

### Option B: Feature Freeze & Rewrite

- **Timeline**: 2 weeks
- **Risk**: High
- **Approach**: Stop feature development, focus on refactor
- **Rollback**: Difficult

### Option C: Gradual Migration

- **Timeline**: 8 weeks
- **Risk**: Very Low
- **Approach**: Refactor alongside feature development
- **Rollback**: Not needed (backward compatible)

## Next Steps

1. **Review and approve** this plan
2. **Choose approach** (A, B, or C)
3. **Create feature branch** for refactoring
4. **Start with quick wins** to build confidence
5. **Implement Phase 1** with comprehensive testing

## Conclusion

The codebase is in good shape but can benefit from consolidation and clearer organization. The proposed changes are low-risk and can be implemented incrementally without disrupting development. The key is maintaining comprehensive tests and doing gradual migrations.

The main benefits will be:

- **Cleaner codebase** (~20% reduction in code)
- **Better performance** (lazy loading, optimized bundles)
- **Improved developer experience** (clear patterns, consistent structure)
- **Easier maintenance** (modular design, clear boundaries)

All changes can be reverted if issues arise, and the incremental approach ensures the application remains functional throughout the process.
