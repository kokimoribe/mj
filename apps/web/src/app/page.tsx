"use client";

import { useEffect, useState } from "react";
import InstallPrompt from "../components/InstallPrompt";

interface Player {
  id: string;
  name: string;
  rating: number;
  games: number;
}

interface LeaderboardData {
  season: string;
  players: Player[];
}

export default function Home() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const fetchLeaderboard = async (retryCount = 0) => {
      try {
        const response = await fetch(`${API_BASE_URL}/ratings/current`, {
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setLeaderboard(data);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);

        // Retry logic for network errors
        if (
          retryCount < 2 &&
          err instanceof Error &&
          (err.message.includes("fetch") || err.message.includes("network"))
        ) {
          console.warn(`Retrying... (${retryCount + 1}/3)`);
          setTimeout(() => fetchLeaderboard(retryCount + 1), 2000);
          return;
        }

        setError(
          `Failed to load leaderboard: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      } finally {
        if (retryCount === 0) {
          // Only set loading false on initial request
          setLoading(false);
        }
      }
    };

    fetchLeaderboard();
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);

    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/ratings/current`, {
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setLeaderboard(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
        setError(
          `Failed to load leaderboard: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading leaderboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-xl text-red-600">{error}</div>
          <button
            onClick={handleRetry}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* PWA Install Prompt */}
      <div className="container mx-auto px-4 pt-4">
        <InstallPrompt />
      </div>

      {/* Page Title */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-900">
          Riichi Mahjong League
        </h1>

        {/* Test v4 Features */}
        <div className="bg-brand-primary mb-6 rounded-[--radius-card] p-4 text-center text-white">
          <p className="text-lg font-semibold">
            🎌 Welcome to Tailwind CSS v4!
          </p>
          <p className="mt-1 text-sm opacity-90">
            Using custom @theme variables
          </p>
        </div>

        {/* Leaderboard Display */}
        {leaderboard && (
          <div className="overflow-hidden rounded-lg bg-white shadow-md">
            <div className="bg-gray-800 px-6 py-4 text-white">
              <h2 className="text-2xl font-semibold">Player Rankings</h2>
            </div>

            <div className="divide-y divide-gray-200">
              {leaderboard.players.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                        {index + 1}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {player.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {player.games} games played
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {player.rating}
                    </div>
                    <div className="text-sm text-gray-500">Rating</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="mt-8 text-center text-gray-500">
          <p>Phase 0: Basic Read-Only PWA</p>
          <p className="mt-2 text-sm">Powered by OpenSkill ratings</p>
        </footer>
      </div>
    </div>
  );
}
