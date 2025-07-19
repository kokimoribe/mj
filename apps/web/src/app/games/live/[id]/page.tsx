import { AppLayout } from '@/components/layout/AppLayout'
import { LiveGameTracker } from '@/components/features/games/LiveGameTracker'

export default async function LiveGamePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  
  return (
    <AppLayout>
      <LiveGameTracker gameId={id} />
    </AppLayout>
  )
}