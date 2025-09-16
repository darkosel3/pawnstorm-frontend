import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ChessBoardMine from "./ChessBoardMine.jsx";

const GuestGame = () => {
  const { gameId } = useParams();
  const [searchParams] = useSearchParams();

  const [playerInfo, setPlayerInfo] = useState({
    name: searchParams.get("name") || "",
    type: "guest",
  });

  const [showNameInput, setShowNameInput] = useState(true); //

  const [gameEnded, setGameEnded] = useState(false);
  const [gameResult, setGameResult] = useState(null);

  // Handle game end
  const handleGameEnd = (result) => {
    setGameEnded(true);
    setGameResult(result);
    console.log("Guest game ended:", result);
  };

  // Handle name submission
  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (playerInfo.name.trim()) {
      // Save to localStorage for future guest games
      localStorage.setItem("guestPlayerName", playerInfo.name.trim());
      setShowNameInput(false);
    }
  };

  // Play again function
  const playAgain = () => {
    setGameEnded(false);
    setGameResult(null);
    setShowNameInput(true); // Prikaži input ponovo
    // Redirect to new guest game
    window.location.href = "/game/local";
  };

  // If player needs to enter name
  if (showNameInput) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center mb-6">
            <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Guest Player</h2>
            <p className="text-gray-600 text-sm mt-2">
              Enter your name to start playing
            </p>
          </div>

          <form onSubmit={handleNameSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={playerInfo.name}
                onChange={(e) =>
                  setPlayerInfo({ ...playerInfo, name: e.target.value })
                }
                placeholder="Enter your display name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                maxLength={20}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This name will be visible to your opponent
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Start Playing
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 mb-3">
              Playing as guest - no registration required
            </p>
            <button
              onClick={() => (window.location.href = "/login")}
              className="text-gray-500 hover:text-gray-700 text-sm underline"
            >
              ← Back to Login
            </button>
          </div>
          {/* Current Player Info Bar */}
          <div className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-4 py-2 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Playing as:</span>
                <span className="font-semibold">{playerInfo.name}</span>
              </div>
              <div className="text-sm text-gray-500">Guest Mode</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Game Over Modal */}
      {gameEnded && gameResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-center mb-4">Game Over!</h2>

            <div className="text-center mb-6">
              {gameResult.type === "checkmate" && (
                <div>
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-green-600 mb-2">
                    Checkmate!
                  </p>
                  <p className="text-gray-700">
                    {gameResult.winner.name} wins!
                  </p>
                </div>
              )}

              {gameResult.type === "draw" && (
                <div>
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-blue-600 mb-2">
                    Draw!
                  </p>
                  <p className="text-gray-700 capitalize">
                    {gameResult.reason}
                  </p>
                </div>
              )}

              {gameResult.type === "resignation" && (
                <div>
                  <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-8 h-8 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      ></path>
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-orange-600 mb-2">
                    Resignation
                  </p>
                  <p className="text-gray-700">
                    {gameResult.resigned.name} resigned
                  </p>
                  <p className="text-gray-700">
                    {gameResult.winner.name} wins!
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={playAgain}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Play Another Game
              </button>
              <button
                onClick={() => (window.location.href = "/login")}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Back to Login
              </button>
            </div>

            {gameResult.pgn && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(gameResult.pgn);
                    alert("Game PGN copied to clipboard!");
                  }}
                  className="w-full text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded transition-colors"
                >
                  📋 Copy Game PGN
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chess Board */}
      <div className="container mx-auto p-4">
        <ChessBoardMine
          gameId={gameId || "guest"}
          playerType={playerInfo.type}
          playerName={playerInfo.name}
          onGameEnd={handleGameEnd}
        />
      </div>
    </div>
  );
};

export default GuestGame;
