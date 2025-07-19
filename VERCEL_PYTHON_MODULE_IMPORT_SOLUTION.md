# Vercel Python Module Import Solution

## 🔍 Root Cause Analysis

**Error**: `ModuleNotFoundError: No module named 'rating_engine'`

**Why it happens**: 
- Vercel Python serverless functions can't find modules in `src/` directory
- The current import: `from rating_engine.materialization import materialize_data_for_config`
- But module is located at: `src/rating_engine/materialization.py`
- Vercel bundles only the `api/` directory + root-level modules

## 📂 Current Structure (BROKEN)
```
apps/rating-engine/
├── api/
│   └── index.py                    # Tries to import 'rating_engine'
├── src/
│   └── rating_engine/             # ❌ Not found by Vercel
│       ├── __init__.py
│       └── materialization.py
└── vercel.json
```

## 📂 Required Structure (WORKING)
```
apps/rating-engine/
├── api/
│   └── index.py                    # Imports from 'rating_engine'
├── rating_engine/                  # ✅ Root level - found by Vercel  
│   ├── __init__.py
│   └── materialization.py
└── vercel.json
```

## 🛠️ Solutions (3 Approaches)

### Solution 1: Move Module to Root (Recommended)
Move `src/rating_engine/` to root level: `rating_engine/`

**Pros**: 
- Simple, matches Vercel expectations
- No import changes needed
- Follows common patterns

**Cons**: 
- Changes project structure

### Solution 2: Update Import Path  
Change import to use relative/absolute path from api/

**Pros**: 
- Keeps current structure

**Cons**: 
- Complex path resolution
- May still fail in serverless environment

### Solution 3: Add to PYTHONPATH
Configure environment to include src/ in Python path

**Pros**: 
- Keeps current structure

**Cons**: 
- Complex configuration
- Environment-dependent

## 🧪 Testing Strategy

1. **Local Test with vercel dev**:
   ```bash
   cd apps/rating-engine
   vercel dev
   # Test: curl http://localhost:3000
   ```

2. **Verify imports work locally before deploying**

3. **Deploy only after local verification**

## 📋 Implementation Plan

1. Move `src/rating_engine/` → `rating_engine/`
2. Verify `__init__.py` files exist
3. Test with `vercel dev`
4. Deploy if local test passes
5. Test production endpoint

## 🔗 References
- [Vercel Discussion #4717](https://github.com/vercel/vercel/discussions/4717)
- [SO: Python Serverless Local Module Not Found](https://stackoverflow.com/questions/63847295/serverless-python-local-module-not-found)
- [SO: ModuleNotFoundError Vercel Python](https://stackoverflow.com/questions/75716081/modulenotfounderror-no-module-named-data-vercel-python)

## ⚠️ Key Learnings
- Vercel bundles root-level directories + api/ folder
- src/ directories are often ignored in serverless packaging
- Always test with `vercel dev` before deploying
- Module structure that works locally may fail in serverless environment