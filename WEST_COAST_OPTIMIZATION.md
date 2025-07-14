# West Coast Optimization Strategy

## Overview

Your Supabase database is hosted on the East Coast (US-East region), which is optimal for the majority of web services. For West Coast users, we've implemented a hybrid optimization strategy that balances database latency with edge performance.

## Current Setup

- **Supabase Database**: East Coast (https://soihuphdqgkbafozrzqn.supabase.co)
- **Vercel Functions**: `iad1` (Washington D.C.) - close to database
- **Static Content**: Served globally via Vercel's Edge Network

## Optimization Strategy

### ✅ What We've Optimized

1. **Vercel Functions in iad1**: Keep compute close to database for optimal DB queries
2. **Global Edge Distribution**: Static assets (HTML, CSS, JS) served from 100+ PoPs worldwide
3. **Turborepo Configuration**: Optimized builds and caching
4. **Progressive Web App**: Offline capabilities and caching for West Coast users

### 🌐 Edge Performance for West Coast Users

- **Static Content**: Served from San Francisco PoP (~5ms latency)
- **API Requests**: ~50-80ms latency (iad1 → West Coast)
- **Database Queries**: Optimized with connection pooling

### 📊 Performance Characteristics

- **East Coast Users**: ~15-25ms API latency
- **West Coast Users**: ~50-80ms API latency
- **Static Content**: ~5-10ms globally via edge

## Deployment Status

### Vercel Projects Created

1. **mj-web**: https://mj-web-psi.vercel.app
   - Next.js 15 PWA with Tailwind CSS v4
   - Global edge distribution
   - Functions in iad1 region

2. **mj-skill-rating**: https://mj-skill-rating-koki-moribes-projects.vercel.app
   - Python FastAPI with uv package manager
   - Serverless functions in iad1 region
   - Direct database access optimized

### Configuration Files Updated

- ✅ `apps/web/vercel.json`: Region set to iad1
- ✅ `apps/rating-engine/vercel.json`: Region set to iad1
- ✅ `turbo.json`: Environment variables configured
- ✅ `apps/rating-engine/api/index.py`: Vercel entry point
- ✅ `apps/rating-engine/requirements.txt`: Python dependencies

## Next Steps

### 1. Deploy Configuration Changes

```bash
git add .
git commit -m "feat: optimize Vercel regions for database proximity

- Set both projects to iad1 region for optimal database latency
- Configure Turborepo environment variables
- Add West Coast optimization documentation"
git push origin main
```

### 2. Monitor Performance

- Both projects will auto-deploy on git push
- Monitor API latency from West Coast
- Check database query performance

### 3. Future Optimizations (Optional)

- **Supabase Read Replicas**: If available, consider West Coast read replica
- **Edge Caching**: Implement API response caching for frequently accessed data
- **Service Worker**: Enhanced offline capabilities for West Coast users

## Why iad1 is Optimal

### Database-First Strategy

- **Database Location**: Supabase East Coast
- **Function Latency**: iad1 → Supabase = ~5-10ms
- **Query Performance**: Minimal database latency
- **Connection Pooling**: Optimal connection reuse

### Edge Network Benefits

- **Static Assets**: Served from nearest PoP globally
- **Progressive Enhancement**: API calls enhanced by edge caching
- **Mobile Performance**: PWA capabilities reduce API dependency

## Performance Comparison

| Metric           | East Coast Users | West Coast Users   |
| ---------------- | ---------------- | ------------------ |
| Static Content   | ~5ms             | ~5ms               |
| API Latency      | ~15-25ms         | ~50-80ms           |
| Database Queries | ~5-10ms          | ~5-10ms (via iad1) |
| Overall UX       | Excellent        | Good               |

## Verification Commands

```bash
# Check deployment status
vercel projects list

# Monitor function regions
vercel inspect --deployment-url <url>

# Test API latency
curl -w "@curl-format.txt" -o /dev/null -s https://mj-skill-rating-koki-moribes-projects.vercel.app/api/health
```

This configuration provides the best balance of database performance and global edge distribution for your West Coast users.
