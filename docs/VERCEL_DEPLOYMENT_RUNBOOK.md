# Vercel Deployment Runbook

**Target Audience**: LLM coding agents and developers working with this monorepo

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

- **API Structure**: ✅ Single FastAPI function at `api/index.py` (consolidated from 4 separate functions)
- **Shared Modules**: ✅ `lib/` directory with materialization logic working
- **Python Imports**: ✅ Verified working in Vercel serverless functions
- **Git Deployment**: ✅ Automatic deployment on `git push` configured
- **Protection**: ⚠️ Vercel auth protection enabled (returns 401 for public access)

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
- `POST /` - Materialization endpoint
- `GET /configurations` - List configurations

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

1. **"TypeError: issubclass() arg 1 must be a class"**
   - **Cause**: Wrong ASGI handler export
   - **Fix**: Ensure `app = FastAPI()` variable exists (not `handler`)

2. **Import Errors in Vercel Functions**
   - **Cause**: Missing `__init__.py` files
   - **Fix**: Add `__init__.py` to all Python packages
   - **Status**: ✅ Fixed in `/lib/__init__.py`

3. **Multiple Functions Created**
   - **Cause**: Multiple Python files in `api/` directory
   - **Fix**: Consolidate to single `api/index.py`
   - **Status**: ✅ Fixed - reduced from 4 to 1 function

4. **Environment Variables Not Available**
   - **Symptom**: Warning about missing env vars in Turborepo build
   - **Fix**: Add to `turbo.json` env configuration
   - **Impact**: Non-blocking warning, functions still deploy

### Debug Commands

```bash
# Check recent deployments
npx vercel list

# Get deployment logs
npx vercel logs [deployment-url]

# Test local development
uv run fastapi dev api/index.py

# Verify Python imports work locally
python -c "from lib.materialization import MaterializationEngine; print('Import OK')"
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

### Vercel Protection ⚠️
- Currently enabled (returns 401 Authentication Required)
- Can be bypassed with protection headers (if configured)
- Not an application error - intentional security layer

### Production Access
- Authentication screen is Vercel's security feature
- Functions are running correctly behind auth layer
- Consider disabling protection for public APIs if needed

## 🎓 Key Learnings for LLM Agents

### What Works ✅
1. **Single FastAPI Function**: Much simpler than multiple functions
2. **Shared `lib/` Directory**: Python imports work perfectly in Vercel
3. **Git Deployment**: Automatic, reliable, better than CLI
4. **ASGI Export**: `app = FastAPI()` variable is key requirement

### What to Avoid ❌
1. **Multiple API Files**: Creates unnecessary function complexity
2. **Manual CLI Deployment**: Git-based is more reliable
3. **Complex Handler Classes**: FastAPI ASGI app is sufficient
4. **Missing `__init__.py`**: Breaks Python package imports

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

---

**Last Updated**: July 2025  
**Status**: Fully operational with Vercel auth protection
