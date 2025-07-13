#!/usr/bin/env node

/**
 * Quick health check script for the Riichi Mahjong League development environment
 * Usage: node check-status.js
 */

const http = require('http');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

const checkEndpoint = (url, name) => {
  return new Promise((resolve) => {
    const request = http.get(url, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ ${name}: Running (${res.statusCode})`);
        resolve(true);
      } else {
        console.log(`❌ ${name}: Error (${res.statusCode})`);
        resolve(false);
      }
    });

    request.on('error', () => {
      console.log(`❌ ${name}: Not running`);
      resolve(false);
    });

    request.setTimeout(3000, () => {
      console.log(`⏱️  ${name}: Timeout`);
      request.destroy();
      resolve(false);
    });
  });
};

async function runTests() {
  try {
    console.log('🧪 Running test suite...');
    const { stdout } = await execAsync('npm run test');
    if (stdout.includes('successful')) {
      console.log('✅ Tests: All passing');
      return true;
    } else {
      console.log('❌ Tests: Some failures');
      return false;
    }
  } catch (error) {
    console.log('❌ Tests: Failed to run');
    return false;
  }
}

async function checkServices() {
  console.log('🔍 Checking Riichi Mahjong League services...\n');
  
  const [serviceResults, testResult] = await Promise.all([
    Promise.all([
      checkEndpoint('http://localhost:3000', 'Next.js Frontend'),
      checkEndpoint('http://localhost:8000/health', 'FastAPI Backend'),
      checkEndpoint('http://localhost:8000/ratings/current', 'Leaderboard API')
    ]),
    runTests()
  ]);

  const allServicesRunning = serviceResults.every(Boolean);
  const allHealthy = allServicesRunning && testResult;
  
  console.log('\n' + '='.repeat(50));
  if (allHealthy) {
    console.log('🎉 All services and tests are healthy!');
    console.log('🚀 Phase 0 Task 01 COMPLETE with testing');
    console.log('🌐 Visit: http://localhost:3000');
  } else if (allServicesRunning) {
    console.log('⚠️  Services running but tests have issues');
    console.log('💡 Check test output above');
  } else {
    console.log('⚠️  Some services are not running');
    console.log('💡 Run: npm run dev');
  }
  console.log('='.repeat(50));
  
  process.exit(allHealthy ? 0 : 1);
}

checkServices().catch(console.error);
