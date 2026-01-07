"use client";

import { useState } from "react";
import { Info, Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

interface GameIdTooltipProps {
  gameId: string;
}

export function GameIdTooltip({ gameId }: GameIdTooltipProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(gameId);
      } else {
        // Fallback for iOS Safari and older browsers
        const textArea = document.createElement("textarea");
        textArea.value = gameId;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (!successful) {
          throw new Error("Copy command failed");
        }
      }

      setCopied(true);
      toast.success("Game ID copied to clipboard");
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      toast.error("Failed to copy Game ID");
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Game ID"
            onClick={handleCopy}
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="border-slate-700 bg-slate-900 text-white dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-white">Game ID</span>
            <span className="rounded border border-slate-700 bg-slate-800 px-2 py-1 font-mono text-xs text-white dark:border-slate-800 dark:bg-slate-900">
              {gameId}
            </span>
            {copied ? (
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-green-400">
                <Check className="h-3 w-3" />
                <span className="font-medium">Copied!</span>
              </div>
            ) : (
              <span className="mt-0.5 text-xs text-slate-300 dark:text-slate-400">
                Click to copy
              </span>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
