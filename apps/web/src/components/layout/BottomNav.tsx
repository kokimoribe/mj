"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, History } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Leaderboard",
    href: "/",
    icon: Home,
    description: "Leaderboard",
  },
  {
    name: "Games",
    href: "/games",
    icon: History,
    description: "Game History",
  },
  {
    name: "Players",
    href: "/players",
    icon: Home,
    description: "All Players",
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="bg-background fixed right-0 bottom-0 left-0 z-50 border-t"
      data-testid="bottom-navigation"
    >
      <div className="grid h-16 grid-cols-3" role="list">
        {navigation.map(item => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              aria-label={item.description}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                "hover:text-primary focus:text-primary focus-visible:ring-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-all",
                  isActive && "scale-110"
                )}
                aria-hidden="true"
              />
              <span className="text-[10px]" aria-selected={isActive}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
