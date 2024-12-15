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
      <h1 className="waiting-choices-header">Round {gameInfo.round}</h1>
      {isEliminated || madeChoice ? (
        <>Wait for others...</>
      ) : (
        <>
          <p className="waiting-choices-text">
            Choose your side. Left or right.
          </p>
          <div className="waiting-choices-buttons">
            <button
              className="primary-button waiting-choices-button"
              onClick={() => {
                socket.emit("makeChoice", { choice: "left" });
                setMadeChoice(true);
              }}
            >
              Left
            </button>
            <button
              className="primary-button waiting-choices-button"
              onClick={() => {
                socket.emit("makeChoice", { choice: "right" });
                setMadeChoice(true);
              }}
            >
              Right
            </button>
          </div>
        </>
      )}
      {isAdmin && (
        <button
          className="primary-button"
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
