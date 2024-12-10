import React, { useState } from "react";
import "./WaitingChoices.css";

function WaitingChoices({
  gameInfo,
  socket,
  isAdmin,
  fetchGameInfo,
  isEliminated,
}) {
  const [madeChoice, setMadeChoice] = useState(false);
  return (
    <div className="waiting-choices-container">
      <h1>Round {gameInfo.round}</h1>
      {isEliminated || madeChoice ? (
        <>Wait for others...</>
      ) : (
        <div className="waiting-choices-buttons">
          <button
            onClick={() => {
              socket.emit("makeChoice", { choice: "left" });
              setMadeChoice(true);
            }}
          >
            Left
          </button>
          <button
            onClick={() => {
              socket.emit("makeChoice", { choice: "right" });
              setMadeChoice(true);
            }}
          >
            Right
          </button>
        </div>
      )}
      {isAdmin && (
        <button
          onClick={() => {
            socket.emit("eliminatePlayers");
          }}
        >
          Eliminate
        </button>
      )}
    </div>
  );
}

export default WaitingChoices;
