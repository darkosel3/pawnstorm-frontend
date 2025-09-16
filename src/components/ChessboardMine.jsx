import React, { useState, useRef, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useAuth } from "../contexts/AuthContext";

import io from "socket.io-client";

const ChessBoardMine = ({
  gameId,
  isPlayerWhite = true,
  playerType = "guest",
  playerName = null,
  onGameEnd,
  initialPGN = "",
}) => {
  // Game state
  const { user, isGuest } = useAuth();
  const gameRef = useRef(new Chess());
  const game = gameRef.current;
  const [gamePosition, setGamePosition] = useState(game.fen());
  const [moveHistory, setMoveHistory] = useState([]);
  const [gameStatus, setGameStatus] = useState("");

  // Socket.io state
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [playerColor, setPlayerColor] = useState(
    isPlayerWhite ? "white" : "black"
  );
  const [opponent, setOpponent] = useState(null);
  const [isMyTurn, setIsMyTurn] = useState(true);
  const [gameInfo, setGameInfo] = useState(null);

  // UI state
  const [isSearching, setIsSearching] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  function updateTurn(game, color) {
    const currentTurn = game.turn(); // 'w' ili 'b'
    const myTurnIndicator = color === "white" ? "w" : "b";
    return currentTurn === myTurnIndicator;
  }

  // Initialize socket connection
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:3001");
      const socket = socketRef.current;

      socket.on("connect", () => {
        console.log("✅ Connected to server");
        setIsConnected(true);
        setConnectionStatus("Connected");
      });

      socket.on("disconnect", () => {
        console.log("❌ Disconnected from server");
        setIsConnected(false);
        setConnectionStatus("Disconnected");
      });

      // Matchmaking events
      socket.on("waitingForOpponent", () => {
        setConnectionStatus("Waiting for opponent...");
        setIsSearching(true);
      });
      socket.on("gameFound", (data) => {
        console.log("🎮 Game found:", data);
        setGameInfo(data);
        setPlayerColor(data.yourColor);
        console.log(data.yourColor);
        setOpponent(
          data.yourColor === "white" ? data.blackPlayer : data.whitePlayer
        );
        setIsSearching(false);
        setConnectionStatus("Game started!");

        const newGame = new Chess();
        gameRef.current = newGame;
        setGamePosition(newGame.fen());
        setMoveHistory([]);
        // const myTurnIndicator = data.yourColor === "white" ? "w" : "b";
        setIsMyTurn(newGame.turn() == "w" ? true : false);
      });

      socket.on("gameJoined", (data) => {
        console.log("↩️ Rejoined game:", data);
        setGameInfo(data);
        setPlayerColor(data.yourColor);
        setOpponent(
          data.yourColor === "white" ? data.blackPlayer : data.whitePlayer
        );
        setConnectionStatus("Reconnected to game");

        // Restore game state
        const newGame = new Chess(data.gameState);
        gameRef.current = newGame;
        setGamePosition(newGame.fen());
        setMoveHistory(data.moveHistory || newGame.history({ verbose: true }));
        setIsMyTurn(newGame.turn() == "w" ? true : false);
      });

      socket.on("moveMade", (data) => {
        console.log("FULL DATA FROM SERVER:", JSON.stringify(data, null, 2));

        console.log("♟️ Move received:", data.move);

        // Učitaj celu poziciju sa servera
        const newGame = new Chess(data.gameState);

        // Update lokalnog stanja
        gameRef.current = newGame;
        setGamePosition(newGame.fen());
        setMoveHistory(data.moveHistory);
        console.log(gameRef.current.turn());
        console.log("moveMade(game,playerColor)", game, playerColor);
        // Odredi da li je moj red
        console.log("DATA>ISMYTURN0", data.isMyTurn);
        setIsMyTurn(data.isMyTurn);
      });
      //function updateTurn(game, color) {
      //   const currentTurn = game.turn(); // 'w' ili 'b'
      //   const myTurnIndicator = color === "white" ? "w" : "b";
      //   return currentTurn === myTurnIndicator;
      // }

      socket.on("invalidMove", (data) => {
        console.log("❌ Invalid move:", data);
        setGameStatus(`Invalid move: ${data.reason}`);
        setTimeout(() => setGameStatus(""), 3000);
      });

      socket.on("gameOver", (result) => {
        console.log("🏁 Game over:", result);
        let statusMessage = "";

        switch (result.type) {
          case "checkmate":
            statusMessage = `Checkmate! ${result.winner.name} wins!`;
            break;
          case "draw":
            statusMessage = `Draw by ${result.reason}!`;
            break;
          case "resignation":
            statusMessage = `${result.resigned.name} resigned. ${result.winner.name} wins!`;
            break;
          default:
            statusMessage = "Game over";
        }

        setGameStatus(statusMessage);
        onGameEnd && onGameEnd(result);
      });

      socket.on("opponentDisconnected", (data) => {
        setConnectionStatus(`${data.disconnectedPlayer.name} disconnected`);
        setGameStatus(
          "Your opponent disconnected. You can wait or exit the game."
        );
      });

      socket.on("newMessage", (data) => {
        setChatMessages((prev) => [...prev, data]);
      });
    }
    return () => {
      socket.disconnect();
    };
  }, []);

  // Initialize game from PGN if provided
  useEffect(() => {
    if (initialPGN) {
      const newGame = new Chess();
      try {
        newGame.loadPgn(initialPGN);
        gameRef.current = newGame;
        setGamePosition(newGame.fen());
        setMoveHistory(newGame.history({ verbose: true }));
      } catch (error) {
        console.error("Error loading PGN:", error);
      }
    }
  }, [initialPGN]);

  // Find opponent function
  const findOpponent = () => {
    if (socketRef.current && !isSearching) {
      console.log(user);
      socketRef.current.emit("findOpponent", {
        playerType,
        playerName: user?.name || "Guest",
        playerId: user?.player_id || null, // 👈 OVO ide do servera
      });
      setIsSearching(true);
    }
  };

  // Cancel search
  const cancelSearch = () => {
    if (socketRef.current && isSearching) {
      socketRef.current.emit("cancelSearch");
      setIsSearching(false);
      setConnectionStatus("Search cancelled");
    }
  };

  // Make move function
  const makeMove = (sourceSquare, targetSquare, piece) => {
    try {
      // Napravi privremenu kopiju da proveriš da li je potez validan
      const testGame = new Chess(game.fen());
      const move = testGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece && piece.length > 1 ? piece[1].toLowerCase() : "q",
      });

      if (move) {
        // Pošalji potez serveru — server će vratiti novi state kroz "moveMade"
        socketRef.current.emit("makeMove", {
          gameId: gameInfo?.gameId,
          move: {
            from: sourceSquare,
            to: targetSquare,
            promotion: piece && piece.length > 1 ? piece[1].toLowerCase() : "q",
          },
        });

        return true; // react-chessboard će prikazati potez dok ne stigne server
      }
    } catch (error) {
      console.error("Invalid move:", error);
    }

    return false;
  };

  // Handle piece drop
  const onDrop = (sourceSquare, targetSquare, piece) => {
    console.log("Move attempted:", { sourceSquare, targetSquare, piece });

    if (!isConnected) {
      console.log("Not connected to server");
      return false;
    }

    return makeMove(sourceSquare, targetSquare, piece);
  };

  // Resign game
  const resignGame = () => {
    if (gameInfo) {
      socketRef.current.emit("resignGame", { gameId: gameInfo.gameId });
    }
  };

  // Send chat message
  const sendMessage = () => {
    if (newMessage.trim() && socketRef.current && gameInfo) {
      socketRef.current.emit("sendMessage", {
        gameId: gameInfo.gameId,
        message: newMessage.trim(),
      });
      setNewMessage("");
    }
  };

  // If no game is found yet
  if (!gameInfo && !isSearching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Find Opponent</h2>
          <p className="text-gray-600 mb-6">Status: {connectionStatus}</p>
          <button
            onClick={findOpponent}
            disabled={!isConnected}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-semibold"
          >
            {isConnected ? "Find Opponent" : "Connecting..."}
          </button>
        </div>
      </div>
    );
  }

  // If searching for opponent
  if (isSearching && !gameInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Searching for opponent...</h2>
          <p className="text-gray-600 mb-6">{connectionStatus}</p>
          <button
            onClick={cancelSearch}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
          >
            Cancel Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
      {/* Chess Board */}
      <div className="flex-shrink-0">
        <div className="mb-4">
          <h3 className="text-xl font-bold">Chess Game</h3>
          {opponent && (
            <div className="mt-2 text-sm text-gray-600">
              <p>
                Playing against:{" "}
                <span className="font-semibold">{opponent.name}</span>
              </p>
              <p>
                You are:{" "}
                <span className="font-semibold capitalize">{playerColor}</span>
              </p>
              <p>
                Status:{" "}
                <span
                  className={isMyTurn ? "text-green-600" : "text-orange-600"}
                >
                  {isMyTurn ? "Your turn" : "Opponent's turn"}
                </span>
              </p>
            </div>
          )}
          {gameStatus && (
            <div
              className={`mt-2 p-2 rounded ${
                gameStatus.includes("Check")
                  ? "bg-yellow-100 text-yellow-800"
                  : gameStatus.includes("wins") ||
                    gameStatus.includes("Checkmate")
                  ? "bg-green-100 text-green-800"
                  : gameStatus.includes("disconnected")
                  ? "bg-red-100 text-red-800"
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
            boardOrientation={playerColor}
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
                onClick={resignGame}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Resign
              </button>
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Exit Game
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar with Move History and Chat */}
      <div className="w-80 flex-shrink-0 space-y-4">
        {/* Move History */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-lg font-semibold mb-3">Move History</h4>
          <div className="max-h-64 overflow-y-auto">
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

        {/* Chat */}
        {gameInfo && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-lg font-semibold mb-3">Chat</h4>
            <div className="h-32 overflow-y-auto mb-2 border rounded p-2">
              {chatMessages.map((msg, index) => (
                <div key={index} className="text-sm mb-1">
                  <span className="font-semibold">{msg.sender}:</span>{" "}
                  {msg.message}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-2 py-1 border rounded text-sm"
              />
              <button
                onClick={sendMessage}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                Send
              </button>
            </div>
          </div>
        )}

        {/* Game Info */}
        <div className="bg-white p-4 rounded-lg shadow">
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
            <div>
              <span className="font-medium">Connection:</span>
              <span
                className={`ml-2 ${
                  isConnected ? "text-green-600" : "text-red-600"
                }`}
              >
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessBoardMine;
