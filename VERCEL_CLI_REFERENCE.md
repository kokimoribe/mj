# Vercel CLI Non-Interactive Reference

## Key Commands for Non-Interactive Usage

### Listing Deployments
```bash
# List all deployments for current project (non-interactive)
vercel list --yes

# List deployments for specific project 
vercel list [project-name] --yes

# List with policy info (expiration dates)
vercel list --policy canceled=6m preview=6m production=6m --yes

# Filter by metadata
vercel list --meta key1=value1 --yes

# Short form
vercel ls --yes
```

### Global Non-Interactive Flags
- `--yes` - Skip interactive prompts, use defaults
- `--confirm` - Auto-confirm prompts  
- `--token=TOKEN` - Use specific auth token

### Environment Variables for Automation
```bash
export VERCEL_TOKEN="your_token_here"
export VERCEL_ORG_ID="your_org_id" 
export VERCEL_PROJECT_ID="your_project_id"
```

### Testing Deployments
```bash
# Get deployment URL from list command
DEPLOYMENT_URL=$(vercel ls --yes | grep "https://" | head -1 | awk '{print $NF}')

# Test with curl using protection bypass
curl -H "x-vercel-protection-bypass: $VERCEL_PROTECTION_BYPASS" "$DEPLOYMENT_URL/"
```

## Common Issues
- Without `--yes` flag, CLI will prompt for project selection
- Need proper auth token or logged in state for team projects
- Protection bypass required for testing protected deployments