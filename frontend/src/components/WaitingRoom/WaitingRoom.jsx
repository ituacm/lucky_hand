import React, { useState, useEffect } from "react";
import axios from "axios";
import "./WaitingRoom.css";
import ListPlayers from "../ListPlayers/ListPlayers";

function WaitingRoom({ socket, socketInfo, isAdmin }) {
  const [players, setPlayers] = useState([]);
  const [gameInfo, setGameInfo] =useState({});

  const fetchPlayers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/games/${socketInfo.gameId}/players`
      );
      setPlayers(response.data);
      const gameInfoResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/games/${socketInfo.gameId}`);
      setGameInfo(gameInfoResponse.data);
    } catch (err) {
      console.error(err);
      alert(`Failed to fetch game data: ${err.response?.data || err.message || err}`);
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
    socket.on("error", (error) => {
      console.error("Waiting room error:", error);
      alert(`Waiting Room Error: ${error}`);
    });

    return () => {
      socket.off("playerJoined", handlePlayersChanged);
      socket.off("playerLeft", handlePlayersChanged);
      socket.off("error");
    };
  }, [socket]);

  return (
    <div className="waiting-room-container">
      <p className="waiting-room-text">Welcome to the room:</p>
      <h1 className="waiting-room-header">{gameInfo.name}</h1>
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
              try {
                socket.emit("startGame");
              } catch (err) {
                console.error("Error starting game:", err);
                alert(`Failed to start game: ${err.message || err}`);
              }
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
