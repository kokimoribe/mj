import { AppLayout } from "@/components/layout/AppLayout";
import { GameHistoryView } from "@/components/features/games/GameHistoryView";

export default function GamesPage() {
  return (
    <AppLayout>
      <GameHistoryView />
    </AppLayout>
  );
}
