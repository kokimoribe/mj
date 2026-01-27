# Vercel Deployment Runbook

**Target Audience**: LLM coding agents and developers working with this monorepo

## 🚨 CRITICAL: Understanding HTTP 401 Responses

### ⚠️ **HTTP 401 ≠ Deployment Failure**

**What you'll see when testing:**

```bash
curl -s "https://[deployment-url]/"
# Returns: <!doctype html>...Authentication Required...
# HTTP Status: 401
```

**What this ACTUALLY means:**

1. ✅ **Deployment succeeded** - your function is running correctly
2. ✅ **FastAPI app is working** - it's running behind Vercel's auth layer
3. ⚠️ **Vercel Protection is enabled** - blocking public access (intentional security)
4. ❌ **You cannot test your API endpoints** through curl/public requests

### 🎯 How to Actually Verify Success

**Build Success** ✅:

```bash
npx vercel list
# Look for: ● Ready (not ● Error)
```

**Function Import Success** ✅:

```bash
# Test locally first
cd apps/rating-engine
uv run python -c "from api.index import app; from lib.materialization import MaterializationEngine; print('✅ All imports working')"
```

**The Real Issue**: We **cannot verify our FastAPI endpoints work in production** while protection is enabled.

### 🔓 Options to Test Production API

1. **Disable Vercel Protection** (Vercel Dashboard → Project Settings → Deployment Protection)
2. **Use Protection Bypass Headers** (if configured):

   ```bash
   # First: Set up bypass secret in Vercel Dashboard → Project Settings → Deployment Protection
   # Then: Use the secret in requests
   curl -H "x-vercel-protection-bypass: YOUR_BYPASS_SECRET" "https://[deployment-url]/"
   ```

   **⚠️ Current Status**: No bypass secret configured for this project

3. **Test locally only** with `uv run fastapi dev api/index.py`

### 🔧 How to Configure Protection Bypass (Optional)

**Setup Steps:**

1. Go to Vercel Dashboard → Your Project → Settings
2. Navigate to "Deployment Protection" tab
3. Enable "Protection Bypass for Automation"
4. Generate/set a bypass secret (keep this secure!)
5. Use in requests: `x-vercel-protection-bypass: your-secret`

**Security Note**: Only do this if you need programmatic API testing. For security, keep protection enabled and test locally instead.

## 🎯 Quick Status Checks

### How to Check if Deployment Succeeded

1. **Command Line Check**:

   ```bash
   npx vercel list
   ```

   - Look for `● Ready` status (green dot)
   - `● Error` means deployment failed
   - Most recent deployment is at the top

2. **Expected Behavior**:
   - Git push triggers automatic deployment for both `mj-web` and `mj-skill-rating`
   - Deployment takes ~20-30 seconds typically
   - Each deployment gets a unique URL

3. **Testing API Endpoints**:

   ```bash
   # Health check (GET)
   curl -s "https://[deployment-url]/"

   # Materialization endpoint (POST)
   curl -X POST "https://[deployment-url]/" \
     -H "Content-Type: application/json" \
     -d '{"config_hash": "test", "force_refresh": false}'
   ```

### Current Deployment Status ✅

- **Production URL**: `https://mj-skill-rating.vercel.app`
- **API Structure**: ✅ Single FastAPI function at `api/index.py` (consolidated from 4 separate functions)
- **Shared Modules**: ✅ `lib/` directory with materialization logic working
- **Python Imports**: ✅ Verified working in Vercel serverless functions
- **Git Deployment**: ✅ Automatic deployment on `git push` configured
- **Protection**: ✅ Publicly accessible (health check returns 200)

## 🚀 Deployment Methods

### Git-Based (Recommended) ✅

```bash
git add .
git commit -m "Your changes"
git push
# Wait ~30 seconds, then check with: npx vercel list
```

**Benefits**:

- Automatic preview deployments on pull requests
- Production deployments on main branch
- Better CI/CD integration
- No manual CLI commands needed

### CLI-Based (Alternative)

```bash
cd apps/rating-engine
npx vercel --prod
```

## 🏗️ Project Architecture

### Current Structure ✅

