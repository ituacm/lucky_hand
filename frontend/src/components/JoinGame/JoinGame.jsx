import React, { useRef } from "react";
import "./JoinGame.css";

function JoinGame({ socket, setIsJoining }) {
  const gameIdRef = useRef();
  const playerNameRef = useRef();

  const handleSubmit = (event) => {
    event.preventDefault();
    const gameId = gameIdRef.current.value;
    const playerName = playerNameRef.current.value;
    console.log(gameId, playerName);
    
    try {
      socket.emit("joinGame", { gameId: gameId, playerName: playerName });
    } catch (err) {
      console.error("Error joining game:", err);
      alert(`Failed to join game: ${err.message || err}`);
    }
  };

  return (
    <div className="join-game-container">
      <h1>Join Game</h1>
      <p className="join-game-text">
        Join a game room and see who has the lucky hand
      </p>
      <form className="join-game-form-container" onSubmit={handleSubmit}>
        <label className="join-game-form-label">
          Game ID:
          <input
            type="text"
            name="gameId"
            ref={gameIdRef}
            className="join-game-form-input"
          />
        </label>
        <label className="join-game-form-label">
          Player Name:
          <input
            type="text"
            name="playerName"
            ref={playerNameRef}
            className="join-game-form-input"
          />
        </label>
        <input
          type="submit"
          value="Join Game"
          className="join-game-form-submit"
        />
      </form>
      <p
        className="join-game-redirect"
        onClick={() => {
          setIsJoining(false);
        }}
      >
        Wanna create your own game room?
      </p>
    </div>
  );
}

export default JoinGame;
