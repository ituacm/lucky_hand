import React, { useRef } from "react";
import "./CreateGame.css";

function CreateGame({ socket }) {
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
      <form className="create-game-form-container" onSubmit={handleSubmit}>
        <label>
          Game Name:
          <input type="text" name="gameName" ref={gameNameRef} />
        </label>
        <label>
          Player Name:
          <input type="text" name="playerName" ref={playerNameRef} />
        </label>
        <input type="submit" value="Create Game" />
      </form>
    </div>
  );
}

export default CreateGame;