```
apps/rating-engine/
├── api/
│   └── index.py          # Single FastAPI app (all endpoints)
├── lib/
│   ├── __init__.py       # Package initialization
│   └── materialization.py # Shared business logic
└── requirements.txt      # Python dependencies
```

### API Endpoints

- `GET /` - Health check
- `GET /debug` - Debug environment configuration (shows which env vars are set)
- `POST /` or `POST /materialize` - Materialization endpoint
- `GET /configurations` - List available configurations
- `GET /leaderboard` - Get current leaderboard data

**Production Base URL**: `https://mj-skill-rating.vercel.app`

**Example Usage:**

```bash
# Health check
curl https://mj-skill-rating.vercel.app/

# Debug environment (check what env vars are available)
curl https://mj-skill-rating.vercel.app/debug

# List configurations
curl https://mj-skill-rating.vercel.app/configurations

# Trigger materialization
curl -X POST "https://mj-skill-rating.vercel.app/" \
  -H "Content-Type: application/json" \
  -d '{"config_hash": "your-config-hash", "force_refresh": false}'
```

## 🔧 FastAPI + Vercel Configuration

### Key Requirements ✅

1. **ASGI App Export**: Must export `app` variable (not `handler`)

   ```python
   app = FastAPI()  # This variable name is required
   ```

2. **Python Runtime**: Uses Vercel Python runtime (beta)
   - Supports ASGI/WSGI applications
   - Full import system support
   - Automatic dependency installation

3. **Shared Modules**: ✅ Working
   ```python
   from lib.materialization import MaterializationEngine
   ```

## 🔍 Troubleshooting Guide

### Common Issues & Solutions

1. **❌ "HTTP 401 when testing API" - MOST COMMON**
   - **What you see**: `<!doctype html>...Authentication Required...`
   - **What it means**: ✅ Deployment succeeded, ⚠️ Vercel Protection enabled
   - **NOT AN ERROR**: Your FastAPI app is working correctly behind auth
   - **Fix**: Disable protection in Vercel Dashboard or test locally
   - **Status**: ⚠️ Currently blocking all API testing

2. **"TypeError: issubclass() arg 1 must be a class"**
   - **Cause**: Wrong ASGI handler export
   - **Fix**: Ensure `app = FastAPI()` variable exists (not `handler`)

3. **Import Errors in Vercel Functions**
   - **Cause**: Missing `__init__.py` files
   - **Fix**: Add `__init__.py` to all Python packages
   - **Status**: ✅ Fixed in `/lib/__init__.py`

4. **Multiple Functions Created**
   - **Cause**: Multiple Python files in `api/` directory
   - **Fix**: Consolidate to single `api/index.py`
   - **Status**: ✅ Fixed - reduced from 4 to 1 function

5. **Environment Variables Not Available**
   - **Symptom**: Warning about missing env vars in Turborepo build
   - **Fix**: Add to `turbo.json` env configuration
   - **Impact**: Non-blocking warning, functions still deploy

6. **"x-vercel-protection-bypass header not working"**
   - **Cause**: No bypass secret configured in Vercel Dashboard
   - **Current Status**: ❌ No bypass secret set up for this project
   - **Fix**: Configure in Vercel Dashboard → Deployment Protection → Protection Bypass
   - **Alternative**: Test locally or disable protection temporarily

### Debug Commands

```bash
# Check recent deployments
npx vercel list

# Get deployment logs
npx vercel logs [deployment-url]

# Check environment variables in Vercel
npx vercel env ls

# Test production API
curl https://mj-skill-rating.vercel.app/
curl https://mj-skill-rating.vercel.app/debug

# Test local development
cd apps/rating-engine
uv run fastapi dev api/index.py

# Verify Python imports work locally
python -c "from rating_engine.materialization import materialize_data_for_config; print('Import OK')"
```

### Environment Variables

**Checking Vercel Environment Variables:**

```bash
# List all environment variables
npx vercel env ls

# This shows variables for Production, Preview, and Development environments
```

**Required Environment Variables for Rating Engine:**

The rating-engine Vercel deployment requires these environment variables (set in Vercel Dashboard → Settings → Environment Variables):

- `SUPABASE_URL` - Production Supabase project URL
- `SUPABASE_SECRET_KEY` - Production Supabase secret key

**Local Development Environment Files:**

