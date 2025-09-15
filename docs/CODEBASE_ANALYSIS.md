# Codebase Analysis and Improvement Opportunities

## Current Structure Analysis

### 🔴 Issues Identified

#### 1. **Inconsistent File Organization**

- API routes are deeply nested but not well-grouped by domain
- Components mix UI primitives with features
- Utilities scattered across multiple locations
- No clear separation between business logic and presentation

#### 2. **Naming Inconsistencies**

- Mix of naming conventions (camelCase, kebab-case, PascalCase)
- Generic names like `queries.ts` don't describe their purpose
- Some files have redundant paths (e.g., `features/games/GameHistoryView.tsx`)

#### 3. **Type Safety Issues**

- Missing TypeScript types in several places
- Using `any` types implicitly
- API responses not properly typed
- Props interfaces not exported for reuse

#### 4. **Code Duplication**

- Similar API error handling repeated across routes
- Duplicate Supabase client creation logic
- Repeated configuration access patterns
- Similar component structures not abstracted

#### 5. **Poor Separation of Concerns**

- Business logic mixed with UI components
- API routes contain too much logic
- No service layer for data operations
- Direct Supabase calls from components

## Proposed Improvements

### 📁 New File Structure

```
apps/web/src/
├── app/                    # Next.js App Router
│   ├── (routes)/          # Page routes
│   │   ├── page.tsx       # Home/Leaderboard
│   │   ├── games/
│   │   └── player/
│   ├── api/               # API routes (reorganized)
│   │   ├── v1/           # Versioned API
│   │   │   ├── games/
│   │   │   ├── players/
│   │   │   └── ratings/
│   │   └── health/       # Health checks
│   └── layout.tsx
│
├── features/              # Feature-based modules
│   ├── leaderboard/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── games/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── players/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── hand-recording/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── types/
│
├── core/                  # Core business logic
│   ├── services/         # Business services
│   │   ├── game.service.ts
│   │   ├── player.service.ts
│   │   └── rating.service.ts
│   ├── repositories/     # Data access layer
│   │   ├── game.repository.ts
│   │   └── player.repository.ts
│   └── domain/          # Domain models
│       ├── models/
│       └── types/
│
├── shared/              # Shared utilities
│   ├── components/     # Shared UI components
│   │   ├── ui/        # Base UI components
│   │   └── layout/    # Layout components
│   ├── hooks/         # Shared hooks
│   ├── lib/          # Libraries and utilities
│   │   ├── supabase/
│   │   └── utils/
│   └── types/        # Shared TypeScript types
│
└── config/           # Configuration
    ├── constants.ts
    ├── environment.ts
    └── feature-flags.ts
```

### 🔧 Specific Improvements

#### 1. **Create Service Layer**

- Extract business logic from components and API routes
- Implement repository pattern for data access
- Centralize error handling

#### 2. **Standardize Naming**

- Use consistent file naming (kebab-case for files, PascalCase for components)
- Descriptive names for all modules
- Follow naming conventions strictly

#### 3. **Improve Type Safety**

- Create comprehensive type definitions
- Use strict TypeScript configuration
- Generate types from Supabase schema
- Export all interfaces for reuse

#### 4. **Consolidate Utilities**

- Single source of truth for each utility
- Proper abstraction of common patterns
- Centralized configuration management

#### 5. **Feature Module Structure**

- Each feature is self-contained
- Clear separation of concerns
- Easy to understand and maintain

## Implementation Plan

### Phase 1: Core Infrastructure (Low Risk)

1. Create service layer
2. Set up repository pattern
3. Consolidate utilities
4. Add comprehensive types

### Phase 2: API Reorganization (Medium Risk)

1. Version the API (v1)
2. Group by domain
3. Extract business logic to services
4. Standardize error handling

### Phase 3: Feature Modules (Medium Risk)

1. Reorganize components by feature
2. Create feature-specific hooks
3. Move feature logic to services
4. Update imports

### Phase 4: Final Cleanup (Low Risk)

1. Remove duplicate code
2. Update documentation
3. Add missing tests
4. Verify all functionality

## Benefits for Newcomers

1. **Clear Structure**: Easy to understand where things belong
2. **Feature Isolation**: Can work on one feature without understanding entire codebase
3. **Consistent Patterns**: Same patterns repeated across features
4. **Better Documentation**: Types serve as documentation
5. **Separation of Concerns**: Clear boundaries between layers
6. **Testability**: Easier to test isolated services

## Risk Mitigation

1. **Verification Script**: Run before and after each change
2. **Incremental Changes**: Small, testable changes
3. **Git Commits**: Commit after each successful change
4. **Type Checking**: Ensure TypeScript compilation passes
5. **E2E Tests**: Run existing tests to verify functionality
