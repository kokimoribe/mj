# Environment Variables Reference

_Quick reference for Supabase credentials and their uses_

## 🔑 Credential Types

### 🆕 SUPABASE_PUBLISHABLE_KEY (Required)

**What it is**: New-generation API key for client-side access  
**Example**: `sb_publishable_68r4JVAt-_ZMMausI3M7QQ_Tqrmu9mV`  
**Used by**: Frontend applications, public API access (replaces ANON_KEY)  
**Permissions**: ❌ Respects Row Level Security (RLS), limited to authenticated user's data  
**Security**: ✅ Safe to expose in frontend code  
**Status**: ⭐ **ACTIVE** - Required since legacy keys disabled

### 🆕 SUPABASE_SECRET_KEY (Required)

**What it is**: New-generation secret key for server-side operations  
**Example**: `sb_secret_...` (starts with `sb_secret_`)  
**Used by**: Backend services, admin operations, materialization engine  
**Permissions**: ⚠️ Full database access, bypasses RLS  
**Security**: ❌ NEVER expose in frontend - server-side only!  
**Status**: ⭐ **REQUIRED** - Legacy SERVICE_ROLE_KEY disabled

---

### ⚠️ Legacy Keys (Disabled as of July 14, 2025)

### SUPABASE_URL

**What it is**: Base URL for your Supabase project  
**Example**: `https://soihuphdqgkbafozrzqn.supabase.co`  
**Used by**: All Supabase operations (Python client, JavaScript client, psql connections)  
**Security**: ✅ Safe to expose in frontend code

### SUPABASE_ANON_KEY (⚠️ DISABLED)

**What it is**: Anonymous/public access key with limited permissions  
**Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (starts with `eyJ`)  
**Status**: ❌ **DISABLED** on July 14, 2025 - Use PUBLISHABLE_KEY instead  
**Migration**: Replace with `SUPABASE_PUBLISHABLE_KEY`

### SUPABASE_SERVICE_ROLE_KEY (⚠️ DISABLED)

**What it is**: Server-side key with full database permissions  
**Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (starts with `eyJ`)  
**Status**: ❌ **DISABLED** on July 14, 2025 - Use SECRET_KEY instead  
**Migration**: Replace with `SUPABASE_SECRET_KEY`

**Note**: Legacy keys can be re-enabled in Supabase dashboard if needed, but new keys are recommended.

### POSTGRES_URL_NON_POOLING

**What it is**: Direct PostgreSQL connection string  
**Example**: `postgres://postgres.xxx:password@aws-0-us-west-1.pooler.supabase.com:5432/postgres`  
**Used by**: psql connections, database administration, migrations  
**Permissions**: ⚠️ Full database access  
**Security**: ❌ Server-side only

### POSTGRES_URL (Pooled)

**What it is**: Connection-pooled PostgreSQL string for high-concurrency  
**Example**: `postgres://postgres.xxx:password@aws-0-us-west-1.pooler.supabase.com:6543/postgres`  
**Used by**: Production applications with many concurrent connections  
**Permissions**: ⚠️ Full database access  
**Security**: ❌ Server-side only

## 🎯 When to Use What

### Frontend (Next.js, React)

```typescript
// ✅ REQUIRED: Legacy keys disabled, use publishable keys
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

// ❌ DISABLED: Will fail with "Legacy API keys are disabled"
// const supabaseLegacy = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );
```

### Backend (API Routes, Server Actions)

```typescript
// ✅ REQUIRED: Legacy keys disabled, use secret keys
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// ❌ DISABLED: Will fail with "Legacy API keys are disabled"
// const supabaseAdminLegacy = createClient(
//   process.env.SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );
```

### Python Scripts (Rating Engine)

```python
# ✅ REQUIRED: Legacy keys disabled, use new secret keys
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SECRET_KEY")
)

# ❌ DISABLED: Will fail with "Legacy API keys are disabled"
# supabase_legacy = create_client(
#     os.getenv("SUPABASE_URL"),
#     os.getenv("SUPABASE_SERVICE_ROLE_KEY")
# )
```

