// src/components/Dashboard.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

const Dashboard = () => {
  const { user, isGuest } = useAuth();
  const [recentGames, setRecentGames] = useState([]);
  const [onlineFriends, setOnlineFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isGuest) {
      fetchDashboardData();
    } else {
      setLoading(false); // Guest ne čeka API pozive
    }
  }, [isGuest]);

  const fetchDashboardData = async () => {
    try {
      const [gamesResponse, friendsResponse] = await Promise.all([
        api.get("/games?limit=5"),
        api.get("/friends?online=true"),
      ]);

      setRecentGames(gamesResponse.data);
      setOnlineFriends(friendsResponse.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const startNewGame = async (friendId = null) => {
    if (isGuest) {
      // Lokalna igra za gosta
      window.location.href = "/game/local";
      return;
    }

    // Regular game logic za registrovane korisnike
    try {
      const response = await api.post("/games", {
        opponent_id: friendId,
        game_type_id: 1,
      });
      window.location.href = `/game/${response.data.game_id}`;
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  // Ovde pocinje game kad ga kreiramo odmah za guest
  // GUEST DASHBOARD - jednostavan
  if (isGuest) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, Guest!
          </h1>
          <p className="text-gray-600 mb-6">Ready to play chess?</p>

          <button
            onClick={() => startNewGame()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg text-lg"
          >
            Start Chess Game
          </button>

          <div className="mt-4 text-sm text-gray-500">
            <p>Playing as guest - no account needed!</p>
            <p>
              Want to save games?{" "}
              <a href="/register" className="text-indigo-600">
                Create account
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">Ready for a game of chess?</p>

        <div className="mt-4 flex gap-4">
          <button
            onClick={() => startNewGame()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
          >
            Quick Game
          </button>
          <Link
            to="/friends"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          >
            Play with Friends
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Games */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Games</h2>
          {recentGames.length === 0 ? (
            <p className="text-gray-500">No recent games</p>
          ) : (
            <div className="space-y-3">
              {recentGames.map((game) => (
                <div
                  key={game.game_id}
                  className="border-l-4 border-indigo-500 pl-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        vs {game.opponent?.name || "Unknown"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(game.played_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        game.result === "1-0" && game.winner === user?.player_id
                          ? "bg-green-100 text-green-800"
                          : game.result === "0-1" &&
                            game.winner === user?.player_id
                          ? "bg-green-100 text-green-800"
                          : game.result === "1/2-1/2"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {game.result}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Online Friends */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Online Friends</h2>
          {onlineFriends.length === 0 ? (
            <p className="text-gray-500">No friends online</p>
          ) : (
            <div className="space-y-3">
              {onlineFriends.map((friend) => (
                <div
                  key={friend.player_id}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>{friend.name}</span>
                  </div>
                  <button
                    onClick={() => startNewGame(friend.player_id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Challenge
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
