import { AppLayout } from "@/components/layout/AppLayout";
import { GameHistoryView } from "@/features/games/components/GameHistoryView";
import { Suspense } from "react";

export default function GamesPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <GameHistoryView />
      </Suspense>
    </AppLayout>
  );
}
