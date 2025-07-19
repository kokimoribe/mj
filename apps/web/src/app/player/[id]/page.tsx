import { AppLayout } from '@/components/layout/AppLayout'
import { PlayerProfileView } from '@/components/features/player/PlayerProfileView'

interface PlayerPageProps {
  params: {
    id: string
  }
}

export default function PlayerPage({ params }: PlayerPageProps) {
  return (
    <AppLayout>
      <PlayerProfileView playerId={params.id} />
    </AppLayout>
  )
}