import { AppLayout } from "@/components/layout/AppLayout";
import { LeaderboardView } from "@/features/leaderboard/components/LeaderboardView";

export default function Home() {
  return (
    <AppLayout>
      <LeaderboardView />
    </AppLayout>
  );
}
