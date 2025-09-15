import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

function TestGame() {
  useEffect(() => {
    socket.emit("joinGame", "game123");

    socket.on("gameState", (fen) => {
      console.log("📥 Novo stanje table:", fen);
    });

    socket.on("invalidMove", (move) => {
      console.log("❌ Invalid move:", move);
    });

    socket.on("gameOver", (data) => {
      console.log("🏁 Game Over:", data);
    });
  }, []);

  return <div>Test Game Page</div>;
}

export default TestGame;
