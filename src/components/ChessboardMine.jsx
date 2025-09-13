// src/components/ChessBoard.jsx
import React, { useState, useRef, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

const ChessBoard = ({
  gameId,
  isPlayerWhite = true,
  onGameEnd,
  initialPGN = "",
}) => {
  const gameRef = useRef(new Chess());
  const game = gameRef.current; // Add this line

  const [gamePosition, setGamePosition] = useState(game.fen());
  const [moveHistory, setMoveHistory] = useState([]);
  const [gameStatus, setGameStatus] = useState("");

  // Initialize game from PGN if provided
  useEffect(() => {
    if (initialPGN) {
      const newGame = new Chess();
      try {
        newGame.loadPgn(initialPGN);
        setGame(newGame);
        setGamePosition(newGame.fen());
        setMoveHistory(newGame.history({ verbose: true }));
      } catch (error) {
        console.error("Error loading PGN:", error);
      }
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
  }, [gamePosition, onGameEnd]);

  const makeMove = (sourceSquare, targetSquare, piece) => {
    // Create a copy of the game to avoid mutating state directly
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece,
      });

      if (move) {
        setGamePosition(game.fen());
        setMoveHistory(game.history({ verbose: true }));
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

  // v4.x API - onPieceDrop function
  const onDrop = (sourceSquare, targetSquare, piece) => {
    console.log("value of piece", piece);
    let promotionPiece = "wQ";
    if (piece && !piece.includes("wP")) {
      promotionPiece = piece.split("")[1].toLowerCase();
    }
    console.log("Move attempted:", { sourceSquare, targetSquare });

    // Only allow moves if it's player's turn (for local game, allow all moves)
    if (gameId && gameId !== "local") {
      const playerColor = isPlayerWhite ? "w" : "b";
      if (game.turn() !== playerColor) {
        console.log("Not your turn!");
        return false;
      }
    }

    return makeMove(sourceSquare, targetSquare, promotionPiece);
  };

  const resetGame = () => {
    gameRef.current = new Chess(); // Create new instance
    setGamePosition(newGame.fen());
    setMoveHistory([]);
    setGameStatus("");
  };

  const undoMove = () => {
    const move = game.undo();

    if (move) {
      setGamePosition(game.fen());
      setMoveHistory(game.history({ verbose: true }));
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
      {/* Chess Board */}
      <div className="flex-shrink-0">
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

        <div className="w-96 mx-auto">
          <Chessboard
            autoPromoteToQueen={false}
            position={gamePosition}
            onPieceDrop={onDrop}
            boardOrientation={isPlayerWhite ? "white" : "black"}
            customBoardStyle={{
              borderRadius: "4px",
              boxShadow: "0 5px 15px rgba(0, 0, 0, 0.5)",
            }}
            customDarkSquareStyle={{ backgroundColor: "#769656" }}
            customLightSquareStyle={{ backgroundColor: "#eeeed2" }}
          />
        </div>

        {/* Game Controls */}
        <div className="mt-4 w-96 mx-auto">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                onClick={undoMove}
                disabled={moveHistory.length === 0}
                className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
              >
                Undo
              </button>
              <button
                onClick={resetGame}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                New Game
              </button>
            </div>

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
      <div className="w-80 flex-shrink-0">
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-lg font-semibold mb-3">Move History</h4>
          <div className="max-h-96 overflow-y-auto move-history">
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
            <div>
              <span className="font-medium">Status:</span>
              <span className="ml-2">
                {game.isCheck()
                  ? "Check"
                  : game.isGameOver()
                  ? "Game Over"
                  : "Playing"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessBoard;
