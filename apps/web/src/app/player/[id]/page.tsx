import { AppLayout } from "@/components/layout/AppLayout";
import { PlayerProfileView } from "@/features/players/components/PlayerProfileView";
import { Suspense } from "react";
import { Metadata } from "next";
import { fetchPlayerProfile } from "@/lib/supabase/queries";
import { config } from "@/config";

interface PlayerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: PlayerPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const player = await fetchPlayerProfile(id);
    return {
      title: `${player.name} - ${config.pwa.name}`,
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: config.pwa.name,
    };
  }
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
