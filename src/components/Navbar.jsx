import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { user, logout, isGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActiveLink = (path) => {
    return location.pathname === path
      ? "bg-indigo-700 text-white"
      : "text-gray-300 hover:bg-indigo-700 hover:text-white";
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-indigo-800">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 bg-indigo-900">
        <span className="text-white text-xl font-bold">Chess Game</span>
      </div>

      {/* Navigation */}
      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {isGuest ? (
            // GUEST NAVIGATION - samo Play i Sign In
            <>
              <button
                onClick={() => navigate("/game/local")}
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
                Sign In
              </Link>
            </>
          ) : (
            // REGISTERED USER NAVIGATION
            <>
              <Link
                to="/dashboard"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActiveLink(
                  "/dashboard"
                )}`}
              >
                <span className="mr-3">🏠</span>
                Dashboard
              </Link>

              <Link
                to="/friends"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActiveLink(
                  "/friends"
                )}`}
              >
                <span className="mr-3">👥</span>
                Friends
              </Link>

              <Link
                to="/profile"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActiveLink(
                  "/profile"
                )}`}
              >
                <span className="mr-3">👤</span>
                Profile
              </Link>
            </>
          )}
        </div>
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
