import { AppLayout } from '@/components/layout/AppLayout'
import { TournamentListView } from '@/components/features/tournaments/TournamentListView'

export default function TournamentsPage() {
  return (
    <AppLayout>
      <TournamentListView />
    </AppLayout>
  )
}