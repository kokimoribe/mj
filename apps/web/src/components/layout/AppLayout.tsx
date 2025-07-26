"use client";

import { InstallPrompt } from "@/components/InstallPrompt";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BottomNav } from "./BottomNav";
import { OfflineIndicator } from "@/components/OfflineIndicator";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="bg-background min-h-screen">
      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* PWA Install Prompt */}
      <div className="container mx-auto px-4 pt-4">
        <InstallPrompt />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <header className="relative mb-8">
          <div className="absolute top-0 right-0">
            <ThemeToggle />
          </div>
          <div className="text-center">
            <h1 className="text-foreground text-3xl font-bold">
              River Terrace Mahjong Parlor Leaderboard
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {/* Add description */}
            </p>
          </div>
        </header>

        <main>{children}</main>

        <footer className="text-muted-foreground mt-12 text-center">
          <p className="text-sm">{/* footer placeholder</p> */}</p>
          <p className="mt-1 text-xs">{/* Footer place holder */}</p>
        </footer>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav />
    </div>
  );
}
