import { AppLayout } from '@/components/layout/AppLayout'
import { LeaderboardView } from '@/components/features/leaderboard/LeaderboardView'

export default function Home() {
  return (
    <AppLayout>
      <LeaderboardView />
    </AppLayout>
  )
}
