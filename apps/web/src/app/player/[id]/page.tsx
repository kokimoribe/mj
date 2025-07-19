import { AppLayout } from '@/components/layout/AppLayout'
import { PlayerProfileView } from '@/components/features/player/PlayerProfileView'

interface PlayerPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { id } = await params
  
  return (
    <AppLayout>
      <PlayerProfileView playerId={id} />
    </AppLayout>
  )
}