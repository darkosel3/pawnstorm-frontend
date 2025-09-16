import React from "react";
import { useAuth } from "../contexts/AuthContext";
import ChessBoardMine from "./ChessBoardMine";

const RegisteredGame = () => {
  const { user } = useAuth();

  const handleGameEnd = (result) => {
    console.log("Game ended:", result);
    // Ovde možeš dodati logiku za čuvanje u bazi
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-2">
          <span className="font-semibold">{user?.name}</span>
          <span className="text-sm text-gray-500 ml-2">Registered Player</span>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <ChessBoardMine
          playerType="registered"
          playerName={user?.username}
          playerId={user?.player_id}
          onGameEnd={handleGameEnd}
        />
      </div>
    </div>
  );
};

export default RegisteredGame;
