import { AppLayout } from "@/components/layout/AppLayout";
import { PlayerProfileView } from "@/components/features/player/PlayerProfileView";
import { Suspense } from "react";

interface PlayerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { id } = await params;

  return (
    <AppLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <PlayerProfileView playerId={id} />
      </Suspense>
    </AppLayout>
  );
}