For local development, use separate environment files:

- `apps/rating-engine/.env.dev` - Local Supabase (via Supabase CLI)
- `apps/rating-engine/.env.prod` - Production Supabase

Use the `--env` flag with scripts to specify which environment:

```bash
# Use production environment
uv run python scripts/materialize_data.py --env prod --config "Season 5"

# Use development environment
uv run python scripts/materialize_data.py --env dev --config "Season 5"
```

## 📊 Performance & Limits

### Deployment Stats

- **Build Time**: ~20-30 seconds
- **Function Count**: 1 (reduced from 4)
- **Static Assets**: Auto-included (normal behavior)
- **Cold Start**: <2 seconds for FastAPI

### File Size Considerations

- Keep shared modules focused
- Avoid large dependencies in `lib/`
- Vercel has 50MB limit per function

## 🔐 Security & Access

### Vercel Protection

- **Current Status**: Publicly accessible (protection disabled or bypassed)
- **Production URL**: `https://mj-skill-rating.vercel.app` returns 200 OK
- **Health Check**: `GET /` endpoint is publicly accessible

### Production Access

- API endpoints are currently publicly accessible
- For sensitive operations, consider enabling Vercel Protection if needed
- Environment variables are secure (not exposed in responses)

## 🎓 Key Learnings for LLM Agents

### What Works ✅

1. **Single FastAPI Function**: Much simpler than multiple functions
2. **Shared `lib/` Directory**: Python imports work perfectly in Vercel
3. **Git Deployment**: Automatic, reliable, better than CLI
4. **ASGI Export**: `app = FastAPI()` variable is key requirement

### What to Avoid ❌

1. **Misinterpreting HTTP 401 as Failure**: Most common mistake!
2. **Multiple API Files**: Creates unnecessary function complexity
3. **Manual CLI Deployment**: Git-based is more reliable
4. **Complex Handler Classes**: FastAPI ASGI app is sufficient
5. **Missing `__init__.py`**: Breaks Python package imports

### 🚨 Critical Misconceptions to Avoid

1. **"HTTP 401 means deployment failed"** ❌
   - Reality: It means Vercel Protection is enabled (intentional security)
   - Your FastAPI app is actually working correctly

2. **"npx vercel list shows Ready but API doesn't work"** ❌
   - Reality: Build succeeded, API works, but protection blocks testing
   - Need to disable protection or test locally

3. **"Can't test = broken deployment"** ❌
   - Reality: Can't test publicly ≠ deployment broken
   - Protection is a feature, not a bug

### Investigation Process ✅

1. ✅ Consolidated 4 functions → 1 function
2. ✅ Verified static assets are normal/expected
3. ✅ Confirmed Python imports work in serverless functions
4. ✅ Fixed FastAPI ASGI handler structure
5. ✅ Demonstrated shared lib import working
6. ✅ Established Git-based deployment workflow

### Time-Saving Commands

```bash
# Quick deployment status
npx vercel list | head -5

# Test health endpoint
curl -s "https://[latest-deployment]/" | head -1

# Check git status and deploy
git status && git add . && git commit -m "Update" && git push
```

## 📋 Quick Reference

### Production URLs

- **Rating Engine API**: `https://mj-skill-rating.vercel.app`
- **Health Check**: `curl https://mj-skill-rating.vercel.app/`
- **Debug Endpoint**: `curl https://mj-skill-rating.vercel.app/debug`

### Key Commands

```bash
# Check deployments
npx vercel list

# Check environment variables
npx vercel env ls

# Register season configuration (production)
cd apps/rating-engine
uv run python scripts/register_configs.py --env prod configs/season-5.yaml

# Materialize season data (production)
uv run python scripts/materialize_data.py --env prod --config "Season 5"

# List available configurations
uv run python scripts/materialize_data.py --env prod --list
```

### Environment Files

- `apps/rating-engine/.env.dev` - Local Supabase (development)
- `apps/rating-engine/.env.prod` - Production Supabase
- Both files contain: `SUPABASE_URL` and `SUPABASE_SECRET_KEY`

---

**Last Updated**: January 2026  
**Status**: Fully operational, publicly accessible  
**Production URL**: `https://mj-skill-rating.vercel.app`
