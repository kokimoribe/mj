"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export function StatisticsNotAvailable() {
  return (
    <Alert data-testid="statistics-not-available">
      <Info className="h-4 w-4" />
      <AlertTitle>Statistics Not Available</AlertTitle>
      <AlertDescription>
        Hand-by-hand tracking was not available for this season. Only statistics
        based on final scores and placements can be shown.
      </AlertDescription>
    </Alert>
  );
}
