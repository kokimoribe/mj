import { AppLayout } from '@/components/layout/AppLayout'
import { GameCreationFlow } from '@/components/features/games/GameCreationFlow'

export default function NewGamePage() {
  return (
    <AppLayout>
      <GameCreationFlow />
    </AppLayout>
  )
}