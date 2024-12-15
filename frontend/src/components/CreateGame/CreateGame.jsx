import React, { useRef } from "react";
import "./CreateGame.css";

function CreateGame({ socket, setIsJoining }) {
  const gameNameRef = useRef();
  const playerNameRef = useRef();

  const handleSubmit = (event) => {
    event.preventDefault();
    const gameName = gameNameRef.current.value;
    const playerName = playerNameRef.current.value;
    console.log(gameName, playerName);
    socket.emit("createGame", { gameName: gameName, playerName: playerName });
  };

  return (
    <div className="create-game-container">
      <h1>Create Game</h1>
      <p className="create-game-text">
        Create a game room and invite your fellas
      </p>
      <form className="create-game-form-container" onSubmit={handleSubmit}>
        <label className="create-game-form-label">
          Game Name
          <input
            type="text"
            name="gameName"
            ref={gameNameRef}
            className="create-game-form-input"
            required
          />
        </label>
        <label className="create-game-form-label">
          Player Name
          <input
            type="text"
            name="playerName"
            ref={playerNameRef}
            className="create-game-form-input"
            required
          />
        </label>
        <input
          type="submit"
          value="Create Game"
          className="create-game-form-submit"
        />
      </form>
      <p
        className="create-game-redirect"
        onClick={() => {
          setIsJoining(true);
        }}
      >
        Wanna join an existing game room?
      </p>
    </div>
  );
}

export default CreateGame;
