'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, BarChart3, Sliders, History } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { 
    name: 'Home', 
    href: '/', 
    icon: Home,
    description: 'Leaderboard'
  },
  { 
    name: 'Games', 
    href: '/games', 
    icon: History,
    description: 'Game History' 
  },
  { 
    name: 'Stats', 
    href: '/stats', 
    icon: BarChart3,
    description: 'Statistics'
  },
  { 
    name: 'Config', 
    href: '/playground', 
    icon: Sliders,
    description: 'Playground'
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="grid grid-cols-4 h-16">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                "hover:text-primary focus:text-primary focus:outline-none",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
            >
              <item.icon 
                className={cn(
                  "h-5 w-5 transition-all",
                  isActive && "scale-110"
                )} 
              />
              <span className="text-[10px]">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}