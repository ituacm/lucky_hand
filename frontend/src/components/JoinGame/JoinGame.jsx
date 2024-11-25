import React, { useRef } from "react";
import "./JoinGame.css";

function JoinGame({ socket }) {
  const gameIdRef = useRef();
  const playerNameRef = useRef();

  const handleSubmit = (event) => {
    event.preventDefault();
    const gameId = gameIdRef.current.value;
    const playerName = playerNameRef.current.value;
    console.log(gameId, playerName);
    socket.emit("joinGame", { gameId: gameId, playerName: playerName });
  };

  return (
    <div className="join-game-container">
      <h1>Join Game</h1>
      <form className="join-game-form-container" onSubmit={handleSubmit}>
        <label>
          Game ID:
          <input type="text" name="gameId" ref={gameIdRef} />
        </label>
        <label>
          Player Name:
          <input type="text" name="playerName" ref={playerNameRef} />
        </label>
        <input type="submit" value="Join Game" />
      </form>
    </div>
  );
}

export default JoinGame;
