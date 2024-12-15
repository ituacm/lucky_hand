import React, { useState } from "react";
import "./GameOver.css";
import ListPlayers from "../ListPlayers/ListPlayers";

function GameOver({ gameInfo }) {
  return (
    <div className="gameover-container">
      <h1 className="gameover-header">Game Over</h1>
      <h1 className="gameover-header">Winner</h1>
      <p className="gameover-winner">{gameInfo.winner}</p>
      <ListPlayers
        players={gameInfo.rankings.concat().reverse()}
        header={"Leaderboard"}
        ranking={true}
      />
      <button
        className="primary-button"
        onClick={() => {
          window.location.href = "/";
        }}
      >
        Return to entry page
      </button>
    </div>
  );
}

export default GameOver;
