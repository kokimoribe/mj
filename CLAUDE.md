# Claude Assistant Development Guidelines

## Build Verification

**IMPORTANT**: Before committing any changes, always run the build verification to catch ESLint errors and TypeScript issues:

```bash
# From the web app directory
cd apps/web && npm run verify

# Or from the root directory
npm run verify:web
```

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

1. Make changes to the code
2. Run `npm run verify:web` to check for issues locally
3. Fix any errors before committing
4. Commit your changes - pre-commit hooks will run automatically
5. Push your changes - pre-push hooks will verify the build

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