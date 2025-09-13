// src/components/ChessBoard.js
import React, { useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

const ChessBoard = ({
  gameId,
  isPlayerWhite = true,
  onGameEnd,
  initialPGN = "",
}) => {
  const [game, setGame] = useState(new Chess());
  const [gamePosition, setGamePosition] = useState(game.fen());
  const [moveHistory, setMoveHistory] = useState([]);
  const [gameStatus, setGameStatus] = useState("");

  // Initialize game from PGN if provided
  useEffect(() => {
    if (initialPGN) {
      const newGame = new Chess();
      newGame.loadPgn(initialPGN);
      setGame(newGame);
      setGamePosition(newGame.fen());
      setMoveHistory(newGame.history({ verbose: true }));
    }
  }, [initialPGN]);

  // Check game status
  useEffect(() => {
    if (game.isGameOver()) {
      if (game.isCheckmate()) {
        const winner = game.turn() === "w" ? "Black" : "White";
        setGameStatus(`Checkmate! ${winner} wins!`);
        onGameEnd &&
          onGameEnd({
            result: game.turn() === "w" ? "0-1" : "1-0",
            reason: "checkmate",
            pgn: game.pgn(),
          });
      } else if (game.isDraw()) {
        setGameStatus("Draw!");
        onGameEnd &&
          onGameEnd({
            result: "1/2-1/2",
            reason: "draw",
            pgn: game.pgn(),
          });
      }
    } else if (game.isCheck()) {
      setGameStatus("Check!");
    } else {
      setGameStatus("");
    }
  }, [game, onGameEnd]);

  const makeMove = (sourceSquare, targetSquare, piece) => {
    // Only allow moves if it's player's turn
    const playerColor = isPlayerWhite ? "w" : "b";
    if (game.turn() !== playerColor) {
      return false;
    }

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece[1].toLowerCase() ?? "q", // Always promote to queen for now
      });

      if (move) {
        setGamePosition(game.fen());
        setMoveHistory([...moveHistory, move]);

        // Send move to backend here
        sendMoveToServer(move);
        return true;
      }
    } catch (error) {
      console.error("Invalid move:", error);
    }

    return false;
  };

  const sendMoveToServer = async (move) => {
    // TODO: Implement API call to save move
    console.log("Sending move to server:", move);
  };

  const onDrop = (sourceSquare, targetSquare, piece) => {
    return makeMove(sourceSquare, targetSquare, piece);
  };

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setGamePosition(newGame.fen());
    setMoveHistory([]);
    setGameStatus("");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Chess Board */}
      <div className="flex-1">
        <div className="mb-4">
          <h3 className="text-xl font-bold">Chess Game</h3>
          {gameStatus && (
            <div
              className={`mt-2 p-2 rounded ${
                gameStatus.includes("Check")
                  ? "bg-yellow-100 text-yellow-800"
                  : gameStatus.includes("wins")
                  ? "bg-green-100 text-green-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {gameStatus}
            </div>
          )}
        </div>

        <div className="max-w-lg mx-auto">
          <Chessboard
            position={gamePosition}
            onPieceDrop={onDrop}
            boardOrientation={isPlayerWhite ? "white" : "black"}
            customBoardStyle={{
              borderRadius: "4px",
              boxShadow: "0 5px 15px rgba(0, 0, 0, 0.5)",
            }}
          />
        </div>

        {/* Game Controls - ispod chess board-a */}
        <div className="mt-6 max-w-lg mx-auto">
          <div className="flex flex-col gap-3">
            <button
              onClick={resetGame}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Reset Game
            </button>

            <button
              onClick={() => (window.location.href = "/login")}
              className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Exit Game
            </button>
          </div>
        </div>
      </div>

      {/* Move History & Game Info */}
      <div className="lg:w-80">
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-lg font-semibold mb-3">Move History</h4>
          <div className="max-h-96 overflow-y-auto">
            {moveHistory.length === 0 ? (
              <p className="text-gray-500">No moves yet</p>
            ) : (
              <div className="space-y-1">
                {moveHistory.map((move, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="font-mono">
                      {Math.floor(index / 2) + 1}.{index % 2 === 0 ? "" : ".."}
                    </span>
                    <span className="font-mono">{move.san}</span>
                    <span className="text-gray-500 text-xs">
                      {move.from}-{move.to}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Game Info */}
        <div className="mt-4 bg-white p-4 rounded-lg shadow">
          <h4 className="text-lg font-semibold mb-3">Game Info</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Turn:</span>
              <span
                className={
                  game.turn() === "w"
                    ? "text-white bg-gray-800 px-2 py-1 rounded ml-2"
                    : "text-black bg-gray-200 px-2 py-1 rounded ml-2"
                }
              >
                {game.turn() === "w" ? "White" : "Black"}
              </span>
            </div>
            <div>
              <span className="font-medium">You are:</span>
              <span
                className={
                  isPlayerWhite
                    ? "text-white bg-gray-800 px-2 py-1 rounded ml-2"
                    : "text-black bg-gray-200 px-2 py-1 rounded ml-2"
                }
              >
                {isPlayerWhite ? "White" : "Black"}
              </span>
            </div>
            <div>
              <span className="font-medium">Moves:</span> {moveHistory.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessBoard;
