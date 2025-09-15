# Riichi Mahjong League - Refactoring Plan

## Executive Summary

This refactoring plan addresses dead code removal, documentation cleanup, and code optimization opportunities identified through comprehensive analysis of the codebase against product requirements.

## Current State Analysis

### Implementation Completeness: 95%

The application successfully implements all core features from the product requirements with minor gaps:

- Missing rank indicators on main leaderboard cards
- No tap support for chart tooltips on mobile
- Inconsistent relative timestamp usage

### Code Quality Issues Identified

#### 1. Dead Code & Unused Files (High Priority)

**Empty Directories:**

- `/src/app/api-test/`
- `/src/app/test/`

**Duplicate Scripts:**

- Cache timestamp checking (4 versions)
- Database checking scripts (multiple similar)
- API testing scripts (shell and Python versions)

**Outdated E2E Tests:** 51 spec files with many temporary debugging tests

#### 2. Documentation Debt (Medium Priority)

**Temporary Documentation:**

- Bug-specific documentation in `/docs/bugs/`
- Multiple validation reports in root directory
- Temporary analysis files (changes-summary.md, technical-debt-report.md)

**Outdated Test Documentation:**

- E2E cleanup recommendations
- Coverage reports from different phases

#### 3. Code Structure Issues (Medium Priority)

**Test File Duplication:**

- `.spec.tsx` and `.test.tsx` files for same components
- No consistent naming convention

**Script Consolidation Needed:**

- Multiple versions of similar functionality
- Mix of JavaScript, TypeScript, and CommonJS files

## Refactoring Actions

### Phase 1: Dead Code Removal (Immediate)

#### Remove Empty Directories

```bash
rm -rf src/app/api-test/
rm -rf src/app/test/
```

#### Consolidate Scripts

1. **Cache Timestamp Scripts** - Keep only TypeScript version:
   - Keep: `check-cache-timestamps.ts`
   - Remove: `.js`, `.cjs`, `-simple` versions

2. **Database Scripts** - Create single utility:
   - Combine functionality into `database-utils.ts`
   - Remove individual scripts

3. **API Testing** - Keep Python version:
   - Keep: `test_apis.py`
   - Remove: `test-apis.sh`

#### Clean E2E Tests

Keep only essential tests:

- User story tests
- Feature-specific tests
- Active production validation

Remove debugging/temporary tests (34 files to remove).

### Phase 2: Documentation Cleanup

#### Archive Bug Documentation

```bash
mkdir -p docs/archive/bugs
mv docs/bugs/* docs/archive/bugs/
```

#### Consolidate Validation Reports

Create single `docs/validation/comprehensive-report.md` combining:

- validation-report.md
- compliance-report.md
- spec-validation-report.md

#### Remove Temporary Files

- changes-summary.md
- technical-debt-report.md
- Various checklist files

### Phase 3: Code Optimization

#### 1. Standardize Test Naming

Choose `.test.tsx` convention:

- Rename all `.spec.tsx` files
- Update test imports

#### 2. Implement Missing Features

**Leaderboard Rank Indicators:**

```typescript
// In LeaderboardView.tsx, add rank to main cards
<div className="text-sm text-muted-foreground">
  Rank #{player.rank}
</div>
```

**Mobile Chart Tap Support:**

```typescript
// In RatingChart.tsx, add touch event handling
onTouchStart = { handleTooltipShow };
onTouchEnd = { handleTooltipHide };
```

**Consistent Relative Timestamps:**
Create utility function for all timestamp displays.

#### 3. Performance Monitoring

Add performance tracking:

```typescript
// In providers.tsx
export function trackPageLoadTime() {
  const loadTime =
    performance.timing.loadEventEnd - performance.timing.navigationStart;
  if (loadTime > 2000) {
    console.warn(`Page load exceeded 2s target: ${loadTime}ms`);
  }
}
```

### Phase 4: Repository Size Reduction

#### Estimated Size Savings

- E2E test cleanup: ~2MB
- Script consolidation: ~500KB
- Documentation cleanup: ~1MB
- Screenshot cleanup: ~5MB
- **Total estimated reduction: ~8.5MB**

## Implementation Order

1. **Week 1: Dead Code Removal**
   - Remove empty directories
   - Clean E2E tests
   - Consolidate scripts

2. **Week 2: Documentation & Structure**
   - Archive old documentation
   - Standardize test naming
   - Create consolidated reports

3. **Week 3: Feature Completion**
   - Add missing UI elements
   - Implement performance monitoring
   - Optimize code structure

## Risk Mitigation

1. **Before removing files:**
   - Create backup branch
   - Verify no active imports
   - Check CI/CD dependencies

2. **Test coverage maintenance:**
   - Ensure no critical tests are removed
   - Run full test suite after each phase

3. **Documentation preservation:**
   - Archive rather than delete when uncertain
   - Maintain historical context where valuable

## Success Metrics

- Repository size reduced by >8MB
- Test execution time reduced by >30%
- Zero broken imports or missing dependencies
- All product requirements still met
- Improved developer experience with cleaner structure

## Next Steps

1. Review and approve this plan
2. Create feature branch for refactoring
3. Execute Phase 1 (highest impact)
4. Validate no regressions
5. Continue with subsequent phases

This refactoring will result in a cleaner, more maintainable codebase while preserving all functionality and improving alignment with product requirements.
