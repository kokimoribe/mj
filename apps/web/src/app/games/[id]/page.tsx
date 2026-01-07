"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { GameDetailView } from "@/features/games/components/GameDetailView";
import { Suspense } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

function GameDetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

export default function GameDetailPage() {
  const params = useParams();
  const gameId = params.id as string;

  return (
    <AppLayout>
      <Suspense fallback={<GameDetailSkeleton />}>
        <GameDetailView gameId={gameId} />
      </Suspense>
    </AppLayout>
  );
}
