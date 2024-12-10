import React from "react";
import "./Elimination.css";

function Elimination({ isELiminated, isAdmin, socket }) {
  return (
    <div className="elimination-container">
      {isELiminated ? <h1>You are eliminated</h1> : <h1>You Suvived!</h1>}
      {isAdmin && (
        <button
          onClick={() => {
            socket.emit("nextRound");
          }}
        >
          Next Round
        </button>
      )}
    </div>
  );
}

export default Elimination;
