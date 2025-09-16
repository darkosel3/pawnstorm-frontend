// export default Navbar;
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

const Navbar = () => {
  const { user, logout, isGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Friends panel state
  const [friends, setFriends] = useState([]);
  const [onlineFriends, setOnlineFriends] = useState([]);
  const [showFriendsPanel, setShowFriendsPanel] = useState(false);
  const [friendsLoading, setFriendsLoading] = useState(false);

  // Fetch friends from backend
  const fetchFriends = async () => {
    if (isGuest) return;

    setFriendsLoading(true);
    try {
      // Replace with your actual API endpoint
      const response = await api.get("/friends");

      if (response.ok) {
        const friendsData = await response.json();
        setFriends(friendsData);

        // Filter online friends
        const online = friendsData.filter((friend) => friend.isOnline);
        setOnlineFriends(online);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setFriendsLoading(false);
    }
  };

  // Challenge a friend to a game
  const challengeFriend = async (friendId) => {
    try {
      const response = await fetch("/api/game/challenge", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendId }),
      });

      if (response.ok) {
        const gameData = await response.json();
        navigate(`/game/${gameData.gameId}`);
      }
    } catch (error) {
      console.error("Error challenging friend:", error);
    }
  };

  // Fetch friends when user logs in
  useEffect(() => {
    if (!isGuest && user) {
      fetchFriends();

      // Set up periodic refresh for online status
      const interval = setInterval(fetchFriends, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isGuest, user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActiveLink = (path) => {
    return location.pathname === path
      ? "bg-indigo-700 text-white"
      : "text-gray-300 hover:bg-indigo-700 hover:text-white";
  };

  const FriendsPanel = () => {
    return (
      <div className="mt-4 px-4">
        <button
          onClick={() => setShowFriendsPanel(!showFriendsPanel)}
          className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-indigo-700 hover:text-white mb-2"
        >
          <div className="flex items-center">
            <span className="mr-3">👥</span>
            <span>Friends ({onlineFriends.length} online)</span>
          </div>
          <span
            className={`transform transition-transform ${
              showFriendsPanel ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </button>
        {showFriendsPanel && (
          <div className="bg-indigo-900 rounded-md p-3 max-h-64 overflow-y-auto">
            {friendsLoading ? (
              <div className="text-gray-300 text-sm text-center py-2">
                Loading...
              </div>
            ) : friends.length === 0 ? (
              <div className="text-gray-300 text-sm text-center py-2">
                No friends yet. Add some friends to play!
              </div>
            ) : (
              <div className="space-y-2">
                {/* Online Friends */}
                {onlineFriends.length > 0 && (
                  <div>
                    <div className="text-green-400 text-xs font-semibold mb-2 uppercase tracking-wide">
                      Online ({onlineFriends.length})
                    </div>
                    {onlineFriends.map((friend) => (
                      <div
                        key={friend.id}
                        className="flex items-center justify-between bg-indigo-800 rounded px-2 py-1.5"
                      >
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                          <div className="text-white text-sm font-medium">
                            {friend.username}
                          </div>
                          <div className="text-gray-400 text-xs ml-1">
                            ({friend.rating})
                          </div>
                        </div>
                        <button
                          onClick={() => challengeFriend(friend.id)}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded"
                          title="Challenge to a game"
                        >
                          ⚔️
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Offline Friends */}
                {friends.filter((f) => !f.isOnline).length > 0 && (
                  <div className="mt-3">
                    <div className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wide">
                      Offline ({friends.filter((f) => !f.isOnline).length})
                    </div>
                    {friends
                      .filter((f) => !f.isOnline)
                      .map((friend) => (
                        <div
                          key={friend.id}
                          className="flex items-center bg-indigo-800 rounded px-2 py-1.5 opacity-60"
                        >
                          <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
                          <div className="text-gray-300 text-sm">
                            {friend.username}
                          </div>
                          <div className="text-gray-500 text-xs ml-1">
                            ({friend.rating})
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-3 pt-2 border-t border-indigo-700">
              <Link
                to="/friends"
                className="block text-center bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded"
              >
                Manage Friends
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-indigo-800">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 bg-indigo-900">
        <span className="text-white text-xl font-bold">Pawnstorm</span>
      </div>

      {/* Navigation */}
      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {isGuest ? (
            // GUEST NAVIGATION
            <>
              <button
                onClick={() => navigate("/game/guest")}
                className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-md bg-green-600 hover:bg-green-700 text-white"
              >
                <span className="mr-3">▶️</span>
                Play Chess
              </button>

              <Link
                to="/login"
                className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-indigo-700 hover:text-white"
              >
                <span className="mr-3">🔑</span>
                Log In
              </Link>
              <Link
                to="/signup"
                className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-green-700 hover:text-white"
              >
                <span className="mr-3">📝</span>
                Sign Up
              </Link>
            </>
          ) : (
            // REGISTERED USER NAVIGATION
            <>
              <button
                onClick={() => navigate("/game/play")}
                className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-md bg-green-600 hover:bg-green-700 text-white"
              >
                <span className="mr-3">▶️</span>
                Play Chess
              </button>

              <Link
                to="/dashboard"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActiveLink(
                  "/dashboard"
                )}`}
              >
                <span className="mr-3">🏠</span>
                Dashboard
              </Link>

              {/* <Link
                to="/friends"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActiveLink(
                  "/friends"
                )}`}
              >
                <span className="mr-3">👥</span>
                Friends
              </Link> */}
            </>
          )}
        </div>

        {/* Friends Panel */}
        <FriendsPanel />
      </nav>

      {/* User Info */}
      <div className="absolute bottom-0 w-full p-4 bg-indigo-900">
        <div className="text-white text-sm mb-2">
          {isGuest ? "Playing as Guest" : `Welcome, ${user?.name}`}
        </div>
        {!isGuest && (
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
