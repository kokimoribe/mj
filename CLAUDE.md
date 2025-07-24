# Claude Assistant Development Guidelines

## Requirements-Driven Development Process

This project follows a **requirements-driven and test-driven development** approach to ensure clarity, quality, and alignment with user needs. This process is specifically designed to provide LLM coding agents with maximum context and clear guidance.

### Development Cycle Overview

1. **📝 Requirements Gathering** → Write detailed specifications in Markdown
2. **🧪 Test Writing** → Create tests that encode the specifications
3. **💻 Implementation** → Develop features to make tests pass
4. **✅ Verification** → Ensure all tests pass and requirements are met

### Phase 1: Requirements Gathering (Specification Documents)

Before writing any code, create comprehensive specification documents in `/docs/specs/`. Each specification should include:

1. **Feature Overview**: Clear description of what the feature does
2. **User Stories**: Specific scenarios from the user's perspective
3. **Success Criteria**: Measurable outcomes that define completion
4. **UI/UX Specifications**: Visual layouts, interactions, and behaviors
5. **Technical Requirements**: Data structures, API endpoints, performance targets
6. **Acceptance Criteria**: Specific checklist items that must be met

**Important**: The LLM coding agent should ask clarifying questions until the specification is crystal clear. The spec document becomes the "north star" for development.

### Phase 2: Test-Driven Development

Once specifications are approved, write tests BEFORE implementation:

1. **Choose Test Framework**:
   - E2E Tests: Playwright (`/apps/web/e2e/`)
   - Component Tests: React Testing Library (`*.test.tsx`)
   - User Story Tests: Playwright (`/apps/web/e2e/user-stories/`)

2. **Test Structure**:
   - Tests should directly map to user stories in the spec
   - Focus on functionality and user experience
   - Don't test implementation details (unless specified)
   - Performance/accessibility tests only if in requirements

3. **Test Verification**:
   - Run tests to ensure they fail appropriately
   - Tests should clearly encode the expected behavior
   - Review tests against specifications for completeness

### Phase 3: Implementation

With specs and tests in place, implement features:

1. **Follow Specifications**: The spec document is the source of truth
2. **Make Tests Pass**: Implement until all tests are green
3. **Iterative Development**: Run tests frequently during development
4. **Code Quality**: Follow existing patterns and conventions

### Phase 4: Verification

Before marking a feature complete:

1. **All Tests Pass**: No failing tests for the feature
2. **Build Verification**: Run `npm run verify:web`
3. **Specification Review**: Ensure all requirements are met
4. **User Acceptance**: Feature works as specified in real usage

## Specification Template

Use this template for feature specifications in `/docs/specs/`:

````markdown
# [Feature Name]

## Overview

Brief description of the feature and its purpose.

## User Stories

### As a [user type], I want to [action] so that [benefit]

- Acceptance criteria 1
- Acceptance criteria 2
- ...

## UI/UX Specifications

### Visual Design

- Layout description
- Component hierarchy
- Interaction patterns

### User Flow

1. Step 1
2. Step 2
3. ...

## Technical Requirements

### Data Model

```typescript
interface Example {
  // ...
}
```
````

### API Endpoints

- `GET /api/endpoint` - Description

### Performance Requirements

- Page load: < 2 seconds
- Interaction response: < 100ms

## Success Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] ...

## Test Scenarios

1. **Scenario Name**: Description
   - Given: Initial state
   - When: User action
   - Then: Expected outcome

````

## Build Verification

**IMPORTANT**: Before committing any changes, always run the build verification to catch ESLint errors and TypeScript issues:

```bash
# From the web app directory
cd apps/web && npm run verify

# Or from the root directory
npm run verify:web
````

This command will:

1. Run ESLint to check for code quality issues
2. Run TypeScript type checking
3. Run the Next.js build to ensure everything compiles

## Automated Pre-commit/Pre-push Hooks

The project has the following automated checks:

### Pre-commit (via husky + lint-staged)

- Runs ESLint on changed TypeScript/JavaScript files
- Runs TypeScript type checking
- Formats code with Prettier
- Checks Python code with ruff and mypy (for rating-engine)

### Pre-push

- Runs full build check for the web app to prevent deployment failures

## Common Build Issues

1. **Unused imports**: Remove any imported modules that aren't used in the file
2. **React Hooks errors**: Ensure hooks are called unconditionally at the top level of the component
3. **TypeScript 'any' warnings**: These are warnings only and won't block the build, but should be addressed when possible

## Development Workflow

### For New Features

1. **Write Specification**: Create detailed spec in `/docs/specs/`
2. **Review & Approve**: Get user feedback on the specification
3. **Write Tests**: Create tests that encode the specification
4. **Implement Feature**: Write code to make tests pass
5. **Verify**: Run tests and build verification
6. **Commit**: Follow git commit guidelines

### For Bug Fixes

1. **Reproduce Issue**: Write a failing test that demonstrates the bug
2. **Fix Bug**: Implement the fix
3. **Verify**: Ensure test passes and no regressions
4. **Commit**: Include test in the commit

## Key Commands Summary

```bash
# Development
npm run dev:web          # Start web dev server

# Testing
npm run test:e2e         # Run Playwright E2E tests
npm run test:stories     # Run user story tests only

# Build & Verification
npm run verify:web       # Lint, type-check, and build
npm run build           # Build all apps
```

## Working with Specifications

### Finding Existing Specs

- All specifications are in `/docs/specs/`
- Named by feature: `feature-name.md`
- Check spec status in the roadmap

### Creating New Specs

1. Use the template above
2. Be specific and measurable
3. Include visual examples where helpful
4. Get user approval before proceeding

### Updating Specs

- Specs are living documents
- Update when requirements change
- Keep test alignment when updating

if you are committing code, please do not do general `git add .` statements. Be explicit and deliberate on what changes you are going to be staging and committing.
