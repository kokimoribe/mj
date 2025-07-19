#!/bin/bash
# API Testing Script for Riichi Mahjong League
# Tests both local and production APIs

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default to localhost if no URL provided
API_URL=${1:-"http://localhost:8000"}
FRONTEND_URL=${2:-"http://localhost:3000"}

echo "🔍 Testing Riichi Mahjong League APIs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Backend API: $API_URL"
echo "Frontend: $FRONTEND_URL"
echo ""

# Track pass/fail
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test an endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_field=$3
    
    echo -n "Testing $name... "
    
    response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null)
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ]; then
        if [ -n "$expected_field" ]; then
            if echo "$body" | jq -e "$expected_field" > /dev/null 2>&1; then
                echo -e "${GREEN}✓ PASS${NC} (200 OK, field exists)"
                ((TESTS_PASSED++))
            else
                echo -e "${YELLOW}⚠ PARTIAL${NC} (200 OK, but missing expected field)"
                ((TESTS_FAILED++))
            fi
        else
            echo -e "${GREEN}✓ PASS${NC} (200 OK)"
            ((TESTS_PASSED++))
        fi
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
        if [ "$http_code" -ne 000 ]; then
            echo "  Error: $(echo "$body" | jq -r '.detail // .error // .message' 2>/dev/null || echo "$body")"
        fi
        ((TESTS_FAILED++))
    fi
}

# Test Python Backend APIs
echo "🐍 Python Backend API Tests"
echo "───────────────────────────"

test_endpoint "Health Check" "$API_URL/" ".status"
test_endpoint "Leaderboard" "$API_URL/leaderboard" ".players[0].name"
test_endpoint "Player Profile (joseph)" "$API_URL/players/joseph" ".name"
test_endpoint "Games History" "$API_URL/games" ".games[0].id"
test_endpoint "Season Stats" "$API_URL/stats/season" ".totalGames"
test_endpoint "Configurations" "$API_URL/configurations" ".configurations[0].name"

echo ""

# Test Frontend API Routes
echo "🌐 Frontend API Routes"
echo "─────────────────────"

test_endpoint "Frontend Leaderboard" "$FRONTEND_URL/api/leaderboard" ".players[0].name"
test_endpoint "Frontend Games" "$FRONTEND_URL/api/games" "."

echo ""

# Test Frontend Pages (just check they return 200)
echo "📄 Frontend Pages"
echo "─────────────────"

test_endpoint "Home Page" "$FRONTEND_URL/" ""
test_endpoint "Player Profile Page" "$FRONTEND_URL/player/joseph" ""
test_endpoint "Games Page" "$FRONTEND_URL/games" ""
test_endpoint "Stats Page" "$FRONTEND_URL/stats" ""

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Summary"
echo "───────────────"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed${NC}"
    exit 1
fi