### Database Administration (psql)

```bash
# ✅ Use for direct database access, migrations, analysis
psql $POSTGRES_URL_NON_POOLING
```

## ⚠️ Security Guidelines

### DO ✅

- **Prefer new API keys**: Use `SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY` for new code
- Use `SUPABASE_PUBLISHABLE_KEY` for frontend code (replaces ANON_KEY)
- Use `SUPABASE_SECRET_KEY` for backend admin operations (replaces SERVICE_ROLE_KEY)
- Keep secret keys in `.env` files (not committed to git)
- Use environment variables for all credentials

### DON'T ❌

- Never put `SUPABASE_SECRET_KEY` in frontend code
- Don't commit `.env` files to version control
- Don't hardcode credentials in source code
- Don't use secret keys for user-facing operations
- **Don't attempt to use legacy keys - they're permanently disabled**

## 🔧 Environment Setup Examples

### Development (.env file)

```bash
# ✅ REQUIRED KEYS (legacy keys disabled)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...

# Frontend access (can be in NEXT_PUBLIC_* for client-side)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Backend access (server-side only)
SUPABASE_URL=https://your-project.supabase.co

# Database administration
POSTGRES_URL_NON_POOLING=postgres://postgres.your-ref:password@...
```

### Production (Vercel Environment Variables)

```bash
# ✅ REQUIRED KEYS (legacy keys disabled)
vercel env add SUPABASE_PUBLISHABLE_KEY
vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  
vercel env add SUPABASE_SECRET_KEY

# Set in Vercel dashboard or via CLI:
vercel env add SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
```

## 🎯 Current API Key Status

### ✅ Migration Complete

**Legacy Keys**: Permanently disabled on July 14, 2025  
**Current Keys**: New API key system fully operational  
**System Status**: All components using new keys

### Key Testing

```bash
# ✅ Test new publishable key (should return player data)
curl -H "apikey: $SUPABASE_PUBLISHABLE_KEY" \
     "$SUPABASE_URL/rest/v1/players?select=display_name&limit=1"

# Expected: [{"display_name":"Hyun"}]
```

**Legacy Key Response** (for reference):
```json
{
  "message": "Legacy API keys are disabled",
  "hint": "Your legacy API keys (anon, service_role) were disabled on 2025-07-14T06:19:17.328874+00:00. Re-enable them in the Supabase dashboard, or use the new publishable and secret API keys."
}
```

---

## 🐛 Troubleshooting

### "Authentication failed" errors

- ✅ Check that you're using the correct key type for your context
- ✅ For new implementations, prefer `PUBLISHABLE_KEY` over `ANON_KEY`
- ✅ Verify the key hasn't expired (JWT tokens have expiration dates, new API keys don't)
- ✅ Ensure environment variables are loaded (`console.log(process.env.SUPABASE_URL)`)

### "Row Level Security" permission denied

- ✅ You're probably using `PUBLISHABLE_KEY` when you need `SECRET_KEY`
- ✅ Check RLS policies on the tables you're trying to access
- ✅ Use secret key for admin operations

### "Connection refused" errors

- ✅ Check that `SUPABASE_URL` is correct and accessible
- ✅ Verify your Supabase project is active and not paused
- ✅ Test connection with curl: `curl https://your-project.supabase.co/rest/v1/`

## 📋 Quick Reference Commands

```bash
# Test Supabase connection (new API key) - Use apikey header
curl -H "apikey: $SUPABASE_PUBLISHABLE_KEY" \
     "$SUPABASE_URL/rest/v1/players?select=display_name&limit=5"

# Test database connection
psql $POSTGRES_URL_NON_POOLING -c "SELECT NOW();"

# Check environment variables are loaded
echo $SUPABASE_URL
echo ${SUPABASE_SECRET_KEY:0:20}...  # Show first 20 chars only
```

---

_Part of the [Operational Guide](./08-operational-guide.md) | Last updated: July 14, 2025_
