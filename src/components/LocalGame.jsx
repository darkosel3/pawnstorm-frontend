import React from "react";
import { useParams } from "react-router-dom";
import ChessBoard from "./Chessboard.jsx";

const LocalGame = () => {
  const { gameId } = useParams();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Chess Board */}
      <div className="container mx-auto p-4">
        <ChessBoard
          gameId={gameId}
          isPlayerWhite={true}
          localGame={true} // Flag za local game
        />
      </div>
      {/* Minimal header bez navigation */}
    </div>
  );
};

export default LocalGame;
