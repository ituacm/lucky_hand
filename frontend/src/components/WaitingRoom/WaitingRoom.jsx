import React, { useState, useEffect } from "react";
import axios from "axios";
import "./WaitingRoom.css";
import ListPlayers from "../ListPlayers/ListPlayers";

function WaitingRoom({ socket, socketInfo, isAdmin }) {
  const [players, setPlayers] = useState([]);

  const fetchPlayers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}games/${socketInfo.gameId}/players`
      );
      setPlayers(response.data);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetchPlayers();
  }, [socketInfo.gameId]);

  useEffect(() => {
    const handlePlayersChanged = () => {
      fetchPlayers();
    };

    socket.on("playerJoined", handlePlayersChanged);
    socket.on("playerLeft", handlePlayersChanged);

    return () => {
      socket.off("playerJoined", handlePlayersChanged);
    };
  }, [socket]);

  return (
    <div className="waiting-room-container">
      <p className="waiting-room-text">Welcome to the room:</p>
      <h1 className="waiting-room-header">OYUN</h1>
      <h2 className="waiting-room-header">{socketInfo.gameId}</h2>
      <p className="waiting-room-text">
        Share this id with your friends to join the game!
      </p>
      <ListPlayers players={players} header="Players in this room:" />
      {isAdmin ? (
        <>
          <p className="waiting-room-start-game-text">
            You are the host. Start when you feel ready.
          </p>
          <button
            className="waiting-room-start-game"
            onClick={() => {
              socket.emit("startGame");
            }}
          >
            Start Game
          </button>
        </>
      ) : (
        <p className="waiting-room-start-game-text">
          Waiting for the host to start the game...
        </p>
      )}
    </div>
  );
}

export default WaitingRoom;
