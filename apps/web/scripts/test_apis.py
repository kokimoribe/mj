#!/usr/bin/env python3
"""Test script for Riichi Mahjong League APIs"""

import requests
import json
import sys

def test_apis(base_url="https://mj-skill-rating.vercel.app"):
    """Test all API endpoints"""
    
    tests = [
        ("Health Check", "/", ".status"),
        ("Leaderboard", "/leaderboard", ".players"),
        ("Player Profile", "/players/joseph", ".name"),
        ("Games", "/games", ".games"),
        ("Stats", "/stats/season", ".totalGames"),
    ]
    
    print(f"Testing APIs at: {base_url}")
    print("=" * 50)
    
    passed = 0
    failed = 0
    
    for name, endpoint, expected_field in tests:
        try:
            resp = requests.get(base_url + endpoint, timeout=10)
            data = resp.json() if resp.headers.get('content-type', '').startswith('application/json') else {}
            
            if resp.status_code == 200:
                # Check if expected field exists
                field_path = expected_field.split('.')
                current = data
                field_exists = True
                
                for field in field_path[1:]:  # Skip the first dot
                    if isinstance(current, dict) and field in current:
                        current = current[field]
                    elif isinstance(current, list) and field == "0" and len(current) > 0:
                        current = current[0]
                    else:
                        field_exists = False
                        break
                
                if field_exists:
                    print(f"✅ {name:<20} PASS (200 OK)")
                    passed += 1
                else:
                    print(f"⚠️  {name:<20} PARTIAL (200 OK but missing {expected_field})")
                    failed += 1
            else:
                print(f"❌ {name:<20} FAIL ({resp.status_code})")
                if 'detail' in data:
                    print(f"   Error: {data['detail']}")
                elif 'error' in data:
                    print(f"   Error: {data['error']}")
                failed += 1
                
        except requests.RequestException as e:
            print(f"❌ {name:<20} ERROR: {str(e)}")
            failed += 1
        except Exception as e:
            print(f"❌ {name:<20} ERROR: {str(e)}")
            failed += 1
    
    print("\n" + "=" * 50)
    print(f"Summary: {passed} passed, {failed} failed")
    
    return failed == 0

if __name__ == "__main__":
    # Get URL from command line or use default
    url = sys.argv[1] if len(sys.argv) > 1 else "https://mj-skill-rating.vercel.app"
    
    # Test production first
    print("\n🚀 PRODUCTION API TEST")
    print("=" * 50)
    success = test_apis(url)
    
    # Also test localhost if running locally
    if url != "http://localhost:8000":
        print("\n\n🏠 LOCAL API TEST")
        print("=" * 50)
        try:
            local_resp = requests.get("http://localhost:8000/", timeout=1)
            if local_resp.status_code == 200:
                test_apis("http://localhost:8000")
        except:
            print("Local API not running at http://localhost:8000")
    
    sys.exit(0 if success else 1)