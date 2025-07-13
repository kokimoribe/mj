"use client";

import { useState, useEffect } from "react";
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
          console.log(`Retrying... (${retryCount + 1}/3)`);
          setTimeout(() => fetchLeaderboard(retryCount + 1), 2000);
          return;
        }

        setError(
          `Failed to load leaderboard: ${err instanceof Error ? err.message : "Unknown error"}`,
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
          `Failed to load leaderboard: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading leaderboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">{error}</div>
          <button
            onClick={handleRetry}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Riichi Mahjong League
        </h1>

        {/* Test v4 Features */}
        <div className="mb-6 p-4 bg-brand-primary text-white rounded-[--radius-card] text-center">
          <p className="text-lg font-semibold">
            🎌 Welcome to Tailwind CSS v4!
          </p>
          <p className="text-sm opacity-90 mt-1">
            Using custom @theme variables
          </p>
        </div>

        {/* Leaderboard Display */}
        {leaderboard && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-800 text-white">
              <h2 className="text-2xl font-semibold">Player Rankings</h2>
            </div>

            <div className="divide-y divide-gray-200">
              {leaderboard.players.map((player, index) => (
                <div
                  key={player.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
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
          <p className="text-sm mt-2">Powered by OpenSkill ratings</p>
        </footer>
      </div>
    </div>
  );
}
