"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

export function EasterEgg() {
  const [isVisible, setIsVisible] = useState(false);
  const [overscrollAmount, setOverscrollAmount] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop =
            window.scrollY || document.documentElement.scrollTop;
          const scrollHeight = document.documentElement.scrollHeight;
          const clientHeight = window.innerHeight;

          // Calculate how far we've scrolled past the bottom
          const maxScroll = scrollHeight - clientHeight;
          const overscroll = Math.max(0, scrollTop - maxScroll);

          // Check if we're at or past the bottom
          const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;

          if (isAtBottom && overscroll > 0) {
            // Show the easter egg when overscrolling
            setIsVisible(true);
            // Calculate how much to reveal (max 120px)
            const revealAmount = Math.min(120, overscroll * 2);
            setOverscrollAmount(revealAmount);
          } else if (!isAtBottom) {
            // Hide when scrolling back up
            setIsVisible(false);
            setOverscrollAmount(0);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    // Add scroll listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Check initial state
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`pointer-events-none fixed bottom-0 left-1/2 -translate-x-1/2 transition-all duration-300 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        transform: `translateX(-50%) translateY(${isVisible ? 120 - overscrollAmount : 120}px)`,
        zIndex: 1000,
      }}
    >
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-green-500/20 to-transparent blur-xl" />

        {/* Image container */}
        <div className="relative h-24 w-24 overflow-hidden rounded-full shadow-2xl">
          <Image
            src="/ron4.png"
            alt="Ron! Easter egg"
            width={96}
            height={96}
            className="h-full w-full object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}
