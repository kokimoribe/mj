import { AppLayout } from '@/components/layout/AppLayout'
import { TournamentCreationWizard } from '@/components/features/tournaments/TournamentCreationWizard'

export default function NewTournamentPage() {
  return (
    <AppLayout>
      <TournamentCreationWizard />
    </AppLayout>
  )
}