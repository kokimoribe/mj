'use client'

import { InstallPrompt } from '@/components/InstallPrompt'
import { ThemeToggle } from '@/components/ThemeToggle'
import { BottomNav } from './BottomNav'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* PWA Install Prompt */}
      <div className="container mx-auto px-4 pt-4">
        <InstallPrompt />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <header className="mb-8 relative">
          <div className="absolute right-0 top-0">
            <ThemeToggle />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">
              🀄 Riichi Mahjong League
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Phase 0: Enhanced PWA with Modern UI
            </p>
          </div>
        </header>

        <main>{children}</main>

        <footer className="mt-12 text-center text-muted-foreground">
          <p className="text-sm">Powered by OpenSkill ratings</p>
          <p className="mt-1 text-xs">
            Built with Next.js 15 • Shadcn/ui • TanStack Query
          </p>
        </footer>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav />
    </div>
  )
}