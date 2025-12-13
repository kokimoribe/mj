#!/usr/bin/env tsx
/**
 * Test script to validate chombo penalty calculations
 *
 * This script tests the chombo penalty logic according to JPML/EMA rules:
 * - Dealer chombo: pays 4000 to each non-dealer (total 12,000)
 * - Non-dealer chombo: pays 4000 to dealer and 2000 to each other non-dealer (total 8,000)
 */

type Seat = "east" | "south" | "west" | "north";

interface ChomboTest {
  name: string;
  dealerSeat: Seat;
  offenderSeat: Seat;
  expectedDeltas: Record<Seat, number>;
}

const tests: ChomboTest[] = [
  {
    name: "Dealer chombo (East dealer, East offender)",
    dealerSeat: "east",
    offenderSeat: "east",
    expectedDeltas: {
      east: -12000, // Dealer pays 12,000 total
      south: 4000, // Each non-dealer gets 4,000
      west: 4000,
      north: 4000,
    },
  },
  {
    name: "Non-dealer chombo (East dealer, South offender)",
    dealerSeat: "east",
    offenderSeat: "south",
    expectedDeltas: {
      east: 4000, // Dealer gets 4,000
      south: -8000, // Offender pays 8,000 total
      west: 2000, // Each other non-dealer gets 2,000
      north: 2000,
    },
  },
  {
    name: "Non-dealer chombo (East dealer, West offender)",
    dealerSeat: "east",
    offenderSeat: "west",
    expectedDeltas: {
      east: 4000, // Dealer gets 4,000
      south: 2000, // Each other non-dealer gets 2,000
      west: -8000, // Offender pays 8,000 total
      north: 2000,
    },
  },
  {
    name: "Non-dealer chombo (East dealer, North offender)",
    dealerSeat: "east",
    offenderSeat: "north",
    expectedDeltas: {
      east: 4000, // Dealer gets 4,000
      south: 2000, // Each other non-dealer gets 2,000
      west: 2000,
      north: -8000, // Offender pays 8,000 total
    },
  },
];

function calculateChomboDeltas(
  dealerSeat: Seat,
  offenderSeat: Seat
): Record<Seat, number> {
  const seats: Seat[] = ["east", "south", "west", "north"];
  const deltas: Record<Seat, number> = {
    east: 0,
    south: 0,
    west: 0,
    north: 0,
  };

  const isOffenderDealer = offenderSeat === dealerSeat;

  if (isOffenderDealer) {
    // Dealer chombo: pays 4000 to each non-dealer (total 12,000)
    deltas[offenderSeat] = -12000;
    for (const seat of seats) {
      if (seat !== offenderSeat) {
        deltas[seat] = 4000;
      }
    }
  } else {
    // Non-dealer chombo: pays 4000 to dealer and 2000 to each other non-dealer (total 8,000)
    deltas[offenderSeat] = -8000;
    for (const seat of seats) {
      if (seat !== offenderSeat) {
        if (seat === dealerSeat) {
          deltas[seat] = 4000;
        } else {
          deltas[seat] = 2000;
        }
      }
    }
  }

  return deltas;
}

function runTests() {
  console.log("Testing Chombo Penalty Calculations\n");
  console.log("=".repeat(60));

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = calculateChomboDeltas(test.dealerSeat, test.offenderSeat);
    const allMatch = (["east", "south", "west", "north"] as Seat[]).every(
      seat => result[seat] === test.expectedDeltas[seat]
    );

    if (allMatch) {
      console.log(`✅ ${test.name}`);
      passed++;
    } else {
      console.log(`❌ ${test.name}`);
      console.log(`   Expected:`, test.expectedDeltas);
      console.log(`   Got:     `, result);
      failed++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`Summary: ${passed} passed, ${failed} failed`);

  // Verify totals
  console.log("\nVerifying point totals (should sum to 0):");
  for (const test of tests) {
    const result = calculateChomboDeltas(test.dealerSeat, test.offenderSeat);
    const total = Object.values(result).reduce((sum, delta) => sum + delta, 0);
    if (total === 0) {
      console.log(`✅ ${test.name}: Total = ${total}`);
    } else {
      console.log(`❌ ${test.name}: Total = ${total} (should be 0)`);
      failed++;
    }
  }

  return failed === 0;
}

// Run tests
const success = runTests();
process.exit(success ? 0 : 1);
