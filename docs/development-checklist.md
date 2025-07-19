# Development Checklist

## Before Committing

Always run these commands locally before committing:

```bash
# From root directory
npm run verify:web
```

This will:
- ✅ Run ESLint to catch linting errors
- ✅ Run TypeScript type checking
- ✅ Run a production build to catch build errors

## Before Deploying

1. **Run full verification**:
   ```bash
   npm run pre-deploy
   ```

2. **Check environment variables**:
   - Ensure all env vars used in code are listed in `turbo.json`
   - Verify `.env.local` has all required variables

3. **Test locally with production build**:
   ```bash
   cd apps/web
   npm run build
   npm run start
   ```

## Common Issues to Avoid

### 1. Unused Imports/Variables
- ESLint will catch these
- Run `npm run lint:fix` to auto-fix

### 2. TypeScript Errors
- Next.js 15 requires async params for dynamic routes
- Always run `npm run type-check`

### 3. Console Statements
- Only `console.warn` and `console.error` are allowed
- Remove all `console.log` statements

### 4. Environment Variables
- Add all new env vars to:
  - `.env.local` (for local dev)
  - `turbo.json` (for build process)
  - Vercel dashboard (for deployment)

## Automated Checks

### GitHub Actions CI
- Runs on every push and PR
- Catches errors before merge

### Pre-commit Hooks (Optional)
To enable pre-commit hooks:
```bash
npm install --save-dev husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

## Quick Commands

```bash
# Fix all auto-fixable issues
npm run lint:fix

# Run all checks at once
npm run verify

# Check just the web app
npm run verify:web
```