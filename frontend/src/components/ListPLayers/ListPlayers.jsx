import React from "react";
import "./ListPlayers.css";

function ListPlayers({ players, header, ranking = false }) {
  return (
    <div className="list-players-container">
      {header && <h2 className="list-players-header">{header}</h2>}
      <div div className="list-players">
        {players.map((player, index) => (
          <p className="list-player">
            {ranking ? `${index + 1}- ` : null}
            {player.name ? player.name : player}
          </p>
        ))}
      </div>
    </div>
  );
}

export default ListPlayers;
