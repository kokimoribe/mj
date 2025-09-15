"use client";

import { Suspense } from "react";
import { HandRecordingView } from "@/features/hand-recording/components/HandRecordingView";
import { Skeleton } from "@/components/ui/skeleton";

export default function ActiveGamePage() {
  return (
    <Suspense fallback={<HandRecordingSkeleton />}>
      <HandRecordingView />
    </Suspense>
  );
}

function HandRecordingSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
