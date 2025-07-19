import { AppLayout } from '@/components/layout/AppLayout'
import { TournamentBracketView } from '@/components/features/tournaments/TournamentBracketView'

export default async function TournamentPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  
  return (
    <AppLayout>
      <TournamentBracketView tournamentId={id} />
    </AppLayout>
  )
}