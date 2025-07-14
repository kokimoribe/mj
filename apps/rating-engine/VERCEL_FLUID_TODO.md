# Vercel Fluid Deployment Guide for Python Rating Engine

🎯 **Status**: **READY FOR DEPLOYMENT** ✅

## 🚀 Deployment Setup

### 1. Project Structure

The rating engine is now configured for Vercel Fluid deployment with:

- `api/index.py` - Vercel serverless function entry point
- `vercel.json` - Vercel deployment configuration
- `requirements.txt` - Python dependencies for Vercel
- `pyproject.toml` - Local development dependencies (uv)

### 2. Deployment Commands

```bash
# From the rating-engine directory
cd apps/rating-engine

# Deploy to Vercel (first time setup)
vercel --prod

# Or deploy with explicit project linking
vercel link  # Link to existing Vercel project
vercel --prod
```

### 3. Environment Variables

Configure in Vercel Dashboard:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your-secret-key
```

### 4. Monorepo Configuration

Since this is a monorepo, you have two deployment options:

#### Option A: Separate Vercel Projects (Recommended)

- Web app: One Vercel project (already deployed)
- Rating engine: Separate Vercel project for Python API
- Benefits: Independent deployments, easier management

#### Option B: Related Projects

- Use Vercel's "Related Projects" feature
- Configure in web app's `vercel.json`:

```json
{
  "buildCommand": "turbo build --filter=web",
  "framework": "nextjs",
  "relatedProjects": ["prj_rating_engine_id"]
}
```

## 🔧 API Endpoints

Once deployed, the rating engine will be available at:

- `https://your-rating-engine.vercel.app/` - Health check
- `https://your-rating-engine.vercel.app/health` - Detailed health check
- `https://your-rating-engine.vercel.app/materialize` - Rating materialization
- `https://your-rating-engine.vercel.app/configurations` - List configurations

## 🌐 Integration with Web App

### Webhook Configuration

After deployment, configure Supabase webhooks to trigger rating updates:

1. In Supabase Dashboard → Database → Webhooks
2. Create webhook for `games` table INSERT/UPDATE
3. Point to: `https://your-rating-engine.vercel.app/materialize`
4. Payload:

```json
{
  "config_hash": "season_4_default",
  "force_refresh": false
}
```

### Frontend Integration

The web app can call the rating API:

```typescript
// In web app (apps/web)
const ratingEngineUrl = process.env.NEXT_PUBLIC_RATING_ENGINE_URL;

const response = await fetch(`${ratingEngineUrl}/materialize`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    config_hash: "season_4_default",
    force_refresh: false,
  }),
});
```

## ✅ Deployment Checklist

- [x] FastAPI app configured for Vercel
- [x] Entry point created (`api/index.py`)
- [x] Vercel configuration (`vercel.json`)
- [x] Dependencies specified (`requirements.txt`)
- [x] All tests passing (37/37)
- [ ] Deploy to Vercel
- [ ] Configure environment variables
- [ ] Set up Supabase webhooks
- [ ] Test API endpoints
- [ ] Update web app to use deployed API

## 🎯 Next Steps

1. **Deploy the rating engine**: `vercel --prod` from `apps/rating-engine`
2. **Configure environment variables** in Vercel Dashboard
3. **Test the deployed endpoints** using curl or Postman
4. **Set up webhooks** from Supabase to auto-trigger rating updates
5. **Update web app** to use the deployed rating engine URL
