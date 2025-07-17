#!/bin/bash
# Test deployment script with Vercel protection bypass
# This script loads the bypass secret from .env and tests the deployed API

set -e

# Load environment variables
source .env

if [ -z "$VERCEL_PROTECTION_BYPASS" ]; then
    echo "❌ VERCEL_PROTECTION_BYPASS not found in .env file"
    exit 1
fi

# Default to testing localhost if no URL provided
DEPLOYMENT_URL=${1:-"http://localhost:8000"}

echo "🚀 Testing deployment at: $DEPLOYMENT_URL"
echo "🔑 Using bypass secret: ${VERCEL_PROTECTION_BYPASS:0:10}..."

echo ""
echo "1. Testing health endpoint:"
curl -H "x-vercel-protection-bypass: $VERCEL_PROTECTION_BYPASS" \
     "$DEPLOYMENT_URL/" | jq .

echo ""
echo "2. Testing configurations endpoint:"
curl -H "x-vercel-protection-bypass: $VERCEL_PROTECTION_BYPASS" \
     "$DEPLOYMENT_URL/configurations" | jq '.configurations[] | select(.is_official == true) | {name, config_hash}'

echo ""
echo "3. Testing Season 3 materialization:"
SEASON3_HASH="ad7252bdec25767b7eb12451ae30afbc1c7b5b1336c468ef833df7f632b34ba4"
curl -X POST \
     -H "x-vercel-protection-bypass: $VERCEL_PROTECTION_BYPASS" \
     -H "Content-Type: application/json" \
     -d "{\"config_hash\": \"$SEASON3_HASH\", \"force_refresh\": false}" \
     "$DEPLOYMENT_URL/" | jq .

echo ""
echo "✅ Deployment test complete!"