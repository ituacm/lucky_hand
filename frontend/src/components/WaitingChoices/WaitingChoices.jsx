import React, { useState, useEffect } from "react";
import "./WaitingChoices.css";

function WaitingChoices({
  gameInfo,
  socket,
  isAdmin,
  fetchGameInfo,
  isEliminated,
}) {
  const [madeChoice, setMadeChoice] = useState(false);

  useEffect(() => {
    socket.on("error", (error) => {
      console.error("Waiting choices error:", error);
      alert(`Game Error: ${error}`);
    });

    return () => {
      socket.off("error");
    };
  }, [socket]);
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
                try {
                  socket.emit("makeChoice", { choice: "left" });
                  setMadeChoice(true);
                } catch (err) {
                  console.error("Error making choice:", err);
                  alert(`Failed to make choice: ${err.message || err}`);
                }
              }}
            >
              Left
            </button>
            <button
              className="primary-button waiting-choices-button"
              onClick={() => {
                try {
                  socket.emit("makeChoice", { choice: "right" });
                  setMadeChoice(true);
                } catch (err) {
                  console.error("Error making choice:", err);
                  alert(`Failed to make choice: ${err.message || err}`);
                }
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
            try {
              socket.emit("eliminatePlayers");
            } catch (err) {
              console.error("Error eliminating players:", err);
              alert(`Failed to eliminate players: ${err.message || err}`);
            }
          }}
        >
          Eliminate
        </button>
      )}
    </div>
  );
}

export default WaitingChoices;
