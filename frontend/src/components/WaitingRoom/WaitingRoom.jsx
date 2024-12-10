import React, { useState, useEffect } from "react";
import axios from "axios";
import "./WaitingRoom.css";

function WaitingRoom({
  socket,
  socketInfo,
  setSocketInfo,
  isAdmin,
  fetchGameInfo,
}) {
  const [players, setPlayers] = useState([]);

  const fetchPlayers = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/games/${socketInfo.gameId}/players`
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
      {players.map((player) => (
        <div key={player.id}>{player.name}</div>
      ))}
      {isAdmin && (
        <button
          onClick={() => {
            socket.emit("startGame");
          }}
        >
          Start Game
        </button>
      )}
    </div>
  );
}

export default WaitingRoom;
