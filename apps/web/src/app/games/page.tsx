import { Suspense } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { GameHistoryView } from "@/components/features/games/GameHistoryView";

export default function GamesPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <GameHistoryView />
      </Suspense>
    </AppLayout>
  );
}
