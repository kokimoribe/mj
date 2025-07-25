import { AppLayout } from "@/components/layout/AppLayout";
import { GameHistoryView } from "@/components/features/games/GameHistoryView";
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
